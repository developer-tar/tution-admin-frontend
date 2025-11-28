import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Card,
  CardContent,
  Button,
  Container
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import QuizIcon from '@mui/icons-material/Quiz';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SubscriptionList from '../../components/SubscriptionList';
import MockExamSubscriptionList from '../../components/MockExamSubscriptionList';
import api from '../../api';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';

const ParentBilling = () => {
  const { parentId } = useParams();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [parentDetails, setParentDetails] = useState(null);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    if (parentId && tabValue === 0) {
      fetchSubscriptions();
    }
  }, [parentId, tabValue]);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const response = await api.get(`admin/parent/${parentId}/subscriptions`);
      if (response.data.success) {
        setSubscriptions(response.data.data || []);
        // Assuming API might return parent details too, or we fetch separately
        // setParentDetails(response.data.parent);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast.error('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      p: 3 
    }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate('/admin/parents')}
        sx={{ 
          mb: 3,
          color: '#5a6c7d',
          fontWeight: 600,
          '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' }
        }}
      >
        Back to Parent List
      </Button>

      <Box sx={{ mb: 4 }}>
        <Box sx={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: 2, 
          mb: 2,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '25px',
          px: 3,
          py: 1,
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.2)'
        }}>
          <Typography sx={{ fontSize: '20px', color: 'white' }}>🧾</Typography>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
            Parent Billing Details
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: '#5a6c7d', ml: 1 }}>
          Viewing subscriptions for Parent ID: <strong>{parentId}</strong>
        </Typography>
      </Box>

      <Card sx={{ 
        borderRadius: 4,
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        overflow: 'hidden'
      }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            sx={{
              px: 2,
              bgcolor: 'white',
              '& .MuiTab-root': {
                py: 3,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                color: '#718096',
                minHeight: 64,
                '&.Mui-selected': {
                  color: '#667eea',
                }
              },
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
              }
            }}
          >
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SchoolIcon />
                  Course Subscriptions
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <QuizIcon />
                  Mock Exam Subscriptions
                </Box>
              } 
            />
          </Tabs>
        </Box>

        <Box sx={{ p: 4, bgcolor: '#f8fafc', minHeight: 500 }}>
          {tabValue === 0 && (
            <SubscriptionList 
              subscriptions={subscriptions} 
              loading={loading} 
            />
          )}
          {tabValue === 1 && (
            <MockExamSubscriptionList />
          )}
        </Box>
      </Card>
    </Box>
  );
};

export default ParentBilling;

