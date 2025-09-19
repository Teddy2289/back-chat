// server.ts - CORRIGÉ
import app from "./app";
import http from "http";
import { configureSocket } from "./socket.io/socket";

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

// Configuration Socket.io
const io = configureSocket(server);

// Gestion propre de l'arrêt
process.on("SIGINT", () => {
  console.log("Shutting down gracefully...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port : http://localhost:${PORT}`);
  console.log(
    `🌐 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`
  );
});

// Gestion des erreurs non capturées
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});
