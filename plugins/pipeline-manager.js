import { existsSync } from "fs";
import { join } from "path";

const processedMessages = new Set();

const triggerNext = (client, sessionID, targetAgent, promptText) => {
  // 500ms delay ensures OpenCode's backend is unlocked and ready
  setTimeout(() => {
    client.session.prompt({
      path: { id: sessionID },
      body: { agent: targetAgent, parts: [{ type: "text", text: promptText }] }
    }).catch(e => console.error(`[Pipeline Error] @${targetAgent}:`, e));
  }, 500);
};

export const PipelineManagerPlugin = async ({ client, $, directory }) => {
  return {
    event: async ({ event }) => {
      
      if (event.type === "session.idle") {
        try {
          const sessionID = event.properties?.sessionID || event.sessionID || (await client.session.list()).data?.[0]?.id;
          if (!sessionID) return;

          const msgsRes = await client.session.messages({ path: { id: sessionID } });
          if (!msgsRes.data || msgsRes.data.length === 0) return;
          
          const lastMsg = msgsRes.data[msgsRes.data.length - 1];
          if (lastMsg.info.role !== "assistant") return;
          if (processedMessages.has(lastMsg.info.id)) return;
          
          const text = lastMsg.parts.map(p => p.text || "").join("").toLowerCase();

          // -----------------------------------------------------
          // ROUTER TRIGGERS (Translating User Input)
          // -----------------------------------------------------

          if (text.includes("[route: build_simple]")) {
            processedMessages.add(lastMsg.info.id);
            client.tui.showToast({ body: { message: "⚡ Simple Task: Calling @build...", variant: "success" }});
            triggerNext(client, sessionID, "build", "Execute the user's requested task and output [BUILD COMPLETE].");
          }

          else if (text.includes("[route: boris]")) {
            processedMessages.add(lastMsg.info.id);
            client.tui.showToast({ body: { message: "🏗️ Complex Task: Calling @boris...", variant: "info" }});
            triggerNext(client, sessionID, "boris", "Draft Option A and Option B. End with [AWAITING_CHOICE].");
          }

          else if (text.includes("[route: critic]")) {
            processedMessages.add(lastMsg.info.id);
            client.tui.showToast({ body: { message: "🔍 Choice Made: Calling @critic...", variant: "info" }});
            // Grab the user's choice from history
            const userChoiceMsg = msgsRes.data[msgsRes.data.length - 2]?.parts[0]?.text || "the chosen option";
            triggerNext(client, sessionID, "critic", `The user chose: ${userChoiceMsg}. Critique it and output [CRITIQUE COMPLETE].`);
          }

          else if (text.includes("[route: build_complex]")) {
            processedMessages.add(lastMsg.info.id);
            client.tui.showToast({ body: { message: "🚀 Approved: Calling @build...", variant: "success" }});
            triggerNext(client, sessionID, "build", "The plan is approved. Implement the code now and output [BUILD COMPLETE].");
          }

          // -----------------------------------------------------
          // SUBAGENT TRIGGERS (The Relay Race)
          // -----------------------------------------------------

          else if (text.includes("critique complete")) {
            processedMessages.add(lastMsg.info.id);
            client.tui.showToast({ body: { message: "📝 Critique Done: Calling @reviser...", variant: "info" }});
            triggerNext(client, sessionID, "reviser", "Generate the finalized v2.0 plan and output [PLAN_READY].");
          }

          else if (text.includes("build complete")) {
            processedMessages.add(lastMsg.info.id);
            client.tui.showToast({ body: { message: "⚙️ Build complete. Running Tests & Diff...", variant: "info" }});
            
            let testCmd = "";
            if (existsSync(join(directory, "package.json"))) testCmd = "npm test --if-present";
            else if (existsSync(join(directory, "Cargo.toml"))) testCmd = "cargo check";
            if (testCmd) await client.session.shell({ path: { id: sessionID }, body: { command: testCmd } });

            const modifiedFiles = await $`git diff --name-only HEAD`.text().catch(() => "");
            const diff = await $`git diff HEAD`.text().catch(() => "");
            
            triggerNext(client, sessionID, "reviewer", `[SYSTEM AUTOMATION]: Review this diff for logic errors.\n\nFILES:\n${modifiedFiles}\n\nDIFF:\n\`\`\`diff\n${diff}\n\`\`\``);
          }

          else if (text.includes("review passed")) {
            processedMessages.add(lastMsg.info.id);
            client.tui.showToast({ body: { message: "✅ Review Passed: Calling @auditor...", variant: "success" }});
            const diff = await $`git diff HEAD`.text().catch(() => "");
            triggerNext(client, sessionID, "auditor", `[SYSTEM AUTOMATION]: Review passed. Perform safety audit.\n\nDIFF:\n\`\`\`diff\n${diff}\n\`\`\``);
          }

          else if (text.includes("review failed")) {
            processedMessages.add(lastMsg.info.id);
            client.tui.showToast({ body: { message: "❌ Review Failed: Sending back to @build...", variant: "error" }});
            triggerNext(client, sessionID, "build", "Code review failed. Fix the issues requested and output [BUILD COMPLETE].");
          }

          else if (text.includes("audit passed")) {
            processedMessages.add(lastMsg.info.id);
            client.tui.showToast({ body: { message: "🎉 All Audits Passed! Task Complete.", variant: "success" }});
          }

          else if (text.includes("audit failed")) {
            processedMessages.add(lastMsg.info.id);
            client.tui.showToast({ body: { message: "🚨 Safety Audit Failed: Sending back to @build...", variant: "error" }});
            triggerNext(client, sessionID, "build", "Safety audit failed. Fix the issues requested and output [BUILD COMPLETE].");
          }

        } catch (err) {
          console.error("[Pipeline Error]", err);
        }
      }
    }
  };
};