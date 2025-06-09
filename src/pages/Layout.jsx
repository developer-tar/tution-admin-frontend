import React from 'react';
import { Box } from '@mui/material';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <Box>
      <Topbar />
      <Box sx={{ display: "flex", height: "100vh" }}>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
