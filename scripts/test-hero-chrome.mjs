import { spawn } from "child_process";
import { mkdirSync, rmSync } from "fs";

const chromePath =
  process.env.CHROME_PATH ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9226;
const profile = `${process.env.TEMP}\\cargill-chrome-hero-test`;

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
    "--disable-features=ChromeWhatsNewUI,AccountConsistency",
    "--autoplay-policy=no-user-gesture-required",
    "--window-size=1440,900",
    "http://localhost:5173/",
  ],
  { stdio: "ignore" },
);

await new Promise((r) => setTimeout(r, 2500));

async function getPage() {
  const tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
  return (
    tabs.find((t) => t.type === "page" && /localhost:5173/.test(t.url)) ||
    tabs.find((t) => t.type === "page")
  );
}

let page = await getPage();
if (page && !/localhost:5173/.test(page.url || "")) {
  const wsNav = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    wsNav.onopen = resolve;
    wsNav.onerror = reject;
  });
  let id = 0;
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const i = ++id;
      const onmsg = (ev) => {
        const msg = JSON.parse(ev.data);
        if (msg.id === i) {
          wsNav.removeEventListener("message", onmsg);
          if (msg.error) reject(new Error(JSON.stringify(msg.error)));
          else resolve(msg.result);
        }
      };
      wsNav.addEventListener("message", onmsg);
      wsNav.send(JSON.stringify({ id: i, method, params }));
    });
  await send("Page.enable");
  await send("Page.navigate", { url: "http://localhost:5173/" });
  wsNav.close();
  await new Promise((r) => setTimeout(r, 2500));
  page = await getPage();
}

console.log("page", page?.url);

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

await send("Runtime.enable");

const expr = `(() => {
  const video = document.querySelector("[data-home-hero-media] video");
  const img = document.querySelector("[data-home-hero-media] img");
  return {
    intro: document.documentElement.dataset.homeIntro,
    hasVideo: !!video,
    opacity: video ? getComputedStyle(video).opacity : null,
    paused: video ? video.paused : null,
    ready: video ? video.readyState : null,
    err: video && video.error ? video.error.code : null,
    src: video
      ? video.currentSrc || video.querySelector("source")?.src || ""
      : "",
    poster: img ? (img.currentSrc || img.src).split("/").pop() : "",
    w: innerWidth,
  };
})()`;

for (let n = 0; n < 25; n += 1) {
  await new Promise((r) => setTimeout(r, 1000));
  const res = await send("Runtime.evaluate", {
    expression: expr,
    returnByValue: true,
  });
  const v = res?.result?.value;
  console.log(`tick ${n}`, JSON.stringify(v));
  if (
    v &&
    ((v.hasVideo && v.ready >= 2 && v.paused === false) ||
      (v.intro === "done" && n > 10 && (v.err || !v.hasVideo)))
  ) {
    break;
  }
}

ws.close();
chrome.kill();
