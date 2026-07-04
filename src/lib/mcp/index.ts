import { defineMcp } from "@lovable.dev/mcp-js";
import getLeaderboardTool from "./tools/get-leaderboard";
import getProfileTool from "./tools/get-profile";

export default defineMcp({
  name: "caerphilly-eco-mcp",
  title: "Caerphilly Eco Trail MCP",
  version: "0.1.0",
  instructions:
    "Tools for the Caerphilly resident sustainability app. Use `get_leaderboard` to see top residents by points, and `get_profile` to look up a resident's public sustainability summary by user ID.",
  tools: [getLeaderboardTool, getProfileTool],
});
