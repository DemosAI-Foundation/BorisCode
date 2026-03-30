let lastActivityTime = Date.now()
const IDLE_THRESHOLD = 300000 // 5 minutes

export const AutoLearnerPlugin = async ({ client }) => {
  return {
    "chat.message": async ({ event }) => {
      lastActivityTime = Date.now()
    },
    "experimental.session.compacting": async ({ event }) => {
      if (Date.now() - lastActivityTime > IDLE_THRESHOLD) {
        const result = await client.session.prompt({
          path: { id: event.properties.sessionID },
          body: {
            parts: [{ 
              type: "text", 
              text: "Analyze our recent conversation for any corrections I made. Extract the core rule violated, and use the edit tool to append it to AGENTS.md so you don't make this mistake again. Return a summary of what was found and updated." 
            }]
          }
        })
        console.log("[Auto-Learner] Session review complete:", result)
      }
    }
  }
}
