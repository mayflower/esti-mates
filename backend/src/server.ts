// backend/src/server.ts
import express from "express";
import { createServer } from "node:http";

const app = express();
const httpServer = createServer(app);

const PORT = process.env.PORT || 3001;

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
