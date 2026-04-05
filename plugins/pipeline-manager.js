import { existsSync } from "fs";
import { join } from "path";

// Global State
const processedMessages = new Set();
let retryCount = 0; 

// Safely trigger the next agent without blocking
const triggerNext = (client, sessionID, targetAgent, promptText) => {
  setTimeout(() => {
    client.session.prompt({
      path: { id: sessionID },
      body: { agent: targetAgent, parts: [{ type: "text", text: promptText }] }
    }).catch(e => console.error(`[Pipeline Error] @${targetAgent}:`, e));
  }, 500);
};

// Helper to get a reliable Git Diff (even for brand new, uncommitted files)
const getReliableDiff = async ($) => {
  try {
    // Check if git is initialized
    await $`git status`.quiet();
    // Stage all changes so new files are tracked
    await $`git add .`.quiet();
    // Get the diff of staged files
    const diff = await $`git diff --cached`.text();
    return diff || "No changes detected.";
  } catch (e) {
    return "Not a git repository. Cannot generate diff.";
  }
};

export const PipelineManagerPlugin = async ({ client, $, directory }) => {
  return {
    
    // 1. INTERCEPT USER REPLIES
    "tui.prompt.submit": async ({ text, sessionID }) => {
      try {
        const session = await client.session.get({ path: { id: sessionID } });
        const activeAgent = session.data.agent || "router";
        const lower = text.toLowerCase();

        if (activeAgent === "boris") {
          client.tui.showToast({ body: { message: "🔍 Choice Made: Calling @critic...", variant: "info" }});
          triggerNext(client, sessionID, "critic", `The user selected: "${text}". Critique this choice and output [CRITIQUE COMPLETE].`);
          return true; 
        }

        if (activeAgent === "reviser") {
          if (/^(yes|y|approve|go|proceed)/i.test(lower.trim())) {
             client.tui.showToast({ body: { message: "🚀 Approved: Calling @build...", variant: "success" }});
             triggerNext(client, sessionID, "build", "The plan is approved. Implement the code now and output [BUILD COMPLETE].");
             return true; 
          }
        }
      } catch (e) {
        console.error("TUI Intercept Error:", e);
      }
    },

    // 2. INTERCEPT AI MAGIC STRINGS
    "session.idle": async ({ session }) => {
      try {
        const sessionID = session?.id || session?.properties?.sessionID;
        if (!sessionID) return;

        const msgsRes = await client.session.messages({ path: { id: sessionID } });
        if (!msgsRes.data || msgsRes.data.length === 0) return;
        
        const lastMsg = msgsRes.data[msgsRes.data.length - 1];
        if (lastMsg.info.role !== "assistant") return;
        if (processedMessages.has(lastMsg.info.id)) return;
        
        const text = lastMsg.parts.map(p => p.text || "").join("").toLowerCase();
        const activeAgent = (await client.session.get({ path: { id: sessionID } })).data.agent || "router";

        // ROUTER HANDOFFS
        if (activeAgent === "router") {
          if (text.includes("classification: simple")) {
            processedMessages.add(lastMsg.info.id);
            client.tui.showToast({ body: { message: "⚡ Simple Task: Calling @build...", variant: "success" }});
            triggerNext(client, sessionID, "build", "Please execute this simple task and output [BUILD COMPLETE].");
          } 
          else if (text.includes("classification: complex")) {
            processedMessages.add(lastMsg.info.id);
            client.tui.showToast({ body: { message: "🏗️ Complex Task: Calling @boris...", variant: "info" }});
            triggerNext(client, sessionID, "boris", "The task is complex. Draft Option A and Option B. End with [AWAITING_CHOICE].");
          }
        }

        // CRITIC -> REVISER
        else if (activeAgent === "critic" && text.includes("critique complete")) {
          processedMessages.add(lastMsg.info.id);
          client.tui.showToast({ body: { message: "📝 Critique Done: Calling @reviser...", variant: "info" }});
          triggerNext(client, sessionID, "reviser", "The critique is finished. Generate the finalized v2.0 plan and output [PLAN_READY].");
        }

        // BUILD -> QA
        else if (activeAgent === "build" && text.includes("build complete")) {
          processedMessages.add(lastMsg.info.id);
          client.tui.showToast({ body: { message: "⚙️ Build complete. Running QA...", variant: "info" }});
          
          let testCmd = "";
          if (existsSync(join(directory, "package.json"))) testCmd = "npm test --if-present";
          else if (existsSync(join(directory, "Cargo.toml"))) testCmd = "cargo check";
          if (testCmd) await client.session.shell({ path: { id: sessionID }, body: { command: testCmd } });

          // Get reliable diff (using git add .)
          const diff = await getReliableDiff($);
          
          triggerNext(client, sessionID, "reviewer", `[SYSTEM AUTOMATION]: Review this diff for logic errors.\n\nDIFF:\n\`\`\`diff\n${diff}\n\`\`\``);
        }

        // QA -> PASS / FAIL
        else if (activeAgent === "reviewer") {
          if (text.includes("review passed")) {
            processedMessages.add(lastMsg.info.id);
            retryCount = 0;
            client.tui.showToast({ body: { message: "✅ Review Passed: Calling @auditor...", variant: "success" }});
            const diff = await getReliableDiff($);
            triggerNext(client, sessionID, "auditor", `[SYSTEM AUTOMATION]: Review passed. Perform safety audit.\n\nDIFF:\n\`\`\`diff\n${diff}\n\`\`\``);
          } 
          else if (text.includes("review failed")) {
            processedMessages.add(lastMsg.info.id);
            retryCount++;
            if (retryCount > 3) {
              client.tui.showToast({ body: { message: "🚨 Doom Loop Prevented: Halting pipeline.", variant: "error" }});
              return;
            }
            client.tui.showToast({ body: { message: `❌ Review Failed (${retryCount}/3): Sending back to @build...`, variant: "error" }});
            triggerNext(client, sessionID, "build", "Code review failed. Fix the issues requested and output [BUILD COMPLETE].");
          }
        }

        else if (activeAgent === "auditor") {
          if (text.includes("audit passed")) {
            processedMessages.add(lastMsg.info.id);
            retryCount = 0;
            // Optionally unstage the files here so the user can review them before committing
            await $`git reset HEAD`.quiet().catch(()=> {});
            client.tui.showToast({ body: { message: "🎉 All Audits Passed! Task Complete.", variant: "success" }});
          } 
          else if (text.includes("audit failed")) {
            processedMessages.add(lastMsg.info.id);
            retryCount++;
            if (retryCount > 3) return;
            client.tui.showToast({ body: { message: `🚨 Safety Audit Failed (${retryCount}/3): Sending back to @build...`, variant: "error" }});
            triggerNext(client, sessionID, "build", "Safety audit failed. Fix the issues requested and output [BUILD COMPLETE].");
          }
        }

      } catch (err) {
        console.error("[Pipeline Critical Error]", err);
      }
    }
  };
};