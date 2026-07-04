import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const API_BASE = "https://caerphilly-api.onrender.com";

export default defineTool({
  name: "get_leaderboard",
  title: "Get leaderboard",
  description:
    "Fetch the top residents on the sustainability leaderboard, ranked by total points earned.",
  inputSchema: {
    limit: z
      .number()
      .int()
      .min(1)
      .max(100)
      .default(10)
      .describe("Maximum number of entries to return (1-100)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ limit }) => {
    const res = await fetch(`${API_BASE}/leaderboard`);
    if (!res.ok) {
      return {
        content: [{ type: "text", text: `Leaderboard fetch failed: ${res.status}` }],
        isError: true,
      };
    }
    const data = await res.json();
    const rows = Array.isArray(data) ? data : [];
    const top = rows
      .slice()
      .sort((a: any, b: any) => (b.total_points || 0) - (a.total_points || 0))
      .slice(0, limit)
      .map((r: any, i: number) => ({
        rank: i + 1,
        name: r.display_name ?? r.username ?? "Anonymous",
        total_points: r.total_points ?? 0,
      }));
    return {
      content: [{ type: "text", text: JSON.stringify(top, null, 2) }],
      structuredContent: { leaderboard: top },
    };
  },
});
