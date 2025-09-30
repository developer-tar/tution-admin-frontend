<<<<<<< HEAD
// Topbar.jsx
import React from 'react';
import { Box, IconButton, Avatar, Typography } from '@mui/material';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import SettingsIcon from '@mui/icons-material/Settings';

const Topbar = () => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: '#fff', boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)' }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <img src="assets/images/logo.svg" alt="" />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton>
          <NotificationsNoneIcon />
        </IconButton>
        <IconButton>
          <SettingsIcon />
        </IconButton>
        <Avatar sx={{ bgcolor: '#fde2e2', ml: 1 }} />
      </Box>
    </Box>
  );
};

=======
// Topbar.jsx
import React from 'react';
import { Box, IconButton, Avatar, Typography } from '@mui/material';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import SettingsIcon from '@mui/icons-material/Settings';

const Topbar = () => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: '#fff', boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)' }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <img src="assets/images/logo.svg" alt="" />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton>
          <NotificationsNoneIcon />
        </IconButton>
        <IconButton>
          <SettingsIcon />
        </IconButton>
        <Avatar sx={{ bgcolor: '#fde2e2', ml: 1 }} />
      </Box>
    </Box>
  );
};

>>>>>>> master
export default Topbar;