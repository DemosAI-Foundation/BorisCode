export const BackgroundPlugin = async () => {
  return {
    "tool.execute.before": async (input, output) => {
      if (input.tool === "bash" && (output.args.command.includes("test") || output.args.command.includes("dev"))) {
         // Windows PowerShell specific backgrounding
         const originalCmd = output.args.command;
         output.args.command = `Start-Process powershell -ArgumentList "-Command ${originalCmd} > task.log 2>&1" -WindowStyle Hidden; Write-Output "Task backgrounded. Check task.log"`;
      }
    }
  }
}