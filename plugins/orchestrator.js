export const OrchestratorPlugin = async ({ client }) => {
  return {
    "tui.command.execute": async ({ command, args, sessionID }) => {
      // Listen for our custom command: /do
      if (command === "do") {
        const task = args.join(" ");
        
        client.tui.showToast({ body: { message: "🧠 Triaging task...", variant: "info" }});

        // 1. TRIAGE (Hidden query to router)
        const triageRes = await client.session.prompt({
          path: { id: sessionID },
          body: { agent: "router", parts: [{ type: "text", text: task }] }
        });
        
        const isComplex = triageRes.data.info.parts[0].text.includes("[COMPLEX]");

        if (!isComplex) {
          client.tui.showToast({ body: { message: "⚡ Simple task detected. Handing to Build...", variant: "success" }});
          
          // Paste the task directly into the TUI input for the user to send to Build
          await client.tui.appendPrompt({
            body: { text: `[SIMPLE TASK ROUTED]: Please execute this: ${task}` }
          });
          return true;
        }

        // 2. BORIS DRAFTS OPTIONS (Hidden query to boris)
        client.tui.showToast({ body: { message: "🏗️ Complex task. Boris is drafting options...", variant: "info" }});
        const borisRes = await client.session.prompt({
          path: { id: sessionID },
          body: { agent: "boris", parts: [{ type: "text", text: task }] }
        });
        const options = borisRes.data.info.parts[0].text;

        // 3. CRITIC REVIEWS (Hidden query to critic)
        client.tui.showToast({ body: { message: "🧐 Staff Engineer is reviewing the architecture...", variant: "info" }});
        const criticRes = await client.session.prompt({
          path: { id: sessionID },
          body: { agent: "critic", parts: [{ type: "text", text: `Original Task: ${task}\n\nProposed Options:\n${options}` }] }
        });
        const finalCritique = criticRes.data.info.parts[0].text;

        // 4. DELIVER FINAL RESULT TO USER
        await client.tui.appendPrompt({
           body: { text: `### 📋 ARCHITECTURAL PLAN GENERATED\n\n**Boris's Options & Staff Engineer's Critique:**\n\n${finalCritique}\n\n---\n*System Note: To proceed, just type "Do Option A" (or B) and hit enter. The Build agent will execute it.*` }
        });

        return true; // Tells OpenCode the command was handled successfully
      }
    }
  }
}