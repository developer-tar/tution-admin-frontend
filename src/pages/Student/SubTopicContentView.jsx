import { Container, Grid, Box, Typography, Card, CardContent, Avatar, Chip, Fade, IconButton, Tooltip } from '@mui/material';
import { ArrowBack, PlayCircleOutline, School, Assignment, Visibility, TrendingUp } from '@mui/icons-material';
import VideoLessonHeader from '../Videos/VideoLessonHeader';
import MediaRenderer from '../Videos/MediaRenderer';
import TestList from '../Videos/TestList';
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";
import { toast } from "react-toastify";

const SubTopicContentView = () => {
    const { sub_topic_id } = useParams(); // Grab :id from URL
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get(`/student/subtopic/content/view/${sub_topic_id}`);

                setData(res.data.data || null);
            } catch (err) {
                toast.error("Failed to fetch video lesson");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [sub_topic_id]);


    // Calculate stats
    const mediaCount = data?.media?.length || 0;
    const testCount = Object.keys(data?.sub_topic_test || {}).length;

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
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
                                        📚 {loading ? 'Loading...' : data?.topic_name || 'Sub Topic Content'}
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
                                <TestList relatedData={data?.sub_topic_test || []} slugUrl='subtopic' loading={loading} />
                            </Box>
                        </Fade>
                    </Grid>
                </Grid>
        </Container>
    );
};

export default SubTopicContentView;
