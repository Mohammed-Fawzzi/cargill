export const config = {
  runtime: "edge",
  maxDuration: 60,
};

const DRIVE_ID_RE = /^[a-zA-Z0-9_-]{10,}$/;
const CACHE_CONTROL =
  "public, s-maxage=86400, stale-while-revalidate=604800";

function badRequest(message) {
  return new Response(message, { status: 400 });
}

export default async function handler(request) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method not allowed", { status: 405 });
  }

  const url = new URL(request.url);
  const id = String(url.searchParams.get("id") || "").trim();
  if (!DRIVE_ID_RE.test(id)) {
    return badRequest("Invalid file id");
  }

  const range = request.headers.get("Range");
  const headers = new Headers({
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });
  if (range) headers.set("Range", range);

  const upstreamUrl = `https://drive.usercontent.google.com/download?id=${encodeURIComponent(id)}&export=download&confirm=t`;
  let upstream;
  try {
    upstream = await fetch(upstreamUrl, {
      headers,
      redirect: "follow",
    });
  } catch {
    return new Response("Drive media unavailable", { status: 502 });
  }

  if (!upstream.ok && upstream.status !== 206) {
    return new Response("Drive media unavailable", {
      status: upstream.status || 502,
    });
  }

  const contentType = upstream.headers.get("content-type") || "";
  if (contentType.includes("text/html")) {
    return new Response("Drive did not return a video file", { status: 502 });
  }

  const out = new Headers();
  out.set("Content-Type", contentType || "video/mp4");
  out.set("Accept-Ranges", "bytes");
  out.set("Cache-Control", CACHE_CONTROL);
  out.set("CDN-Cache-Control", CACHE_CONTROL);
  out.set("Vercel-CDN-Cache-Control", CACHE_CONTROL);
  out.set("Vary", "Range");

  const contentRange = upstream.headers.get("content-range");
  if (contentRange) out.set("Content-Range", contentRange);

  const contentLength = upstream.headers.get("content-length");
  if (contentLength) out.set("Content-Length", contentLength);

  if (request.method === "HEAD") {
    return new Response(null, { status: upstream.status, headers: out });
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: out,
  });
}
