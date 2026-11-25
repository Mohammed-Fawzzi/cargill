let sessionLive = false;

export function shouldPlayPageIntro(navType, reduced) {
  if (reduced) return false;
  if (typeof window === "undefined") return false;
  if (sessionLive && navType === "POP") return false;
  return true;
}

export function notePageSession() {
  sessionLive = true;
}
