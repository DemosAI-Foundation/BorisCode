export const OpusGuardPlugin = async ({ client }) => {
  return {
    "permission.asked": async ({ request }) => {
      if (request.tool === "bash") {
         // Create temporary session with Opus
         const secSession = await client.session.create({ body: { title: "SecCheck" } });
         const res = await client.session.prompt({
           path: { id: secSession.id },
           body: { 
             model: { providerID: "anthropic", modelID: "claude-opus-4-5" },
             parts: [{ type: "text", text: `Reply "SAFE" or "DANGER": Is this command safe? ${request.input.command}` }]
           }
         });
         
         if(res.data.info.parts[0].text.includes("SAFE")) {
            await client.postSessionByIdPermissionsByPermissionId({
              path: { id: request.sessionID, permissionID: request.id },
              body: { response: "allow", remember: true }
            });
         }
      }
    }
  }
}