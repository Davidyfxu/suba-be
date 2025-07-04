// Load environment variables
import dotenv from "dotenv";
dotenv.config();

import fastify from "fastify";
import cors from "@fastify/cors";
import authRoutes from "./routes/auth.js";
import postsRoutes from "./routes/posts.js";

const server = fastify({ logger: true });
const port = process.env.PORT || 3010;

// Register CORS plugin
await server.register(cors, {
  origin: true,
  credentials: true,
});

// Health check endpoint
server.get("/", async (request, reply) => {
  return { message: "Supabase + Fastify Backend Service", status: "running" };
});

// Register routes
await server.register(authRoutes, { prefix: "/auth" });
await server.register(postsRoutes, { prefix: "/posts" });

// Start the server
const start = async () => {
  try {
    await server.listen({ port, host: "0.0.0.0" });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

void start();
