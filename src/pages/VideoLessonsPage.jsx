import { Container, Grid } from '@mui/material';
import VideoLessonHeader from './Videos/VideoLessonHeader';
import MediaRenderer from './Videos/MediaRenderer';
import LessonDescription from './Videos/LessonDescription';
import TestList from './Videos/TestList';

const VideoLessonsPage = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <VideoLessonHeader />
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <MediaRenderer />
          <LessonDescription />
        </Grid>
        <Grid item xs={12} md={4}>
          <TestList />
        </Grid>
      </Grid>
    </Container>
  );
};

export default VideoLessonsPage;
