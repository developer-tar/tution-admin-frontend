import React from "react";
import { Container } from "@mui/material";
import MyCourseHeader from "./MyCourseVideo/MyCourseHeader";
import VideoFilterForm from "./MyCourseVideo/VideoFilterForm";
import VideoTable from "./MyCourseVideo/VideoTable";

const MyCourseVideoPage = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <MyCourseHeader />
      <VideoFilterForm />
      <VideoTable />
    </Container>
  );
};

export default MyCourseVideoPage;
