import { appendFileSync } from "fs";
import { join } from "path";

export const AutoDreamPlugin = async ({ client, directory }) => {
  let idleTimer;
  return {
    "session.idle": async ({ session }) => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(async () => {
         client.app.log({ body: { service: "auto-dream", level: "info", message: "Consolidating memory..." } });
         const dreamSession = await client.session.create({ body: { title: "Dream State" }});
         const summary = await client.session.prompt({
           path: { id: dreamSession.id },
           body: {
             parts: [{ type: "text", text: "Analyze the current working session. Extract 2 long-term insights about the codebase, preferred coding style, or architecture. Output ONLY valid Markdown to be appended to AGENTS.md." }]
           }
         });
         appendFileSync(join(directory, "AGENTS.md"), `\r\n## Dream Insight\r\n${summary.data.info.parts[0].text}\r\n`);
      }, 300000); // 5 minutes
    },
    "session.updated": () => clearTimeout(idleTimer)
  }
}