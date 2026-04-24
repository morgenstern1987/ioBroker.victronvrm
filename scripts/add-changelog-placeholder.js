"use strict";

/**
 * Post-release script
 * Automatically re-inserts the ### **WORK IN PROGRESS** placeholder
 * into README.md after every release.
 *
 * Called automatically via "postrelease" npm script after release-script runs.
 * Can also be run manually: node scripts/add-changelog-placeholder.js
 */

const fs = require("node:fs");
const path = require("node:path");

const README = path.join(__dirname, "..", "README.md");
const PLACEHOLDER = "### **WORK IN PROGRESS**";
const CHANGELOG_HEADER = "## Changelog";

if (!fs.existsSync(README)) {
    console.error("README.md not found!");
    process.exit(1);
}

let content = fs.readFileSync(README, "utf8");

// Already present? Nothing to do.
if (content.includes(PLACEHOLDER)) {
    console.log("Changelog placeholder already present – nothing to do.");
    process.exit(0);
}

// Insert placeholder after ## Changelog header
const idx = content.indexOf(CHANGELOG_HEADER);
if (idx === -1) {
    console.error(`"${CHANGELOG_HEADER}" not found in README.md!`);
    process.exit(1);
}

// Find end of the ## Changelog line
const lineEnd = content.indexOf("\n", idx);
const insertAt = lineEnd + 1;

content = content.slice(0, insertAt) + "\n" + PLACEHOLDER + "\n- (no changes yet)\n" + content.slice(insertAt);

fs.writeFileSync(README, content, "utf8");
console.log("✅ Changelog placeholder added to README.md");
