import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function driveMediaDevProxy() {
  return {
    name: "drive-media-dev-proxy",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const rawUrl = req.url || "";
        if (!rawUrl.startsWith("/api/drive-media")) {
          next();
          return;
        }

        let upstreamAbort;
        try {
          const incoming = new URL(rawUrl, "http://localhost");
          const id = String(incoming.searchParams.get("id") || "").trim();
          if (!/^[a-zA-Z0-9_-]{10,}$/.test(id)) {
            res.statusCode = 400;
            res.end("Invalid file id");
            return;
          }

          const headers = {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          };
          if (req.headers.range) headers.Range = req.headers.range;

          upstreamAbort = new AbortController();
          const onClose = () => {
            try {
              upstreamAbort.abort();
            } catch {}
          };
          req.on("close", onClose);

          const upstreamUrl = `https://drive.usercontent.google.com/download?id=${encodeURIComponent(id)}&export=download&confirm=t`;
          const upstream = await fetch(upstreamUrl, {
            headers,
            redirect: "follow",
            signal: upstreamAbort.signal,
          });

          const contentType = upstream.headers.get("content-type") || "";
          if (contentType.includes("text/html")) {
            res.statusCode = 502;
            res.end("Drive did not return a video file");
            return;
          }
          if (!upstream.ok && upstream.status !== 206) {
            res.statusCode = upstream.status;
            res.end("Drive media unavailable");
            return;
          }

          res.statusCode = upstream.status;
          res.setHeader("Content-Type", contentType || "video/mp4");
          res.setHeader("Accept-Ranges", "bytes");
          res.setHeader("Cache-Control", "public, max-age=3600");
          const contentRange = upstream.headers.get("content-range");
          if (contentRange) res.setHeader("Content-Range", contentRange);
          const contentLength = upstream.headers.get("content-length");
          if (contentLength) res.setHeader("Content-Length", contentLength);

          if (req.method === "HEAD" || !upstream.body) {
            res.end();
            return;
          }

          const { Readable } = await import("node:stream");
          const nodeStream = Readable.fromWeb(upstream.body);
          nodeStream.on("error", () => {
            try {
              res.end();
            } catch {}
          });
          req.on("close", () => {
            nodeStream.destroy();
          });
          nodeStream.pipe(res);
        } catch {
          if (!res.headersSent) {
            res.statusCode = 502;
            res.end("Drive proxy failed");
          } else {
            try {
              res.end();
            } catch {}
          }
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), driveMediaDevProxy()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@components": path.resolve(__dirname, "src/components"),
      "@pages": path.resolve(__dirname, "src/pages"),
      "@constants": path.resolve(__dirname, "src/constants"),
      "@assets": path.resolve(__dirname, "src/assets"),
    },
  },
});
