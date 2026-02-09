import React, { useEffect, useRef, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

const JITSI_SCRIPT = "https://meet.jit.si/external_api.js";
const DOMAIN = "meet.jit.si";

/**
 * Loads external script by URL. Returns a Promise that resolves when script is loaded.
 */
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

/**
 * Wait for window.JitsiMeetExternalAPI to be defined (script may set it async in new tab).
 */
function waitForJitsiAPI(maxMs = 3000, intervalMs = 50) {
  return new Promise((resolve) => {
    if (window.JitsiMeetExternalAPI) {
      resolve(window.JitsiMeetExternalAPI);
      return;
    }
    const start = Date.now();
    const id = setInterval(() => {
      if (window.JitsiMeetExternalAPI) {
        clearInterval(id);
        resolve(window.JitsiMeetExternalAPI);
      } else if (Date.now() - start >= maxMs) {
        clearInterval(id);
        resolve(null);
      }
    }, intervalMs);
  });
}

/**
 * Embeds Jitsi Meet in a container. When roomCode is set, loads the meeting.
 * displayName: name shown in the meeting (e.g. tutor/student name).
 */
export default function JitsiMeet({ roomCode, displayName = "Tutor", height = 500, onReady }) {
  const containerRef = useRef(null);
  const apiRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!roomCode) return;

    let mounted = true;
    let initTimer = null;
    setLoading(true);
    setError(null);

    loadScript(JITSI_SCRIPT)
      .then(() => waitForJitsiAPI())
      .then((JitsiAPI) => {
        if (!mounted) {
          setLoading(false);
          return;
        }
        if (!JitsiAPI) {
          setError("Jitsi Meet failed to load. Please refresh.");
          setLoading(false);
          return;
        }
        // Defer so the container is in the DOM and has layout (avoids 0-height in new tab)
        initTimer = setTimeout(() => {
          if (!mounted || !containerRef.current) {
            setLoading(false);
            return;
          }
          try {
            const api = new JitsiAPI(DOMAIN, {
              roomName: roomCode,
              parentNode: containerRef.current,
              width: "100%",
              height: "100%",
              userInfo: { displayName },
            });
            apiRef.current = api;
            if (onReady) onReady(api);
          } catch (e) {
            if (mounted) setError(e.message || "Failed to start meeting");
          }
          setLoading(false);
        }, 100);
      })
      .catch((err) => {
        if (mounted) {
          setError(err.message || "Failed to load meeting");
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
      if (initTimer) clearTimeout(initTimer);
      if (apiRef.current) {
        try {
          apiRef.current.dispose();
        } catch (e) {
          // ignore
        }
        apiRef.current = null;
      }
    };
  }, [roomCode, displayName, onReady]);

  if (!roomCode) {
    return (
      <Box sx={{ height, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "grey.100", borderRadius: 2 }}>
        <Typography color="text.secondary">Start or select a class to load the meeting.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: "relative", height, borderRadius: 2, overflow: "hidden", bgcolor: "#1a1a2e" }}>
      {loading && (
        <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "rgba(0,0,0,0.7)", zIndex: 1 }}>
          <CircularProgress sx={{ color: "white" }} />
          <Typography sx={{ ml: 2, color: "white" }}>Loading meeting…</Typography>
        </Box>
      )}
      {error && (
        <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "rgba(0,0,0,0.7)", zIndex: 1 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}
      <Box ref={containerRef} sx={{ width: "100%", height: "100%", minHeight: 400 }} />
    </Box>
  );
}
