import { 
  Container, 
  Grid, 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Avatar, 
  Chip, 
  Fade, 
  IconButton, 
  Tooltip 
} from '@mui/material';
import {
  ArrowBack,
  PlayCircleOutline,
  School,
  Assignment,
  Visibility,
  TrendingUp
} from '@mui/icons-material';
import VideoLessonHeader from '../Videos/VideoLessonHeader';
import MediaRenderer from '../Videos/MediaRenderer';
import TestList from '../Videos/TestList';
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";
import { toast } from "react-toastify";

const TopicContentView = () => {
  const { topic_id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await api.get(`/student/topic/content/view/${topic_id}`);
  
      setData(res.data.data || null);
    } catch (err) {
      toast.error("Failed to fetch video lesson");
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, [topic_id]);


  const mediaCount = [
    ...(data?.topic_media || []),
    ...(data?.sub_topic_media || [])
  ].length;

  const testCount = data?.topic_test?.length || 0;

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh',
      py: 4
    }}>
      <Container maxWidth="xl">
        {/* Fancy Header Section */}
        <Fade in timeout={800}>
          <Card sx={{
            mb: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
            overflow: 'hidden'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                <Tooltip title="Go Back" arrow>
                  <IconButton 
                    onClick={() => navigate(-1)}
                    sx={{
                      background: 'rgba(255,255,255,0.15)',
                      color: 'white',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.25)',
                        transform: 'scale(1.1)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <ArrowBack />
                  </IconButton>
                </Tooltip>
                
                <Avatar sx={{
                  background: 'rgba(255,255,255,0.2)',
                  width: 60,
                  height: 60,
                  backdropFilter: 'blur(10px)'
                }}>
                  <School sx={{ fontSize: 30 }} />
                </Avatar>
                
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    📚 {data?.topic_name || 'Loading Topic...'}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Explore course content and enhance your learning experience
                  </Typography>
                </Box>
              </Box>
              
              {/* Stats Row */}
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{
                    background: 'rgba(255,255,255,0.2)',
                    width: 32,
                    height: 32
                  }}>
                    <PlayCircleOutline sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }}>
                      Media Files
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {mediaCount} items
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{
                    background: 'rgba(255,255,255,0.2)',
                    width: 32,
                    height: 32
                  }}>
                    <Assignment sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }}>
                      Tests Available
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {testCount} tests
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{
                    background: 'rgba(255,255,255,0.2)',
                    width: 32,
                    height: 32
                  }}>
                    <TrendingUp sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }}>
                      Progress
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Learning
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Fade>

        {/* Content Grid */}
        <Grid container spacing={4}>
          <Grid item xs={12} lg={8}>
            <Fade in timeout={1200}>
              <Box>
                <MediaRenderer data={data} loading={loading} />
              </Box>
            </Fade>
          </Grid>
          
          <Grid item xs={12} lg={4}>
            <Fade in timeout={1400}>
              <Box>
                <TestList relatedData={data?.topic_test || []} slugUrl='topic' loading={loading}/>
              </Box>
            </Fade>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default TopicContentView;
