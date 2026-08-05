#!/usr/bin/env node
/**
 * AKILI guardrail (Cursor): block marking tasks.md [x] without Reviewer PASS
 * in the same spec's execution.md. Evidence before checkbox.
 * Scaffolded by /akili-constitution Step 8F. preToolUse — Write|StrReplace.
 * PASS check is the v1 heuristic (any "PASS" in execution.md).
 */
const fs = require("fs");
const path = require("path");

function countX(text) {
  const m = String(text ?? "").match(/\[x\]/g);
  return m ? m.length : 0;
}

function isTasksMd(filePath) {
  const n = String(filePath || "").replace(/\\/g, "/");
  return /(?:^|\/)docs\/specs\/[^/]+\/tasks\.md$/.test(n);
}

function deny(message) {
  process.stdout.write(
    JSON.stringify({
      permission: "deny",
      user_message: message,
      agent_message: message,
    })
  );
  process.exit(0);
}

function allow() {
  process.stdout.write(JSON.stringify({ permission: "allow" }));
  process.exit(0);
}

let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (c) => {
  raw += c;
});
process.stdin.on("end", () => {
  let data;
  try {
    data = JSON.parse(raw || "{}");
  } catch {
    allow();
    return;
  }

  const toolInput = data.tool_input || data.toolInput || {};
  const filePath = toolInput.file_path || toolInput.path || "";
  if (!isTasksMd(filePath)) allow();

  const tool = String(data.tool_name || data.toolName || "");
  let oldText = "";
  let newText = "";

  if (tool === "StrReplace" || tool === "Edit") {
    oldText = toolInput.old_string ?? "";
    newText = toolInput.new_string ?? "";
  } else {
    try {
      oldText = fs.readFileSync(filePath, "utf8");
    } catch {
      oldText = "";
    }
    newText = toolInput.contents ?? toolInput.content ?? "";
  }

  if (countX(newText) <= countX(oldText)) allow();

  const execMd = path.join(path.dirname(filePath), "execution.md");
  if (!fs.existsSync(execMd)) {
    deny(
      `BLOCKED (AKILI guardrail): flipping a task to [x] but ${execMd} does not exist. Evidence first: append execution.md with Reviewer PASS before updating tasks.md.`
    );
  }
  const execBody = fs.readFileSync(execMd, "utf8");
  if (!/\bPASS\b/.test(execBody)) {
    deny(
      `BLOCKED (AKILI guardrail): ${execMd} contains no PASS evidence. A task reaches [x] only after a Reviewer PASS is recorded.`
    );
  }
  allow();
});
