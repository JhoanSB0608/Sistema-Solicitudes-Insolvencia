import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Box, Typography, Paper, Button } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const VerificationSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setStatus(searchParams.get('status'));
    setMessage(searchParams.get('message'));
  }, [searchParams]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
        background: `
          linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(30, 144, 255, 0.1) 100%),
          radial-gradient(circle at 20% 80%, rgba(76, 175, 80, 0.2), transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(30, 144, 255, 0.2), transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(138, 43, 226, 0.15), transparent 50%)
        `,
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, #4caf50 0%, #2196f3 50%, #9c27b0 100%)',
          opacity: 0.08,
          zIndex: -2,
        },
        '&::after': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 0%, transparent 70%),
            radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.05) 0%, transparent 70%)
          `,
          zIndex: -1,
        },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          padding: { xs: 3, sm: 4, md: 5 },
          maxWidth: 480,
          width: '100%',
          margin: 'auto',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
          backdropFilter: 'blur(25px)',
          WebkitBackdropFilter: 'blur(25px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '24px',
          boxShadow: `
            0 8px 32px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            0 0 0 1px rgba(255, 255, 255, 0.05)
          `,
          position: 'relative',
          overflow: 'hidden',
          animation: 'fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          '@keyframes fadeInUp': {
            '0%': {
              opacity: 0,
              transform: 'translateY(30px)',
            },
            '100%': {
              opacity: 1,
              transform: 'translateY(0)',
            },
          },
          '&:hover': {
            boxShadow: `
              0 12px 40px rgba(0, 0, 0, 0.15),
              inset 0 1px 0 rgba(255, 255, 255, 0.3),
              0 0 0 1px rgba(255, 255, 255, 0.1)
            `,
            transform: 'translateY(-2px)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 3,
            color: status === 'success' ? '#4caf50' : '#f44336',
          }}
        >
          {status === 'success' ? (
            <CheckCircleOutlineIcon sx={{ fontSize: 80 }} />
          ) : (
            <ErrorOutlineIcon sx={{ fontSize: 80 }} />
          )}
        </Box>

        <Typography
          variant="h4"
          sx={{
            mb: 1,
            textAlign: 'center',
            background: status === 'success' ? 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)' : 'linear-gradient(135deg, #f44336 0%, #ff9800 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: 700,
            fontSize: { xs: '1.5rem', sm: '2rem' },
          }}
        >
          {status === 'success' ? '¡Verificación Exitosa!' : 'Error de Verificación'}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            mb: 4,
            textAlign: 'center',
            color: 'rgba(0, 0, 0, 0.7)',
            fontSize: '0.95rem',
          }}
        >
          {message || (status === 'success'
            ? 'Tu correo electrónico ha sido verificado exitosamente. Ahora puedes iniciar sesión.'
            : 'Hubo un problema al verificar tu correo electrónico. El token puede ser inválido o haber expirado.')}
        </Typography>

        <Button
          component={Link}
          to="/login"
          fullWidth
          variant="contained"
          sx={{
            mt: 2,
            py: 1.5,
            borderRadius: '16px',
            fontSize: '1rem',
            fontWeight: 600,
            textTransform: 'none',
            background: status === 'success' ? 'linear-gradient(135deg, #4caf50 0%, #2196f3 100%)' : 'linear-gradient(135deg, #f44336 0%, #ff9800 100%)',
            color: 'white',
            border: 'none',
            boxShadow: '0 8px 24px rgba(76, 175, 80, 0.4)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              background: status === 'success' ? 'linear-gradient(135deg, #45a049 0%, #1e88e5 100%)' : 'linear-gradient(135deg, #d32f2f 0%, #e65100 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 32px rgba(76, 175, 80, 0.5)',
            },
            '&:active': {
              transform: 'translateY(0px)',
            },
          }}
        >
          Ir a Iniciar Sesión
        </Button>
      </Paper>
    </Box>
  );
};

export default VerificationSuccessPage;
