import { existsSync } from "fs";
import { join } from "path";

export const UniversalVerifyPlugin = async ({ client, directory }) => {
  return {
    "tool.execute.after": async (input) => {
      // Only trigger after the AI modifies a file
      if (input.tool === "edit" || input.tool === "write") {
        
        let verifyCommand = "";

        // 1. Detect Node.js / TypeScript
        if (existsSync(join(directory, "package.json"))) {
          // --if-present prevents crashing if the repo doesn't have a test script yet
          verifyCommand = "npm test --if-present"; 
        } 
        // 2. Detect Rust
        else if (existsSync(join(directory, "Cargo.toml"))) {
          verifyCommand = "cargo check"; 
        } 
        // 3. Detect Go
        else if (existsSync(join(directory, "go.mod"))) {
          verifyCommand = "go build ./..."; 
        } 
        // 4. Detect Python
        else if (existsSync(join(directory, "requirements.txt")) || existsSync(join(directory, "pyproject.toml"))) {
          verifyCommand = "python -m pytest"; 
        }

        // If a known project type was detected, force the AI to run the check
        if (verifyCommand !== "") {
          await client.session.shell({
            path: { id: input.sessionID },
            body: { command: verifyCommand }
          });
        }
      }
    }
  }
}