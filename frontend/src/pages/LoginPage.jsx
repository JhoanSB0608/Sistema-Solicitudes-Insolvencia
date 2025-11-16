import React, { useContext, useState } from 'react';
import { TextField, Button, Typography, Box, Paper, Divider } from '@mui/material';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../App'; // Importar el contexto de autenticación
import GoogleIcon from '@mui/icons-material/Google';

const LoginPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useContext(AuthContext);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
        // Background with glassmorphism effect
        background: `
          linear-gradient(135deg, rgba(74, 144, 226, 0.1) 0%, rgba(138, 43, 226, 0.1) 100%),
          radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.2), transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.2), transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(30, 144, 255, 0.2), transparent 50%)
        `,
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          opacity: 0.1,
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
          maxWidth: 440,
          width: '100%',
          margin: 'auto',
          // Glassmorphism effect
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
          // Subtle animation
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
          // Inner glow effect
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
          },
          // Hover effect
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
        {/* Logo/Icon */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 3,
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
              mb: 2,
              '&::before': {
                content: '"🔐"',
                fontSize: '28px',
              },
            }}
          />
        </Box>

        {/* Title */}
        <Typography 
          variant="h4" 
          sx={{ 
            mb: 1,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: 700,
            fontSize: { xs: '1.5rem', sm: '2rem' },
          }}
        >
          Iniciar Sesión
        </Typography>

        {/* Subtitle */}
        <Typography 
          variant="body1" 
          sx={{ 
            mb: 4,
            textAlign: 'center',
            color: 'rgba(0, 0, 0, 0.6)',
            fontSize: '0.95rem',
          }}
        >
          Accede a tu cuenta para continuar
        </Typography>

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <TextField
            {...register('email', { 
              required: 'Email es requerido',
              pattern: {
                value: /^\S+@\S+$/i,
                message: 'Email no válido'
              }
            })}
            label="Email"
            fullWidth
            margin="normal"
            error={!!errors.email}
            helperText={errors.email?.message}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '& fieldset': {
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                },
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.15)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  '& fieldset': {
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                  },
                },
                '&.Mui-focused': {
                  background: 'rgba(255, 255, 255, 0.2)',
                  '& fieldset': {
                    border: '2px solid rgba(102, 126, 234, 0.5) !important',
                  },
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(0, 0, 0, 0.6)',
                '&.Mui-focused': {
                  color: '#667eea',
                },
              },
              '& .MuiOutlinedInput-input': {
                color: 'rgba(0, 0, 0, 0.87)',
                '&::placeholder': {
                  color: 'rgba(0, 0, 0, 0.4)',
                },
              },
            }}
          />

          <TextField
            {...register('password', { 
              required: 'Contraseña es requerida',
              minLength: {
                value: 6,
                message: 'La contraseña debe tener al menos 6 caracteres'
              }
            })}
            label="Contraseña"
            type="password"
            fullWidth
            margin="normal"
            error={!!errors.password}
            helperText={errors.password?.message}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '& fieldset': {
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                },
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.15)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  '& fieldset': {
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                  },
                },
                '&.Mui-focused': {
                  background: 'rgba(255, 255, 255, 0.2)',
                  '& fieldset': {
                    border: '2px solid rgba(102, 126, 234, 0.5) !important',
                  },
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(0, 0, 0, 0.6)',
                '&.Mui-focused': {
                  color: '#667eea',
                },
              },
              '& .MuiOutlinedInput-input': {
                color: 'rgba(0, 0, 0, 0.87)',
                '&::placeholder': {
                  color: 'rgba(0, 0, 0, 0.4)',
                },
              },
            }}
          />

          <Button 
            type="submit" 
            fullWidth
            disabled={isSubmitting}
            sx={{
              mt: 2,
              py: 1.5,
              borderRadius: '16px',
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                transition: 'left 0.5s',
              },
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 32px rgba(102, 126, 234, 0.5)',
                '&::before': {
                  left: '100%',
                },
              },
              '&:active': {
                transform: 'translateY(0px)',
              },
              '&:disabled': {
                background: 'rgba(0, 0, 0, 0.12)',
                color: 'rgba(0, 0, 0, 0.26)',
                boxShadow: 'none',
                transform: 'none',
              },
            }}
          >
            {isSubmitting ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' },
                    },
                  }}
                />
                Iniciando sesión...
              </Box>
            ) : (
              'Iniciar Sesión'
            )}
          </Button>
        </Box>

        <Divider sx={{ my: 3, '&::before, &::after': { borderColor: 'rgba(255, 255, 255, 0.2)' } }}>
          <Typography variant="caption" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>O</Typography>
        </Divider>

        <Button
          component="a"
          href={`${process.env.REACT_APP_API_URL}/api/auth/google`}
          fullWidth
          variant="outlined"
          startIcon={<GoogleIcon />}
          sx={{
            py: 1.5,
            borderRadius: '16px',
            fontSize: '1rem',
            fontWeight: 600,
            textTransform: 'none',
            borderColor: 'rgba(0, 0, 0, 0.23)',
            color: 'rgba(0, 0, 0, 0.87)',
            '&:hover': {
              borderColor: '#4285F4',
              backgroundColor: 'rgba(66, 133, 244, 0.04)',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          Iniciar Sesión con Google
        </Button>

        {/* Footer links */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(0, 0, 0, 0.6)',
              '& a': {
                color: '#667eea',
                textDecoration: 'none',
                fontWeight: 500,
                '&:hover': {
                  textDecoration: 'underline',
                },
              },
            }}
          >
            ¿No tienes una cuenta?{' '}
            <a href="/register">Regístrate aquí</a>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginPage;
