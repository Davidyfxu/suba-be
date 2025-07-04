import supabase from "../config/supabase.js";
import { requireAuth } from "../middleware/auth.js";

async function authRoutes(fastify, options) {
  // Register user
  fastify.post("/register", async (request, reply) => {
    const { email, password } = request.body;

    if (!email || !password) {
      return reply.code(400).send({ error: "Email and password are required" });
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return reply.code(400).send({ error: error.message });
      }

      const { data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return {
        message: "Registration successful",
        user: data.user,
        session: data.session,
      };
    } catch (error) {
      return reply.code(500).send({ error: "Registration failed" });
    }
  });

  // Login user
  fastify.post("/login", async (request, reply) => {
    const { email, password } = request.body;

    if (!email || !password) {
      return reply.code(400).send({ error: "Email and password are required" });
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return reply.code(400).send({ error: error.message });
      }

      return {
        message: "Login successful",
        user: data.user,
        session: data.session,
      };
    } catch (error) {
      return reply.code(500).send({ error: "Login failed" });
    }
  });

  // Google OAuth login
  fastify.post("/google", async (request, reply) => {
    const { access_token } = request.body;

    if (!access_token) {
      return reply.code(400).send({ error: "Access token is required" });
    }

    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: access_token,
      });

      if (error) {
        return reply.code(400).send({ error: error.message });
      }

      return {
        message: "Google login successful",
        user: data.user,
        session: data.session,
      };
    } catch (error) {
      return reply.code(500).send({ error: "Google login failed" });
    }
  });

  // Get Google OAuth URL
  fastify.get("/google/url", async (request, reply) => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo:
            process.env.GOOGLE_REDIRECT_URL ||
            "http://localhost:3000/auth/callback",
        },
      });

      if (error) {
        return reply.code(400).send({ error: error.message });
      }

      return {
        url: data.url,
      };
    } catch (error) {
      return reply.code(500).send({ error: "Failed to get Google OAuth URL" });
    }
  });

  // Google OAuth callback
  fastify.get("/callback", async (request, reply) => {
    const { code } = request.query;

    if (!code) {
      return reply.code(400).send({ error: "Authorization code is required" });
    }

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        return reply.code(400).send({ error: error.message });
      }

      return {
        message: "Google OAuth callback successful",
        user: data.user,
        session: data.session,
      };
    } catch (error) {
      return reply.code(500).send({ error: "OAuth callback failed" });
    }
  });

  // Logout user
  fastify.post(
    "/logout",
    { preHandler: requireAuth },
    async (request, reply) => {
      const authHeader = request.headers.authorization;
      const token = authHeader.replace("Bearer ", "");

      try {
        const { error } = await supabase.auth.signOut(token);

        if (error) {
          return reply.code(400).send({ error: error.message });
        }

        return { message: "Logout successful" };
      } catch (error) {
        return reply.code(500).send({ error: "Logout failed" });
      }
    },
  );
}

export default authRoutes;
