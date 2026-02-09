import React, { useState, useEffect } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import UnfoldLessRoundedIcon from "@mui/icons-material/UnfoldLessRounded";
import UnfoldMoreRoundedIcon from "@mui/icons-material/UnfoldMoreRounded";
import LockIcon from "@mui/icons-material/Lock";
import { useParams } from "react-router-dom";
import JitsiMeet from "../../components/JitsiMeet";
import api from "../../api";

const MINIMIZED_WIDTH = 56;

/**
 * Full-page meeting only (no tutor panel); opened in a new tab when tutor starts a meeting.
 * Meeting (left) and Excalidraw whiteboard (right), each can be minimized separately.
 * Whiteboard uses same pattern as Blade: wrapper + iframe (#room=room_code) + lock overlay when drawing disabled for non-teachers.
 */
export default function TutorMeetingPage() {
  const { roomCode } = useParams();
  const tutorName = localStorage.getItem("tutor_name") || "Tutor";
  const code = roomCode || "";

  const [meetingMinimized, setMeetingMinimized] = useState(false);
  const [whiteboardMinimized, setWhiteboardMinimized] = useState(false);
  const [drawingEnabled, setDrawingEnabled] = useState(true);
  const [whiteboardSessionId, setWhiteboardSessionId] = useState(() => Date.now());

  const isTeacher = (localStorage.getItem("role") || "").toLowerCase() === "tutor";
  const showLockOverlay = !drawingEnabled && !isTeacher;

  useEffect(() => {
    if (code) setWhiteboardSessionId(Date.now());
  }, [code]);

  useEffect(() => {
    if (!code) return;
    api
      .get(`classroom/join/${encodeURIComponent(code)}`)
      .then((res) => {
        const enabled = res.data?.classroom?.drawing_enabled;
        if (typeof enabled === "boolean") setDrawingEnabled(enabled);
      })
      .catch(() => {});
  }, [code]);

  return (
    <Box sx={{ width: "100vw", height: "100vh", minHeight: 500, overflow: "hidden", display: "flex", flexDirection: "row" }}>
      {/* Left: Meeting */}
      <Box
        sx={{
          position: "relative",
          width: meetingMinimized ? MINIMIZED_WIDTH : "50%",
          flex: meetingMinimized ? "0 0 auto" : 1,
          minWidth: meetingMinimized ? MINIMIZED_WIDTH : 280,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid",
          borderColor: "divider",
          bgcolor: "#1a1a2e",
          transition: "width 0.2s ease, flex 0.2s ease",
        }}
      >
        <Box
          sx={{
            flexShrink: 0,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: meetingMinimized ? "center" : "space-between",
            px: 1,
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          {!meetingMinimized && (
            <Typography variant="subtitle2" color="text.secondary">
              Meeting
            </Typography>
          )}
          <IconButton
            size="small"
            onClick={() => setMeetingMinimized((m) => !m)}
            title={meetingMinimized ? "Expand meeting" : "Minimize meeting"}
            sx={{ color: "text.secondary" }}
          >
            {meetingMinimized ? <UnfoldMoreRoundedIcon /> : <UnfoldLessRoundedIcon />}
          </IconButton>
        </Box>
        {/* Always mount Jitsi so the user stays in the meeting when minimized; hide off-screen when minimized */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
            ...(meetingMinimized && {
              position: "absolute",
              left: -10000,
              top: 40,
              width: 640,
              height: 480,
              flex: "none",
            }),
          }}
        >
          <JitsiMeet roomCode={code} displayName={tutorName} height="100%" />
        </Box>
      </Box>

      {/* Right: Whiteboard — keyed by room + session so each meeting gets a fresh whiteboard */}
      {code && (
        <Box
          key={`whiteboard-${code}-${whiteboardSessionId}`}
          sx={{
            width: whiteboardMinimized ? MINIMIZED_WIDTH : "50%",
            flex: whiteboardMinimized ? "0 0 auto" : 1,
            minWidth: whiteboardMinimized ? MINIMIZED_WIDTH : 280,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            bgcolor: "background.default",
            transition: "width 0.2s ease, flex 0.2s ease",
          }}
        >
          <Box
            sx={{
              flexShrink: 0,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: whiteboardMinimized ? "center" : "space-between",
              px: 1,
              borderBottom: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            {!whiteboardMinimized && (
              <Typography variant="subtitle2" color="text.secondary">
                Whiteboard
              </Typography>
            )}
            <IconButton
              size="small"
              onClick={() => setWhiteboardMinimized((w) => !w)}
              title={whiteboardMinimized ? "Expand whiteboard" : "Minimize whiteboard"}
              sx={{ color: "text.secondary" }}
            >
              {whiteboardMinimized ? <UnfoldMoreRoundedIcon /> : <UnfoldLessRoundedIcon />}
            </IconButton>
          </Box>
          {!whiteboardMinimized && (
            <Box
              className="whiteboard-wrapper"
              sx={{
                flex: 1,
                minHeight: 0,
                p: 1.5,
                boxSizing: "border-box",
                position: "relative",
              }}
            >
              <iframe
                id="board"
                key={`${code}-${whiteboardSessionId}`}
                src={`https://excalidraw.com/#room=${encodeURIComponent(code)}&_=${whiteboardSessionId}`}
                title="Excalidraw Whiteboard"
                style={{
                  width: "100%",
                  height: "100%",
                  minHeight: 300,
                  border: "none",
                  borderRadius: 12,
                  display: "block",
                }}
              />
              {showLockOverlay && (
                <Box
                  className="lock-overlay"
                  sx={{
                    position: "absolute",
                    inset: 0,
                    m: 1.5,
                    borderRadius: 12,
                    bgcolor: "rgba(0,0,0,0.6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: 600,
                    gap: 1,
                  }}
                >
                  <LockIcon />
                  Teacher has locked drawing
                </Box>
              )}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
