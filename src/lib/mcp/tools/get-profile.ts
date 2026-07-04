import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const API_BASE = "https://caerphilly-api.onrender.com";

export default defineTool({
  name: "get_profile",
  title: "Get resident profile",
  description:
    "Fetch a resident's public sustainability profile summary (points, carbon footprint, display name) by user ID.",
  inputSchema: {
    user_id: z.string().min(1).describe("The resident's user ID."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ user_id }) => {
    const res = await fetch(`${API_BASE}/profile?user_id=${encodeURIComponent(user_id)}`);
    if (!res.ok) {
      return {
        content: [{ type: "text", text: `Profile fetch failed: ${res.status}` }],
        isError: true,
      };
    }
    const p = await res.json();
    const summary = {
      display_name: p?.display_name ?? p?.username ?? null,
      total_points: p?.total_points ?? 0,
      current_footprint: p?.current_footprint ?? 0,
      member_since: p?.created_at ?? null,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(summary, null, 2) }],
      structuredContent: summary,
    };
  },
});
