import { spawn } from "child_process";
import { mkdirSync, rmSync } from "fs";

const chromePath =
  process.env.CHROME_PATH ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9338;
const profile = `${process.env.TEMP}\\cargill-hero-log-only`;

try {
  rmSync(profile, { recursive: true, force: true });
} catch {}
mkdirSync(profile, { recursive: true });

const chrome = spawn(
  chromePath,
  [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--window-size=1440,900",
    "about:blank",
  ],
  { stdio: "ignore" },
);

await new Promise((r) => setTimeout(r, 2000));
const tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = tabs.find((t) => t.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  ws.onopen = resolve;
  ws.onerror = reject;
});

let id = 0;
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const i = ++id;
    const onmsg = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id === i) {
        ws.removeEventListener("message", onmsg);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
      }
    };
    ws.addEventListener("message", onmsg);
    ws.send(JSON.stringify({ id: i, method, params }));
  });

const logs = [];
let mediaReqs = 0;
ws.addEventListener("message", (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.method === "Runtime.consoleAPICalled") {
    const text = (msg.params.args || [])
      .map((a) => a.value ?? a.description ?? "")
      .join(" ");
    if (String(text).includes("[hero-video]")) logs.push(text);
  }
  if (msg.method === "Network.requestWillBeSent") {
    const url = msg.params.request.url || "";
    if (url.includes("alt=media")) mediaReqs += 1;
  }
});

await send("Runtime.enable");
await send("Network.enable");
await send("Emulation.setEmulatedMedia", {
  features: [{ name: "prefers-reduced-motion", value: "reduce" }],
});
await send("Page.enable");
await send("Page.navigate", { url: "http://localhost:5173/" });
await new Promise((r) => setTimeout(r, 10000));

const probe = await send("Runtime.evaluate", {
  returnByValue: true,
  expression:
    '(() => ({ hasVideo: !!document.querySelector("video"), intro: document.documentElement.dataset.homeIntro || "", w: innerWidth }))()',
});

console.log(
  JSON.stringify(
    { mediaReqs, logs, probe: probe?.result?.value || null },
    null,
    2,
  ),
);

ws.close();
chrome.kill();
