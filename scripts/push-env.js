const fs = require("fs");
const cp = require("child_process");

const env = fs.readFileSync(".env", "utf8").split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith("#"));

for (const line of env) {
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    const key = line.substring(0, idx);
    const val = line.substring(idx + 1).replace(/^"|"$/g, '').replace(/^'|'$/g, '');
    
    console.log("Pushing", key);
    try {
        const cmd = `npx vercel env add ${key} production`;
        cp.execSync(cmd, {
            input: val,
            stdio: ["pipe", "inherit", "inherit"]
        });
    } catch(e) {
        console.error("Failed to push", key);
    }
}
