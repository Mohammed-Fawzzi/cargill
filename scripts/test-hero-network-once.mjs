import { spawn } from "child_process";
import { mkdirSync, rmSync } from "fs";

const chromePath =
  process.env.CHROME_PATH ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9337;
const profile = `${process.env.TEMP}\\cargill-hero-net-once`;

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
    "about:blank",
  ],
  { stdio: "ignore" },
);

await new Promise((r) => setTimeout(r, 2000));
const tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = tabs.find((t) => t.type === "page");
if (!page) {
  console.log("NO_PAGE");
  chrome.kill();
  process.exit(1);
}

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

const driveHits = [];
ws.addEventListener("message", (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.method === "Network.requestWillBeSent") {
    const url = msg.params.request.url || "";
    if (
      url.includes("googleapis.com/drive/v3/files") &&
      url.includes("alt=media")
    ) {
      const headers = msg.params.request.headers || {};
      driveHits.push({
        requestId: msg.params.requestId,
        url,
        referer: headers.Referer || headers.referer || "(none)",
        status: null,
        mimeType: null,
        headers: null,
      });
    }
  }
  if (msg.method === "Network.responseReceived") {
    const url = msg.params.response.url || "";
    if (
      url.includes("googleapis.com/drive/v3/files") &&
      url.includes("alt=media")
    ) {
      const hit =
        driveHits.find((h) => h.requestId === msg.params.requestId) ||
        null;
      if (hit) {
        hit.status = msg.params.response.status;
        hit.mimeType = msg.params.response.mimeType;
        hit.headers = msg.params.response.headers;
      } else {
        driveHits.push({
          requestId: msg.params.requestId,
          url,
          status: msg.params.response.status,
          mimeType: msg.params.response.mimeType,
          headers: msg.params.response.headers,
          referer: "(unknown)",
        });
      }
    }
  }
});

await send("Network.enable");
await send("Page.enable");
await send("Page.navigate", { url: "http://localhost:5173/" });

const deadline = Date.now() + 22000;
while (Date.now() < deadline) {
  await new Promise((r) => setTimeout(r, 500));
  if (driveHits.some((h) => h.status != null)) break;
}

await new Promise((r) => setTimeout(r, 5000));

const hit = driveHits.find((h) => h.status != null) || driveHits[0] || null;
let errorText = "";
if (hit && hit.status && hit.status >= 400) {
  try {
    const body = await send("Network.getResponseBody", {
      requestId: hit.requestId,
    });
    errorText = String(body.body || "").slice(0, 600);
  } catch (e) {
    errorText = String(e.message || e);
  }
}

const dom = await send("Runtime.evaluate", {
  returnByValue: true,
  expression: `(() => {
    const video = document.querySelector("[data-home-hero-media] video");
    const source = video && video.querySelector("source");
    return {
      intro: document.documentElement.dataset.homeIntro || "",
      hasVideo: !!video,
      opacity: video ? getComputedStyle(video).opacity : null,
      paused: video ? video.paused : null,
      readyState: video ? video.readyState : null,
      err: video && video.error ? video.error.code : null,
      src: source ? source.src : video ? video.currentSrc : "",
      w: innerWidth,
      envKey: Boolean(window.__CARGILL_HAS_GKEY__),
    };
  })()`,
});

const mask = (u) => String(u || "").replace(/key=[^&]+/i, "key=***");
console.log(
  JSON.stringify(
    {
      network: hit
        ? {
            url: mask(hit.url),
            status: hit.status,
            contentType:
              hit.mimeType ||
              hit.headers?.["content-type"] ||
              hit.headers?.["Content-Type"] ||
              null,
            referer: hit.referer || null,
            errorText: errorText || null,
            hits: driveHits.length,
          }
        : null,
      dom: dom?.result?.value || null,
    },
    null,
    2,
  ),
);

ws.close();
chrome.kill();
