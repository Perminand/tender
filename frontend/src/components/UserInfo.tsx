import React from 'react';
import { Box, Typography, Chip, Avatar, Paper } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const UserInfo: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
          {user.firstName.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" gutterBottom>
            {user.firstName} {user.lastName}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {user.email}
          </Typography>
          {user.companyName && (
            <Typography variant="body2" color="text.secondary">
              Компания: {user.companyName}
            </Typography>
          )}
          <Box sx={{ mt: 1 }}>
            {user.roles.map((role) => (
              <Chip
                key={role}
                label={role.replace('ROLE_', '')}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            ))}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default UserInfo; 