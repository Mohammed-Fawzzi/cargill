import React from "react";

const RELOAD_FLAG = "cargill-chunk-reload";

export function isChunkLoadError(error) {
  const message = String(error?.message || error || "");
  return (
    error?.name === "ChunkLoadError" ||
    /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(
      message,
    )
  );
}

function rememberReload() {
  try {
    if (sessionStorage.getItem(RELOAD_FLAG) === "1") return false;
    sessionStorage.setItem(RELOAD_FLAG, "1");
    return true;
  } catch {
    return false;
  }
}

export function clearChunkReload() {
  try {
    sessionStorage.removeItem(RELOAD_FLAG);
  } catch {
    return;
  }
}

export function reloadForChunkError(error) {
  if (!isChunkLoadError(error)) return false;
  if (!rememberReload()) return false;
  window.location.reload();
  return true;
}

export function lazyWithRetry(importer) {
  return React.lazy(() =>
    importer()
      .then((mod) => {
        clearChunkReload();
        return mod;
      })
      .catch((error) => {
        if (reloadForChunkError(error)) return new Promise(() => {});
        throw error;
      }),
  );
}
