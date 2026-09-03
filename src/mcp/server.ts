import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

let authCookie: string | null = null;
let currentUsername: string | null = null;

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (authCookie) {
    headers["Cookie"] = authCookie;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    const tokenMatch = setCookie.match(/auth_token=[^;]+/);
    if (tokenMatch) {
      authCookie = tokenMatch[0];
    }
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

const server = new McpServer({
  name: "twitter-agent-client",
  version: "1.0.0",
});

server.tool(
  "login",
  "Authenticate with the Twitter-like system using username and password",
  {
    identifier: z.string().describe("Username or email"),
    password: z.string().describe("User password"),
  },
  async ({ identifier, password }) => {
    try {
      const data = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ identifier, password }),
      });

      currentUsername = data.user.username;

      return {
        content: [
          {
            type: "text",
            text: `Successfully logged in as @${currentUsername} (ID: ${data.user.id})`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Login failed: ${error.message}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  "get_explore_posts",
  "Fetch recent posts from all users on the Explore feed with pagination",
  {
    page: z.number().optional().default(1).describe("Page number (default: 1)"),
    limit: z.number().optional().default(20).describe("Number of posts per page (default: 20)"),
  },
  async ({ page, limit }) => {
    try {
      const data = await apiRequest(`/api/posts?page=${page}&limit=${limit}`);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Failed to fetch explore posts: ${error.message}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  "get_user_posts",
  "Fetch all posts belonging to a specific user or the currently logged-in user",
  {
    username: z
      .string()
      .optional()
      .describe("The username to inspect. If omitted, uses the logged-in user."),
  },
  async ({ username }) => {
    try {
      const targetUser = username || currentUsername;
      if (!targetUser) {
        return {
          content: [
            {
              type: "text",
              text: "No username provided and not logged in. Call the login tool first or specify a username.",
            },
          ],
          isError: true,
        };
      }

      const data = await apiRequest(`/api/users/${targetUser}`);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                user: {
                  id: data.id,
                  username: data.username,
                  displayName: data.displayName,
                  bio: data.bio,
                },
                postCount: data.posts?.length || 0,
                posts: data.posts || [],
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Failed to fetch user posts: ${error.message}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  "create_post",
  "Create and publish a new text post (max 280 characters). Requires being logged in.",
  {
    content: z
      .string()
      .min(1, "Post cannot be empty")
      .max(280, "Post must be 280 characters or less")
      .describe("The text content of the post"),
  },
  async ({ content }) => {
    try {
      if (!authCookie) {
        return {
          content: [{ type: "text", text: "You must be logged in first. Use the 'login' tool." }],
          isError: true,
        };
      }

      const post = await apiRequest("/api/posts", {
        method: "POST",
        body: JSON.stringify({ content }),
      });

      return {
        content: [
          {
            type: "text",
            text: `Post created successfully!\nID: ${post.id}\nContent: "${post.content}"\nCreated at: ${post.createdAt}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Failed to create post: ${error.message}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  "edit_post",
  "Edit an existing post by its ID. Only the original author can edit it.",
  {
    postId: z.string().uuid().describe("The UUID of the post to edit"),
    content: z
      .string()
      .min(1)
      .max(280)
      .describe("The new text content (max 280 characters)"),
  },
  async ({ postId, content }) => {
    try {
      if (!authCookie) {
        return {
          content: [{ type: "text", text: "You must be logged in first." }],
          isError: true,
        };
      }

      const updatedPost = await apiRequest(`/api/posts/${postId}`, {
        method: "PATCH",
        body: JSON.stringify({ content }),
      });

      return {
        content: [
          {
            type: "text",
            text: `Post ${postId} updated successfully!\nNew content: "${updatedPost.content}"`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Failed to edit post: ${error.message}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  "delete_post",
  "Delete a post by its ID. Only the original author can delete it.",
  {
    postId: z.string().uuid().describe("The UUID of the post to delete"),
  },
  async ({ postId }) => {
    try {
      if (!authCookie) {
        return {
          content: [{ type: "text", text: "You must be logged in first." }],
          isError: true,
        };
      }

      const result = await apiRequest(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      return {
        content: [
          {
            type: "text",
            text: `Post ${postId} was deleted successfully. (${result.message})`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Failed to delete post: ${error.message}` }],
        isError: true,
      };
    }
  }
);

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[MCP] Twitter Agent Server running on stdio");
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});