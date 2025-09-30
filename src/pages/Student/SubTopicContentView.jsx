import { Container, Grid } from '@mui/material';
import VideoLessonHeader from '../Videos/VideoLessonHeader';
import MediaRenderer from '../Videos/MediaRenderer';
import TestList from '../Videos/TestList';
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api";
import { toast } from "react-toastify";

const SubTopicContentView = () => {
    const { sub_topic_id } = useParams(); // Grab :id from URL
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


    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <VideoLessonHeader getContent={data?.topic_name}   loading={loading}/>
            <Grid container spacing={4}>
                <Grid item xs={12} md={8}>
                    <MediaRenderer data={data} loading={loading} />
                </Grid>
                <Grid item xs={12} md={4}>
                    <TestList relatedData={data?.sub_topic_test || []} slugUrl='subtopic' loading={loading} />
                </Grid>
            </Grid>
        </Container>
    );
};

export default SubTopicContentView;
