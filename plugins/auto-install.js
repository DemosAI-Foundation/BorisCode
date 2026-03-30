import { existsSync } from "fs";
export const AutoInstallPlugin = async ({ $, directory, client }) => {
  return {
    "session.created": async () => {
      if (existsSync(`${directory}/package.json`) && !existsSync(`${directory}/node_modules`)) {
        client.tui.showToast({ body: { message: "Auto-installing dependencies...", variant: "info" }});
        await $`npm install`;
      }
    }
  }
}