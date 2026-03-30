let sessionStarted = false

export const AutoContextPlugin = async ({ client, $ }) => {
  return {
    "experimental.session.compacting": async ({ event }) => {
      if (!sessionStarted) {
        sessionStarted = true
        const diff = await $`git diff HEAD`.nothrow().text()
        if (diff.trim()) {
          await client.session.prompt({
            path: { id: event.properties.sessionID },
            body: {
              noReply: true,
              parts: [{ 
                type: "text", 
                text: `BACKGROUND CONTEXT - Current uncommitted changes:\n\n${diff}` 
              }]
            }
          })
        }
      }
    }
  }
}
