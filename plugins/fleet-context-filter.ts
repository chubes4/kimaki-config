// fleet-context-filter.ts — OpenCode plugin for fleet Kimaki deployments.
//
// Strips Kimaki's built-in memory and scheduling features from the agent context
// when an external system (like Data Machine) manages those concerns.
//
// What it removes:
// 1. MEMORY.md injection — Kimaki reads MEMORY.md from the project directory and
//    injects a condensed TOC on first message. When Data Machine (or another system)
//    manages its own memory files, this creates two competing memory systems.
// 2. "Update MEMORY.md" time-gap reminder — On idle gaps > 10 minutes, Kimaki
//    injects a system-reminder telling the agent to "update MEMORY.md". Redundant
//    when the external system handles persistence.
// 3. Scheduling instructions — The system prompt includes ~50 lines about
//    `kimaki send --send-at`, cron, task management, and proactive reminders.
//    When scheduling is handled externally, this wastes context and can cause
//    the AI to create conflicting scheduled tasks.
//
// How to use:
//   Add to opencode.json:  "plugin": ["/opt/kimaki-config/plugins/fleet-context-filter.ts"]
//   Or place in .opencode/plugins/ in the project root.

import type { Plugin } from "@opencode-ai/plugin";

const fleetContextFilter: Plugin = async () => {
  return {
    // Strip scheduling instructions from the system prompt.
    "experimental.chat.system.transform": async (_input, output) => {
      output.system = output.system.map((block) => {
        return stripSchedulingSection(block);
      });
    },

    // Filter out Kimaki's MEMORY.md injection and time-gap MEMORY.md reminders.
    "chat.message": async (_input, output) => {
      const originalLength = output.parts.length;

      // Walk backwards so splice indices stay valid.
      for (let i = output.parts.length - 1; i >= 0; i--) {
        const part = output.parts[i];
        if (part.type !== "text" || !(part as any).synthetic) {
          continue;
        }
        const text = (part as any).text as string;
        if (!text) continue;

        // Remove MEMORY.md TOC injection
        if (text.includes("Project memory from MEMORY.md")) {
          output.parts.splice(i, 1);
          continue;
        }

        // Remove "update MEMORY.md" time-gap reminder
        if (
          text.includes("update MEMORY.md before starting the new task")
        ) {
          output.parts.splice(i, 1);
          continue;
        }
      }
    },
  };
};

/**
 * Remove the "## scheduled sends and task management" section from a system
 * prompt block. The section starts with the heading and ends at the next
 * h2-level heading or the end of the block.
 */
function stripSchedulingSection(block: string): string {
  // Match from "## scheduled sends" heading to the next "## " heading or end.
  const schedulingPattern =
    /## scheduled sends and task management[\s\S]*?(?=\n## |\n$|$)/;
  // Also strip the "## creating worktrees" preamble about --send-at if it
  // leaked scheduling references (it doesn't, but guard for future changes).
  let result = block.replace(schedulingPattern, "");

  // Also strip stray task management CLI references.
  const taskManagementPattern =
    /Manage scheduled tasks with:[\s\S]*?kimaki task delete <id>/g;
  result = result.replace(taskManagementPattern, "");

  // Clean up any resulting double blank lines.
  result = result.replace(/\n{3,}/g, "\n\n");

  return result;
}

export default fleetContextFilter;
