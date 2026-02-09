import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CircularProgress
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import QuizIcon from '@mui/icons-material/Quiz';
import DescriptionIcon from '@mui/icons-material/Description';
import SubscriptionList from '../../../components/SubscriptionList';
import MockExamSubscriptionList from '../../../components/MockExamSubscriptionList';
import PaperPurchases from '../PaperPurchases';
import api from '../../../api';
import { toast } from 'react-toastify';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';

const Billing = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [parentData, setParentData] = useState(null);
  const [parentStudents, setParentStudents] = useState([]);
  const [assigningCourseId, setAssigningCourseId] = useState(null);

  // Get current route segment (course, mock, or paper)
  const currentRoute = location.pathname.split('/').pop() || 'course';

  // Debug authentication and get parent data
  useEffect(() => {
    const userData = localStorage.getItem('userData');
    const token = localStorage.getItem('token');
    const adminToken = localStorage.getItem('admin-token');
    const role = localStorage.getItem('role');
    
    let parsedParentData = null;
    if (userData) {
      try {
        parsedParentData = JSON.parse(userData);
        setParentData(parsedParentData);
      } catch (error) {
        console.error('Error parsing userData from localStorage:', error);
      }
    }
    
    console.log('🏠 PARENT PANEL - Authentication Debug:', {
      currentPage: 'Parent Billing Page',
      url: window.location.href,
      userData: parsedParentData,
      parentId: parsedParentData?.id,
      parentName: parsedParentData?.full_name,
      parentEmail: parsedParentData?.email,
      token: token ? 'Present' : 'Missing',
      adminToken: adminToken ? 'Present' : 'Missing',
      role,
      activeToken: adminToken || token || parsedParentData?.access_token
    });
    
    if (!token && !adminToken && !parsedParentData?.access_token) {
      toast.error('No authentication token found. Please log in again.');
    }
  }, []);

  // Redirect to course if on base billing route
  useEffect(() => {
    if (location.pathname.endsWith('/billing') || location.pathname.endsWith('/billing/')) {
      navigate('course', { replace: true });
    }
  }, [location.pathname, navigate]);

  // Fetch subscriptions when route changes to course
  useEffect(() => {
    if (currentRoute === 'course') {
      fetchSubscriptions();
    }
  }, [currentRoute]);

  // Fetch parent students for course assign dropdown (same as papers)
  useEffect(() => {
    if (currentRoute !== 'course') return;
    const fetchStudents = async () => {
      try {
        const response = await api.get('parent/students/names');
        if (response.data.success && Array.isArray(response.data.data)) {
          setParentStudents(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching parent students for course assign:', err);
      }
    };
    fetchStudents();
  }, [currentRoute]);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      // Get parent data from localStorage
      const userData = localStorage.getItem('userData');
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      
      let parentData = null;
      if (userData) {
        try {
          parentData = JSON.parse(userData);
        } catch (error) {
          console.error('Error parsing userData:', error);
        }
      }
      
      console.log('🔍 DEBUGGING PARENT BILLING:');
      console.log('- Current URL:', window.location.href);
      console.log('- Parent Data:', parentData);
      console.log('- Parent ID:', parentData?.id);
      console.log('- Token:', token ? 'Present' : 'Missing');
      console.log('- Role:', role);
      console.log('- Access Token:', parentData?.access_token ? 'Present' : 'Missing');
      
      if (!parentData?.access_token && !token) {
        toast.error('No authentication token found. Please log in again.');
        return;
      }
      
      console.log('📡 Making API call to: parent/subscriptions');
      
      // Use the parent/subscriptions endpoint as it should automatically use the authenticated parent's ID
      const response = await api.get('parent/subscriptions');
      
      console.log('✅ API Response received:', response.data);
      console.log('- Success:', response.data.success);
      console.log('- Data:', response.data.data);
      console.log('- Message:', response.data.message);
      
      if (response.data.success) {
        const data = response.data.data || [];
        setSubscriptions(Array.isArray(data) ? data : []);
        console.log('📊 Subscriptions set in state:', data);
        
        // Silent loading - no success toast message
        if (!response.data.data || response.data.data.length === 0) {
          console.log('ℹ️ No subscriptions found for this parent');
        }
      } else {
        console.error('❌ API returned success: false', response.data);
        toast.error(response.data.message || 'Failed to load subscriptions');
      }
    } catch (error) {
      console.error('💥 ERROR fetching subscriptions:', error);
      console.error('📋 Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        headers: error.config?.headers
      });
      
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please log in again.');
      } else if (error.response?.status === 404) {
        toast.error('API endpoint not found. Backend may not be running.');
      } else if (error.response?.status === 500) {
        toast.error('Server error. Please check backend logs.');
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        toast.error('Cannot connect to server. Please check if backend is running.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to load subscription data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAssignCourseToStudent = async (courseId, studentId) => {
    if (!studentId) return;
    setAssigningCourseId(courseId);
    try {
      const response = await api.post('parent/assign-course-to-student', {
        course_id: Number(courseId),
        student_ids: [Number(studentId)],
      });
      if (response.data.success) {
        toast.success(response.data.message || 'Course assigned to student.');
        await fetchSubscriptions();
      } else {
        toast.error(response.data.message || 'Failed to assign course.');
      }
    } catch (error) {
      console.error('Error assigning course to student:', error);
      toast.error(error.response?.data?.message || 'Failed to assign course.');
    } finally {
      setAssigningCourseId(null);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      p: 3 
    }}>
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
          <Typography sx={{ fontSize: '20px', color: 'white' }}>💳</Typography>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
            Billing & Subscriptions
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: '#5a6c7d', ml: 1, maxWidth: 500 }}>
          Manage your course subscriptions, view payment history, and download receipts
        </Typography>
        {parentData && (
          <Box sx={{ 
            mt: 2, 
            p: 2, 
            bgcolor: 'rgba(102, 126, 234, 0.1)', 
            borderRadius: 2, 
            border: '1px solid rgba(102, 126, 234, 0.2)',
            maxWidth: 500
          }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#667eea' }}>
              🏠 Parent Panel - Logged in as:
            </Typography>
            <Typography variant="body2" sx={{ color: '#4a5568' }}>
              <strong>{parentData.full_name}</strong> (ID: {parentData.id})
            </Typography>
            <Typography variant="caption" sx={{ color: '#718096' }}>
              {parentData.email}
            </Typography>
          </Box>
        )}
      </Box>

      <Card sx={{ 
        borderRadius: 4,
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        overflow: 'hidden'
      }}>
        <Box sx={{ p: 4, bgcolor: '#f8fafc', minHeight: 500 }}>
          {currentRoute === 'course' && (
            <SubscriptionList 
              subscriptions={subscriptions} 
              loading={loading}
              parentStudents={parentStudents}
              onAssignCourseToStudent={handleAssignCourseToStudent}
              assigningCourseId={assigningCourseId}
            />
          )}
          {currentRoute === 'mock' && (
            <MockExamSubscriptionList />
          )}
          {currentRoute === 'paper' && (
            <PaperPurchases />
          )}
        </Box>
      </Card>
    </Box>
  );
};

export default Billing;

