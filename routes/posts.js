import supabase from "../config/supabase.js";
import { requireAuth } from "../middleware/auth.js";

async function postsRoutes(fastify, options) {
  // Create a post
  fastify.post("/", { preHandler: requireAuth }, async (request, reply) => {
    const { title, content, idea_flash_id } = request.body;

    if (!title || !content || !idea_flash_id) {
      return reply
        .code(400)
        .send({ error: "Title, content and idea_flash_id are required" });
    }

    try {
      const { data, error } = await supabase
        .from("posts")
        .insert([
          {
            title,
            content,
            idea_flash_id,
            user_id: request.user.id,
            created_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error) {
        return reply.code(400).send({ error: error.message });
      }

      return { message: "Post created successfully", data };
    } catch (error) {
      return reply.code(500).send({ error: "Failed to create post" });
    }
  });

  // Get all posts
  fastify.get("/", async (request, reply) => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        return reply.code(400).send({ error: error.message });
      }

      return { data };
    } catch (error) {
      return reply.code(500).send({ error: "Failed to fetch posts" });
    }
  });

  // Get a specific post
  fastify.get("/:id", async (request, reply) => {
    const { id } = request.params;

    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("idea_flash_id", id)
        .single();

      if (error) {
        return reply.code(404).send({ error: "Post not found" });
      }

      return { data };
    } catch (error) {
      return reply.code(500).send({ error: "Failed to fetch post" });
    }
  });

  // Update a post
  fastify.put("/:id", { preHandler: requireAuth }, async (request, reply) => {
    const { id } = request.params;
    const { title, content } = request.body;

    if (!title || !content) {
      return reply.code(400).send({ error: "Title and content are required" });
    }

    const { data, error } = await supabase
      .from("posts")
      .update({ title, content, updated_at: new Date().toISOString() })
      .eq("user_id", request.user.id)
      .eq("idea_flash_id", id)
      .select();
    try {
      if (error) {
        return reply.code(400).send({ error: error.message });
      }

      if (!data || data.length === 0) {
        return reply
          .code(404)
          .send({ error: "Post not found or unauthorized" });
      }

      return { message: "Post updated successfully", data };
    } catch (error) {
      return reply.code(500).send({ error: "Failed to update post" });
    }
  });

  // Delete a post
  fastify.delete(
    "/:id",
    { preHandler: requireAuth },
    async (request, reply) => {
      const { id } = request.params;

      try {
        const { data, error } = await supabase
          .from("posts")
          .delete()
          .eq("idea_flash_id", id)
          .eq("user_id", request.user.id)
          .select();
        if (error) {
          return reply.code(400).send({ error: error.message });
        }

        if (!data || data.length === 0) {
          return reply
            .code(404)
            .send({ error: "Post not found or unauthorized" });
        }

        return { message: "Post deleted successfully" };
      } catch (error) {
        return reply.code(500).send({ error: "Failed to delete post" });
      }
    },
  );
}

export default postsRoutes;
