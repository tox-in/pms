import React from 'react';
import { Button, Typography, Box, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box textAlign="center">
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to Parking Management System
        </Typography>
        <Typography variant="h5" color="textSecondary" paragraph>
          Manage your parking facilities efficiently
        </Typography>
        
        <Box sx={{ mt: 4 }}>
          <Button
            component={RouterLink}
            to="/auth/login"
            variant="contained"
            color="primary"
            size="large"
            sx={{ mr: 2 }}
          >
            Login
          </Button>
          <Button
            component={RouterLink}
            to="/auth/signup"
            variant="outlined"
            color="primary"
            size="large"
          >
            Sign Up
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default LandingPage;
