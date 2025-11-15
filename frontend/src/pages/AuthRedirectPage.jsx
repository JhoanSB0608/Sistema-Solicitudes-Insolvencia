import React, { useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { Box, CircularProgress, Typography } from '@mui/material';

const AuthRedirectPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // No need for loadUser here, as we're forcing a reload.
  // const { loadUser } = useContext(AuthContext); 

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      try {
        // Store only the token initially. AuthProvider will fetch full user data.
        localStorage.setItem('userInfo', JSON.stringify({ token: token }));
        window.location.href = '/admin'; // Force reload to trigger AuthProvider's useEffect
      } catch (error) {
        console.error('Failed to store token from URL', error);
        navigate('/login?error=store_failed');
      }
    } else {
      navigate('/login?error=missing_token');
    }
  }, [searchParams, navigate]);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', flexDirection: 'column' }}>
      <CircularProgress />
      <Typography sx={{ mt: 2 }}>Finalizando autenticación...</Typography>
    </Box>
  );
};

export default AuthRedirectPage;
