import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, CircularProgress, useTheme, alpha } from '@mui/material';
import { Warning } from '@mui/icons-material';

const SessionTimeoutModal = ({ open, onLogout, onStay }) => {
  const theme = useTheme();
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    if (!open) {
      setCountdown(30);
      return;
    }

    if (countdown === 0) {
      onLogout();
      return;
    }

    const timerId = setTimeout(() => {
      setCountdown(c => c - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [open, countdown, onLogout]);

  return (
    <Dialog 
      open={open} 
      onClose={onStay}
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Warning sx={{ color: theme.palette.warning.main, fontSize: 32 }} />
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            ¿Sigues ahí?
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', gap: 2, my: 2, textAlign: 'center' }}>
          <Typography>
            Tu sesión está a punto de expirar por inactividad.
          </Typography>
          <Box sx={{ position: 'relative', display: 'inline-flex', my: 2 }}>
            <CircularProgress 
              variant="determinate" 
              value={(countdown / 30) * 100} 
              size={80}
              thickness={4}
              sx={{ color: theme.palette.primary.main }}
            />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h4" component="div" color="text.primary" sx={{ fontWeight: 'bold' }}>
                {countdown}
              </Typography>
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary">
            segundos restantes
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Button onClick={onLogout} color="secondary" sx={{ borderRadius: 2 }}>
          Cerrar Sesión
        </Button>
        <Button onClick={onStay} variant="contained" autoFocus sx={{ borderRadius: 2 }}>
          Permanecer Conectado
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SessionTimeoutModal;
