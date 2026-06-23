import { NextResponse } from "next/server";
import { z } from "zod";
import { generateText, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { rateLimit, requestIp } from "@/lib/security/rate-limit";
import { aiTools } from "@/lib/ai-tools";

const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "tool"]),
        content: z.string(),
      })
    )
    .min(1),
  locale: z.string().default("fr"),
  conversationId: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  const ip = requestIp(request.headers);
  const limit = rateLimit(`ai:${ip}`, 20, 60_000);
  if (!limit.ok) {
    return NextResponse.json({ error: "AI rate limit exceeded" }, { status: 429 });
  }

  const parsed = chatSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid AI payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const user = await getCurrentUser();
  const { messages, locale, conversationId } = parsed.data;
  const lastMessage = messages[messages.length - 1]?.content ?? "";

  let currentConversationId = conversationId;
  if (!currentConversationId) {
    const conversation = await prisma.aIConversation.create({
      data: { userId: user?.id, locale, title: lastMessage.slice(0, 80) || "Conversation AgriChain" },
    });
    currentConversationId = conversation.id;
  }

  const history = await prisma.aIMessage.findMany({
    where: { conversationId: currentConversationId },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  // Register the message in DB
  await prisma.aIMessage.create({
    data: { conversationId: currentConversationId, role: "user", content: lastMessage },
  });

  const systemPrompt = `You are AGRI, an Agentic AI for AgriChain. You can perform real actions on the platform.
User Role: ${user?.role || 'unknown'}
User Locale: ${locale}

CAPABILITIES:
1. Marketplace: You can create products for farmers.
2. Finance: You can check wallet balances.
3. Logistics: You can schedule shipments.
4. Education: You can find courses.

GUIDELINES:
- If the user asks to do something (e.g. "Sell my cocoa"), use the appropriate tool.
- Always confirm the action with the user.
- For non-literate users, be extremely simple, empathetic, and use clear instructions.
- Always respond in the requested locale: ${locale}.`;

  try {
    const result = await generateText({
      model: openai(process.env.OPENAI_TEXT_MODEL || "gpt-4o"),
      system: systemPrompt,
      messages: [
        ...history.reverse().map(m => ({ role: m.role, content: m.content })),
        ...messages.map(m => ({ role: m.role, content: m.content })),
      ],
      tools: {
        createProduct: tool({
          description: "Create a new product in the marketplace",
          parameters: z.object({
            name: z.string(),
            price: z.number(),
            quantity: z.number(),
            unit: z.string(),
            description: z.string(),
            category: z.string(),
          }),
          execute: async (args) => await aiTools.createProduct(args),
        }),
        getWalletBalance: tool({
          description: "Get the current wallet balance for a user",
          parameters: z.object({
            userId: z.string(),
          }),
          execute: async (args) => await aiTools.getWalletBalance(args),
        }),
        startShipment: tool({
          description: "Start a logistics shipment for an order",
          parameters: z.object({
            orderId: z.string(),
          }),
          execute: async (args) => await aiTools.startShipment(args),
        }),
        searchCourse: tool({
          description: "Search for educational courses",
          parameters: z.object({
            query: z.string(),
          }),
          execute: async (args) => await aiTools.searchCourse(args),
        }),
      },
      maxSteps: 5,
    });

    const answer = result.text;

    await prisma.aIMessage.create({
      data: { conversationId: currentConversationId, role: "assistant", content: answer, metadata: { provider: "openai" } },
    });

    return NextResponse.json({ message: answer, conversationId: currentConversationId, provider: "openai" });
  } catch (error) {
    console.error("AI Agent execution failed", error);
    return NextResponse.json({ 
      message: "L'IA a rencontré une erreur lors de l'exécution de l'action. Veuillez réessayer.", 
      conversationId: currentConversationId, 
      provider: "error" 
    }, { status: 500 });
  }
}
