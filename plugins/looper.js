export const LooperPlugin = async ({ client }) => {
  return {
    "tui.command.execute": async ({ command, args, sessionID }) => {
      if (command === "loop") {
        const [minutes, ...promptArgs] = args;
        const prompt = promptArgs.join(" ");
        
        client.tui.showToast({ body: { message: `Looping every ${minutes}m: ${prompt}`, variant: "info" }});
        
        setInterval(async () => {
          await client.session.prompt_async({
            path: { id: sessionID },
            body: { parts: [{ type: "text", text: `[LOOP EXECUTION]: ${prompt}` }] }
          });
        }, parseInt(minutes) * 60000);
        return true; 
      }
    }
  }
}