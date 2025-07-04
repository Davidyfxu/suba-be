import supabase from "../config/supabase.js";

// Auth middleware function
const requireAuth = async (request, reply) => {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    reply.code(401).send({ error: "Missing or invalid authorization header" });
    return;
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      reply.code(401).send({ error: "Invalid token" });
      return;
    }

    request.user = user;
  } catch (error) {
    reply.code(401).send({ error: "Authentication failed" });
  }
};

export { requireAuth };
