import { appendFileSync } from "fs";
import { join } from "path";

export const AutoMemoryPlugin = async ({ client, directory }) => {
  return {
    "session.idle": async ({ session }) => {
      const res = await client.session.prompt({
        path: { id: session.id },
        body: { 
          noReply: false,
          parts: [{ type: "text", text: "Identify if any new project-specific coding rules, corrections, or architectural decisions were established in this session. If yes, output ONLY a concise Markdown bullet point. If no, output exactly 'NONE'." }]
        }
      });
      const learned = res.data.info.parts[0].text;
      if(learned && !learned.includes("NONE")) {
        appendFileSync(join(directory, "AGENTS.md"), `\r\n${learned}\r\n`);
        client.tui.showToast({ body: { message: "Memory updated: Added rule to AGENTS.md", variant: "info" }});
      }
    }
  }
}