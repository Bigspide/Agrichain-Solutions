import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = Number(process.env.PORT || 3000);
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000,http://127.0.0.1:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

console.log(`[server] dev=${dev}, hostname=${hostname}, port=${port}`);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

function asFiniteNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

console.log("[server] Calling app.prepare()...");
app.prepare().then(() => {
  console.log("[server] app.prepare() resolved");
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url || "/", true);
      await handle(req, res, parsedUrl);
    } catch (error) {
      console.error("Request handling failed", req.url, error);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  console.log("[server] Creating Socket.IO instance...");
  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || dev || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error("Origin not allowed"));
      },
    },
  });

  console.log("[server] Setting up Socket.IO event handlers...");
  io.on("connection", (socket) => {
    console.log(`[socket.io] new connection: ${socket.id}`);
    socket.on("join_delivery", (deliveryId) => {
      if (typeof deliveryId !== "string" || deliveryId.length > 120) return;
      console.log(`[socket.io] join_delivery: ${deliveryId}`);
      socket.join(`delivery_${deliveryId}`);
    });

    socket.on("update_location", (data) => {
      const deliveryId = typeof data?.deliveryId === "string" ? data.deliveryId : "";
      const lat = asFiniteNumber(data?.lat);
      const lng = asFiniteNumber(data?.lng);
      if (!deliveryId || deliveryId.length > 120 || lat === null || lng === null) {
        console.log(`[socket.io] invalid update_location data:`, data);
        return;
      }
      console.log(`[socket.io] update_location for delivery ${deliveryId}:`, { lat, lng });
      io.to(`delivery_${deliveryId}`).emit("location_updated", {
        lat,
        lng,
        heading: asFiniteNumber(data?.heading),
        speed: asFiniteNumber(data?.speed),
        timestamp: new Date().toISOString(),
      });
    });
  });

  console.log(`[server] Listening on http://${hostname}:${port}`);
  server.listen(port, (err) => {
    if (err) {
      console.error("[server] Error listening:", err);
      return;
    }
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log("> Socket.IO attached");
  });
}).catch((err) => {
  console.error("[server] app.prepare() failed:", err);
});
