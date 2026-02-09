import React from "react";
import { Box } from "@mui/material";
import { useParams } from "react-router-dom";
import JitsiMeet from "../../components/JitsiMeet";

/**
 * Full-page meeting only (no tutor panel); opened in a new tab when tutor starts a meeting.
 */
export default function TutorMeetingPage() {
  const { roomCode } = useParams();
  const tutorName = localStorage.getItem("tutor_name") || "Tutor";

  return (
    <Box sx={{ width: "100vw", height: "100vh", minHeight: 500, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <JitsiMeet
        roomCode={roomCode || ""}
        displayName={tutorName}
        height="100vh"
      />
    </Box>
  );
}
