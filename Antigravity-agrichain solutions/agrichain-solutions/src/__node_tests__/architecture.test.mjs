import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const root = process.cwd();

async function fileExists(relativePath) {
  await stat(path.join(root, relativePath));
}

test("package scripts use Next standalone build without next export", async () => {
  const pkg = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
  assert.equal(pkg.scripts.build, "next build");
  assert.doesNotMatch(pkg.scripts.build, /next export/);
  assert.equal(pkg.scripts.test, 'node --test "src/__node_tests__/*.test.mjs"');
});

test("Prisma schema contains production SaaS, blockchain, AI, i18n, and logistics models", async () => {
  const schema = await readFile(path.join(root, "prisma", "schema.prisma"), "utf8");
  for (const model of [
    "User",
    "Farm",
    "Product",
    "Order",
    "WalletTransaction",
    "LogisticsTrip",
    "TraceRecord",
    "BlockchainAnchor",
    "AIConversation",
    "VoiceCommand",
    "LocaleCatalog",
    "AuditLog",
  ]) {
    assert.match(schema, new RegExp(`model ${model} \\{`));
  }
  assert.match(schema, /provider = "postgresql"/);
});

test("critical App Router APIs and Server Actions exist", async () => {
  for (const route of [
    "src/app/api/auth/[...nextauth]/route.ts",
    "src/app/api/auth/register/route.ts",
    "src/app/api/ai/chat/route.ts",
    "src/app/api/ai/voice/transcribe/route.ts",
    "src/app/api/ai/voice/speak/route.ts",
    "src/app/api/uploads/route.ts",
    "src/app/api/blockchain/anchor/route.ts",
    "src/app/api/logistics/events/route.ts",
    "src/app/actions/farms.ts",
    "src/app/actions/products.ts",
    "src/app/actions/orders.ts",
    "src/app/actions/wallet.ts",
    "src/app/actions/trace.ts",
  ]) {
    await fileExists(route);
  }
});

test("dashboard pages no longer import mock-data", async () => {
  const pages = [
    "src/app/dashboard/page.tsx",
    "src/app/dashboard/marketplace/page.tsx",
    "src/app/dashboard/orders/page.tsx",
    "src/app/dashboard/wallet/page.tsx",
    "src/app/dashboard/tracking/page.tsx",
    "src/app/dashboard/traceability/page.tsx",
    "src/app/dashboard/education/page.tsx",
    "src/app/dashboard/ai-advisor/page.tsx",
  ];
  for (const page of pages) {
    const source = await readFile(path.join(root, page), "utf8");
    assert.doesNotMatch(source, /mock-data|mockOrders|mockProducts|mockCourses|mockTraceRecords/);
  }
});
