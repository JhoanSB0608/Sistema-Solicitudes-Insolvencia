import React from 'react';
import { Card, useTheme, alpha } from '@mui/material';

const GlassCard = React.forwardRef(({ children, sx = {}, hover = true }, ref) => {
  const theme = useTheme();
  return (
    <Card
      ref={ref}
      sx={{
        background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.4)} 100%)`,
        backdropFilter: 'blur(20px)',
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        ...(hover && {
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px) scale(1.01)',
            boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
            '&::before': {
              opacity: 1,
            }
          }
        }),
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.success.main})`,
          opacity: 0,
          transition: 'opacity 0.3s ease',
        },
        ...sx,
      }}
    >
      {children}
    </Card>
  );
});

export default GlassCard;
