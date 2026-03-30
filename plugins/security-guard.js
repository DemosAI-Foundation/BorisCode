export const SecurityGuardPlugin = async () => {
  return {
    "tool.execute.before": async (input, output) => {
      if ((input.tool === "read" || input.tool === "edit" || input.tool === "write") && 
           output.args.filePath && output.args.filePath.includes(".env")) {
        throw new Error("SECURITY VIOLATION: You are strictly forbidden from accessing .env files.")
      }
    }
  }
}
