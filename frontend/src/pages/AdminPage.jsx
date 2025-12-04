import React, { useState, useMemo, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminStats, getAdminSolicitudes, uploadAnexo } from '../services/adminService';
import { downloadSolicitudDocument } from '../services/solicitudService';
import { downloadConciliacionDocument } from '../services/conciliacionService';
import { toast } from 'react-toastify';
import { handleAxiosError } from '../utils/alert';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  flexRender,
} from '@tanstack/react-table';
import { 
  Box, Grid, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Tabs, Tab, CircularProgress, Alert, Stack, IconButton, TablePagination, TextField, useTheme,
  alpha, Card, CardContent, Avatar, Container, Tooltip, Chip, Fade, Grow, Slide, Button,
  InputAdornment, ButtonGroup, Badge, Divider, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText, ListItemIcon, Accordion, AccordionSummary, AccordionDetails, TableFooter
} from '@mui/material';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  Legend, ResponsiveContainer, Area, AreaChart, LineChart, Line
} from 'recharts';
import { useDebounce } from '../hooks/useDebounce';
import {
    ArrowUpward, ArrowDownward, People as PeopleIcon, Assignment as AssignmentIcon,
    Category as CategoryIcon, TrendingUp as TrendingUpIcon, PictureAsPdf, Description,
    Dashboard as DashboardIcon, History as HistoryIcon, Group as GroupIcon,
    Search, FilterList, Refresh, GetApp, Visibility, Analytics, Timeline,
    AutoGraph, Speed, Star, Lightbulb, Edit as EditIcon, ExpandMore as ExpandMoreIcon,
    Close as CloseIcon, CloudUpload as CloudUploadIcon, Download as DownloadIcon, KeyboardArrowDown, KeyboardArrowUp, Person, Folder, Handshake, Gavel, Balance, AttachMoney, FamilyRestroom, FoodBank, HomeWork, DirectionsCar, FactCheck
} from '@mui/icons-material';
// --- Enhanced Dashboard Components ---

import GlassCard from '../components/common/GlassCard';

const AnimatedMetricCard = ({ title, value, subtitle, icon: IconComponent, color, trend, index }) => {
  const theme = useTheme();
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), index * 100);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <Grow in={animated} timeout={600} style={{ transformOrigin: 'center top' }}>
      <div>
        <GlassCard>
          <CardContent sx={{ p: 3, position: 'relative' }}>
            {/* Animated background gradient */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '80px',
                height: '80px',
                background: `radial-gradient(circle, ${alpha(color, 0.1)} 0%, transparent 70%)`,
                borderRadius: '50%',
                transform: 'translate(30%, -30%)',
              }}
            />
            
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
              <Avatar 
                sx={{ 
                  bgcolor: alpha(color, 0.15),
                  color: color,
                  width: 56, 
                  height: 56,
                  boxShadow: `0 8px 24px ${alpha(color, 0.2)}`,
                  border: `2px solid ${alpha(color, 0.1)}`,
                }}
              >
                <IconComponent sx={{ fontSize: 28 }} />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {title}
                </Typography>
                {trend && (
                  <Chip 
                    icon={<TrendingUpIcon />} 
                    label={`+${trend}%`} 
                    size="small" 
                    sx={{ 
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      color: theme.palette.success.main,
                      fontWeight: 600
                    }} 
                  />
                )}
              </Box>
            </Stack>

            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 800, 
                background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.7)} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                mb: 1,
                fontFamily: '"Inter", "Roboto", sans-serif'
              }}
            >
              {animated ? value?.toLocaleString() : '0'}
            </Typography>

            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                {subtitle}
              </Typography>
            )}
          </CardContent>
        </GlassCard>
      </div>
    </Grow>
  );
};

const InteractiveChartContainer = ({ title, subtitle, children, color, icon: IconComponent, actions }) => {
  const theme = useTheme();
  return (
    <GlassCard sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: alpha(color, 0.1), color: color, width: 40, height: 40 }}>
              <IconComponent />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="body2" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Stack>
          {actions && (
            <Stack direction="row" spacing={1}>
              {actions}
            </Stack>
          )}
        </Stack>
        <Box sx={{ flex: 1, minHeight: 0 }}>
          {children}
        </Box>
      </CardContent>
    </GlassCard>
  );
};

const CyclingTypeCard = ({ types, color, icon: IconComponent, index }) => {
  const theme = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [show, setShow] = useState(true);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), index * 100);
    return () => clearTimeout(timer);
  }, [index]);

  useEffect(() => {
    if (!types || types.length <= 1) return;
    const intervalId = setInterval(() => {
      setShow(false);
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % Math.min(types.length, 3));
        setShow(true);
      }, 400);
    }, 4000);
    return () => clearInterval(intervalId);
  }, [types]);

  if (!types || types.length === 0) {
    return <AnimatedMetricCard title="Top Tipo Solicitud" value={0} subtitle="N/A" color={color} icon={IconComponent} index={index} />;
  }

  const currentType = types[currentIndex];
  const rank = ["Top Tipo", "2º Tipo", "3er Tipo"][currentIndex];

  return (
    <Grow in={animated} timeout={600} style={{ transformOrigin: 'center top' }}>
      <div>
        <GlassCard>
          <CardContent sx={{ p: 3, position: 'relative', minHeight: '197px' }}>
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '80px',
                height: '80px',
                background: `radial-gradient(circle, ${alpha(color, 0.1)} 0%, transparent 70%)`,
                borderRadius: '50%',
                transform: 'translate(30%, -30%)',
              }}
            />
            <Fade in={show} timeout={300}>
              <Box>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: alpha(color, 0.15),
                      color: color,
                      width: 56, 
                      height: 56,
                      boxShadow: `0 8px 24px ${alpha(color, 0.2)}`,
                      border: `2px solid ${alpha(color, 0.1)}`,
                    }}
                  >
                    <IconComponent sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {rank}
                    </Typography>
                  </Box>
                </Stack>

                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 800, 
                    background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.7)} 100%)`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                    mb: 1,
                    fontFamily: '"Inter", "Roboto", sans-serif'
                  }}
                >
                  {currentType.count.toLocaleString()}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500,  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentType._id}
                </Typography>
              </Box>
            </Fade>
          </CardContent>
        </GlassCard>
      </div>
    </Grow>
  );
};

const EnhancedDashboard = ({ stats }) => {
  const theme = useTheme();

  const metrics = [
    {
      title: "Usuarios Totales",
      value: stats.totalUsuarios,
      icon: PeopleIcon,
      color: theme.palette.primary.main,
    },
    {
      title: "Solicitudes Totales",
      value: stats.totalSolicitudes,
      icon: AssignmentIcon,
      color: theme.palette.secondary.main,
    },
    {
      title: "Acreedores Totales",
      value: stats.totalAcreedores,
      icon: GroupIcon,
      color: theme.palette.warning.main,
    },
  ];

  return (
    <Stack spacing={4}>
      {/* Animated Metrics Row */}
      <Grid container spacing={3}>
        {metrics.map((metric, index) => (
          <Grid item xs={12} sm={6} lg={3} key={metric.title}>
            <AnimatedMetricCard {...metric} index={index} />
          </Grid>
        ))}
        <Grid item xs={12} sm={6} lg={3}>
          <CyclingTypeCard types={stats.solicitudesPorTipo} color={theme.palette.success.main} icon={CategoryIcon} index={2} />
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <InteractiveChartContainer 
            title="Tendencias Temporales" 
            subtitle="Evolución mensual de solicitudes"
            color={theme.palette.error.main}
            icon={Timeline}
          >
            <EnhancedAreaChart data={stats.solicitudesPorMes} />
          </InteractiveChartContainer>
        </Grid>

        <Grid item xs={12} lg={4}>
          <InteractiveChartContainer 
            title="Distribución Global" 
            subtitle="Tipos de solicitudes"
            color={theme.palette.info.main}
            icon={Analytics}
          >
            <EnhancedPieChart data={stats.solicitudesPorTipo} />
          </InteractiveChartContainer>
        </Grid>
      </Grid>
    </Stack>
  );
};

const EnhancedPieChart = ({ data }) => {
  const theme = useTheme();
  const COLORS = [
    theme.palette.primary.main, 
    theme.palette.secondary.main, 
    theme.palette.success.main, 
    theme.palette.warning.main, 
    theme.palette.info.main,
    theme.palette.error.main
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper 
          sx={{ 
            p: 2, 
            background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            borderRadius: 2,
            boxShadow: theme.shadows[8]
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600,  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {payload[0].name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {payload[0].value} solicitudes
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <defs>
          {COLORS.map((color, index) => (
            <linearGradient key={index} id={`gradient-${index}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.8}/>
              <stop offset="100%" stopColor={color} stopOpacity={0.6}/>
            </linearGradient>
          ))}
        </defs>
        <Pie 
          data={data} 
          dataKey="count" 
          nameKey="_id" 
          cx="50%" 
          cy="50%" 
          outerRadius="80%"
          innerRadius="50%"
          paddingAngle={2}
          animationBegin={0}
          animationDuration={1200}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={`url(#gradient-${index % COLORS.length})`}
              stroke={COLORS[index % COLORS.length]}
              strokeWidth={2}
            />
          ))}
        </Pie>
        <RechartsTooltip content={<CustomTooltip />} />
        <Legend 
          iconType="circle"
          formatter={(value) => <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', display: 'inline-block', maxWidth: '100px', verticalAlign: 'middle' }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

const EnhancedAreaChart = ({ data }) => {
  const theme = useTheme();
  const chartData = data.map(item => ({ 
    name: `${item._id.month}/${item._id.year}`, 
    Solicitudes: item.count,
    Mes: item._id.month,
    Año: item._id.year
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper 
          sx={{ 
            p: 2, 
            background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
            borderRadius: 2,
            boxShadow: theme.shadows[8]
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            {label}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box sx={{ 
              width: 12, 
              height: 12, 
              borderRadius: '50%', 
              bgcolor: theme.palette.error.main 
            }} />
            <Typography variant="body2">
              {payload[0].value} solicitudes
            </Typography>
          </Stack>
        </Paper>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="solicitudesAreaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={theme.palette.error.main} stopOpacity={0.3}/>
            <stop offset="95%" stopColor={theme.palette.error.main} stopOpacity={0.0}/>
          </linearGradient>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor={alpha(theme.palette.error.main, 0.3)}/>
          </filter>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} vertical={false} />
        <XAxis 
          dataKey="name" 
          tickLine={false} 
          axisLine={false}
          tick={{ fontSize: 12, fontWeight: 500 }}
        />
        <YAxis 
          tickLine={false} 
          axisLine={false}
          tick={{ fontSize: 12, fontWeight: 500 }}
        />
        <RechartsTooltip content={<CustomTooltip />} />
        <Area 
          type="monotone" 
          dataKey="Solicitudes" 
          stroke={theme.palette.error.main}
          strokeWidth={3}
          fill="url(#solicitudesAreaGradient)"
          // filter="url(#shadow)"
          animationDuration={1500}
          animationBegin={200}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

const DetailItem = ({ label, value }) => (
    <Grid item xs={12} sm={6}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
            {label}
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {value || 'N/A'}
        </Typography>
    </Grid>
);

const DeudorModal = ({ open, onClose, deudor }) => {
    const theme = useTheme();
    if (!deudor) return null;
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{
            sx: {
                background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.6)} 100%)`,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                borderRadius: 3,
            }
        }}>
            <DialogTitle>
                Información del Deudor
                <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant="h6">{deudor.nombreCompleto}</Typography>
                    </Grid>
                    <DetailItem label="Tipo y Número de Identificación" value={`${deudor.tipoIdentificacion} - ${deudor.cedula}`} />
                    <DetailItem label="Lugar de Expedición" value={`${deudor.ciudadExpedicion}, ${deudor.departamentoExpedicion}`} />
                    <DetailItem label="Teléfono" value={deudor.telefono} />
                    <DetailItem label="Email" value={deudor.email} />
                    <DetailItem label="País de Origen" value={deudor.paisOrigen} />
                    <DetailItem label="Fecha de Nacimiento" value={new Date(deudor.fechaNacimiento).toLocaleDateString()} />
                    <DetailItem label="Género" value={deudor.genero} />
                    <DetailItem label="Estado Civil" value={deudor.estadoCivil} />
                    <DetailItem label="Etnia" value={deudor.etnia} />
                    <DetailItem label="Discapacidad" value={deudor.discapacidad} />
                    <DetailItem label="Domicilio" value={`${deudor.domicilio}, ${deudor.ciudad}, ${deudor.departamento}`} />
                    <DetailItem label="Tipo Persona" value={deudor.tipoPersonaNatural} />
                </Grid>
            </DialogContent>
        </Dialog>
    );
};

const AcreedoresModal = ({ open, onClose, acreedores }) => {
    const theme = useTheme();
    if (!acreedores) return null;
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{
            sx: {
                background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.6)} 100%)`,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                borderRadius: 3,
            }
        }}>
            <DialogTitle>
                Acreedores
                <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Nombre del Acreedor</TableCell>
                                <TableCell>Documento</TableCell>
                                <TableCell align="right">Capital</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {acreedores.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.acreedor?.nombreCompleto || 'N/A'}</TableCell>
                                    <TableCell>{`${item.acreedor?.tipoIdentificacion || ''} - ${item.acreedor?.numeroIdentificacion || ''}`}</TableCell>
                                    <TableCell align="right">${item.capital?.toLocaleString() || 0}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
        </Dialog>
    );
};

const InvolucradosModal = ({ open, onClose, involucrados, title }) => {
    const theme = useTheme();
    if (!involucrados) return null;
    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{
            sx: {
                background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.6)} 100%)`,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                borderRadius: 3,
            }
        }}>
            <DialogTitle>
                {title}
                <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                {involucrados.map((p, index) => (
                    <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
                        <Typography variant="h6">{`${p.primerNombre} ${p.segundoNombre || ''} ${p.primerApellido} ${p.segundoApellido || ''}`}</Typography>
                        <Grid container spacing={2}>
                            <DetailItem label="Tipo Involucrado" value={p.tipoInvolucrado} />
                            <DetailItem label="Identificación" value={`${p.tipoIdentificacion} ${p.numeroIdentificacion}`} />
                            <DetailItem label="Lugar de Expedición" value={`${p.ciudadExpedicion}, ${p.departamentoExpedicion}`} />
                            <DetailItem label="Teléfono" value={p.telefono} />
                            <DetailItem label="Email" value={p.email} />
                            <DetailItem label="País de Origen" value={p.paisOrigen} />
                            <DetailItem label="Fecha de Nacimiento" value={new Date(p.fechaNacimiento).toLocaleDateString()} />
                            <DetailItem label="Género" value={p.genero} />
                            <DetailItem label="Estado Civil" value={p.estadoCivil} />
                            <DetailItem label="Domicilio" value={`${p.domicilio}, ${p.ciudad}, ${p.departamento}`} />
                        </Grid>
                    </Box>
                ))}
            </DialogContent>
        </Dialog>
    );
};

const AnexosSection = ({ anexos, solicitudId, tipoSolicitud, onUploadSuccess }) => {
  const fileInputRef = React.useRef(null);
  const { mutate: uploadFile, isLoading } = useMutation(uploadAnexo, {
      onSuccess: () => {
          toast.success("Archivo subido con éxito");
          onUploadSuccess();
      },
      onError: (error) => {
          handleAxiosError(error);
      }
  });

  const handleFileChange = (event) => {
      const file = event.target.files[0];
      if (file) {
          const formData = new FormData();
          formData.append('anexo', file);
          uploadFile({ id: solicitudId, tipo: tipoSolicitud.startsWith('Solicitud de Insolvencia') ? 'insolvencia' : 'conciliacion', formData });
      }
  };

  const handleDownload = async (anexo) => {
    const toastId = toast.loading(`Descargando ${anexo.filename}...`);
    try {
        const service = tipoSolicitud.startsWith('Solicitud de Insolvencia') ? downloadSolicitudDocument : downloadConciliacionDocument;
        await service(solicitudId, 'anexo', anexo.filename);
        toast.update(toastId, { render: "Descarga completada!", type: "success", isLoading: false, autoClose: 3000 });
    } catch (error) {
        toast.update(toastId, { render: "Error en la descarga", type: "error", isLoading: false, autoClose: 3000 });
        handleAxiosError(error);
    }
  }


  return (
      <Box>
          <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
          />
          <Button
              startIcon={<CloudUploadIcon />}
              variant="contained"
              onClick={() => fileInputRef.current.click()}
              disabled={isLoading}
              sx={{ mb: 2 }}
          >
              {isLoading ? 'Subiendo...' : 'Subir Documento'}
          </Button>
          <List>
              {anexos?.map((anexo, index) => (
                  <ListItem key={index} secondaryAction={
                      <IconButton edge="end" aria-label="download" onClick={() => handleDownload(anexo)}>
                          <DownloadIcon />
                      </IconButton>
                  }>
                      <ListItemIcon><Description /></ListItemIcon>
                      <ListItemText primary={anexo.filename} secondary={anexo.descripcion || `${(anexo.size / 1024).toFixed(2)} KB`} />
                  </ListItem>
              ))}
          </List>
      </Box>
  );
};


const InsolvenciaDetails = ({ solicitud, onUploadSuccess }) => {
    const gastos = solicitud.informacionFinanciera?.gastosPersonales || {};
    return (
        <Box sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
            <Accordion><AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography>Causas</Typography></AccordionSummary><AccordionDetails>
                {solicitud.causas?.lista.map((c, i) => <p key={i}><b>{c.tipoCausa}:</b> {c.descripcionCausa}</p>)}
            </AccordionDetails></Accordion>
            <Accordion><AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography>Bienes Muebles</Typography></AccordionSummary><AccordionDetails>
                {solicitud.bienesMuebles?.map((b, i) => <p key={i}>{b.clasificacion} - {b.descripcion} ({b.marca}): ${b.avaluoComercial?.toLocaleString()}</p>)}
            </AccordionDetails></Accordion>
            <Accordion><AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography>Bienes Inmuebles</Typography></AccordionSummary><AccordionDetails>
                 {solicitud.bienesInmuebles?.map((b, i) => <p key={i}>{b.descripcion} - Matrícula: {b.matriculaInmobiliaria}</p>)}
            </AccordionDetails></Accordion>
            <Accordion><AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography>Procesos Judiciales</Typography></AccordionSummary><AccordionDetails>
                {solicitud.informacionFinanciera?.procesosJudiciales?.map((p, i) => <p key={i}>{p.tipoProceso} vs {p.demandado}</p>)}
            </AccordionDetails></Accordion>
            <Accordion><AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography>Obligaciones Alimentarias</Typography></AccordionSummary><AccordionDetails>
                {solicitud.informacionFinanciera?.obligacionesAlimentarias?.map((o, i) => <p key={i}>{o.beneficiario} - Cuantía: ${o.cuantia?.toLocaleString()}</p>)}
            </AccordionDetails></Accordion>
            <Accordion><AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography>Gastos de Subsistencia</Typography></AccordionSummary><AccordionDetails>
                {Object.entries(gastos).map(([key, value]) => value && !key.startsWith('_') && <p key={key}>{key}: ${Number(value).toLocaleString()}</p>)}
            </AccordionDetails></Accordion>
            <Accordion><AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography>Propuesta de Pago</Typography></AccordionSummary><AccordionDetails>
                <p><b>Tipo:</b> {solicitud.propuestaPago?.tipoNegociacion}</p>
                <p><b>Plazo:</b> {solicitud.propuestaPago?.plazo} meses</p>
                <p><b>Descripción:</b> {solicitud.propuestaPago?.descripcion}</p>
            </AccordionDetails></Accordion>
            <Accordion><AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography>Documentos/Anexos</Typography></AccordionSummary><AccordionDetails>
                <AnexosSection anexos={solicitud.anexos} solicitudId={solicitud._id} tipoSolicitud={solicitud.tipoSolicitud} onUploadSuccess={onUploadSuccess} />
            </AccordionDetails></Accordion>
        </Box>
    );
};

const ConciliacionDetails = ({ solicitud, onUploadSuccess }) => (
    <Box sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
        <Accordion defaultExpanded><AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography>Hechos</Typography></AccordionSummary><AccordionDetails>
            {solicitud.hechos?.map((h, i) => <p key={i} dangerouslySetInnerHTML={{ __html: h.descripcion }} />)}
        </AccordionDetails></Accordion>
        <Accordion defaultExpanded><AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography>Pretensiones</Typography></AccordionSummary><AccordionDetails>
            {solicitud.pretensiones?.map((p, i) => <p key={i} dangerouslySetInnerHTML={{ __html: p.descripcion }} />)}
        </AccordionDetails></Accordion>
        <Accordion><AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography>Fundamentos</Typography></AccordionSummary><AccordionDetails>
            <p>No hay datos de fundamentos en la estructura actual.</p>
        </AccordionDetails></Accordion>
        <Accordion defaultExpanded><AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography>Documentos/Anexos</Typography></AccordionSummary><AccordionDetails>
            <AnexosSection anexos={solicitud.anexos} solicitudId={solicitud._id} tipoSolicitud={solicitud.tipoSolicitud} onUploadSuccess={onUploadSuccess} />
        </AccordionDetails></Accordion>
    </Box>
);

const EnhancedTable = ({ table, isLoading, solicitudesData, navigate, onDownload, onOpenModal, onUploadSuccess }) => {
  const theme = useTheme();

  const ActionButton = ({ onClick, icon: Icon, tooltip, color = 'primary' }) => (
    <Tooltip title={tooltip}>
      <IconButton 
        size="small" 
        onClick={onClick}
        sx={{
          bgcolor: alpha(theme.palette[color].main, 0.1),
          color: theme.palette[color].main,
          '&:hover': {
            bgcolor: alpha(theme.palette[color].main, 0.2),
            transform: 'scale(1.1)',
          },
          transition: 'all 0.2s ease'
        }}
      >
        <Icon fontSize="small" />
      </IconButton>
    </Tooltip>
  );

  return (
    <GlassCard>
      <TableContainer sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableCell 
                    key={header.id} 
                    onClick={header.column.getToggleSortingHandler()}
                    colSpan={header.colSpan}
                    sx={{ 
                      py: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.02),
                      borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      cursor: header.column.getCanSort() ? 'pointer' : 'default',
                      '&:hover': header.column.getCanSort() ? {
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                      } : {}
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </Typography>
                      {header.column.getCanSort() && (
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column',
                          opacity: header.column.getIsSorted() ? 1 : 0.3,
                          transition: 'opacity 0.2s ease'
                        }}>
                          {{ 
                            asc: <ArrowUpward fontSize="small" sx={{ color: theme.palette.primary.main }} />, 
                            desc: <ArrowDownward fontSize="small" sx={{ color: theme.palette.primary.main }} /> 
                          }[header.column.getIsSorted()] ?? 
                          <Stack spacing={-0.5}>
                            <ArrowUpward fontSize="small" />
                            <ArrowDownward fontSize="small" />
                          </Stack>
                          }
                        </Box>
                      )}
                    </Stack>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={table.getHeaderGroups()[0].headers.length} align="center" sx={{ py: 8 }}>
                  <Stack alignItems="center" spacing={2}>
                    <CircularProgress size={40} thickness={4} />
                    <Typography variant="body2" color="text.secondary">
                      Cargando datos...
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={table.getHeaderGroups()[0].headers.length} align="center" sx={{ py: 8 }}>
                  <Stack alignItems="center" spacing={2}>
                    <AssignmentIcon sx={{ fontSize: 48, color: theme.palette.text.disabled }} />
                    <Typography variant="h6" color="text.secondary">
                      No se encontraron registros
                    </Typography>
                    <Typography variant="body2" color="text.disabled">
                      Intenta ajustar los filtros de búsqueda
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <Fragment key={row.id}>
                    <TableRow 
                      sx={{ 
                        '& > td': { borderBottom: 'unset' },
                        '&:hover': { 
                          bgcolor: alpha(theme.palette.primary.main, 0.02),
                        },
                      }}
                    >
                    {row.getVisibleCells().map(cell => (
                      <TableCell 
                        key={cell.id}
                        sx={{ 
                          py: 2,
                        }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                    </TableRow>
                    {row.getIsExpanded() && (
                        <TableRow>
                            <TableCell colSpan={row.getVisibleCells().length} sx={{ p: 0 }}>
                                {row.original.tipoSolicitud.startsWith('Solicitud de Insolvencia') ?
                                    <InsolvenciaDetails solicitud={row.original} onUploadSuccess={onUploadSuccess} /> :
                                    <ConciliacionDetails solicitud={row.original} onUploadSuccess={onUploadSuccess} />
                                }
                            </TableCell>
                        </TableRow>
                    )}
                </Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Enhanced Pagination */}
      <Divider />
      <TablePagination
          component="div"
          count={solicitudesData?.totalRows ?? 0}
          page={table.getState().pagination.pageIndex}
          onPageChange={(e, newPage) => table.setPageIndex(newPage)}
          rowsPerPage={table.getState().pagination.pageSize}
          onRowsPerPageChange={(e) => table.setPageSize(parseInt(e.target.value, 10))}
          rowsPerPageOptions={[5, 10, 20, 50]}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
          sx={{
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
            '& .MuiTablePagination-actions': {
              '& button': {
                borderRadius: 2,
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                }
              }
            }
          }}
        />
    </GlassCard>
  );
};

function TabPanel(props) {
  const { children, value, index } = props;
  return (
    <div hidden={value !== index}>
      {value === index && (
        <Fade in={value === index} timeout={300}>
          <Box sx={{ pt: 3 }}>
            {children}
          </Box>
        </Fade>
      )}
    </div>
  );
}

// --- Main Component ---
const AdminPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [tabIndex, setTabIndex] = useState(1);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [localFilters, setLocalFilters] = useState({ tipoSolicitud: '', user: '' });
  const [refreshKey, setRefreshKey] = useState(0);
  const debouncedLocalFilters = useDebounce(localFilters, 500);
  const [expanded, setExpanded] = useState({});

  const [modalState, setModalState] = useState({
      open: false,
      type: null, // 'deudor', 'acreedores', 'convocantes', 'convocados'
      data: null
  });

  const queryClient = useQueryClient();


  const handleOpenModal = (type, data) => setModalState({ open: true, type, data });
  const handleCloseModal = () => setModalState({ open: false, type: null, data: null });

  const handleDownload = async (solicitudId, tipoSolicitud, format, anexo = null) => {
    const toastId = toast.loading(`Descargando documento ${format.toUpperCase()}, por favor espere...`);
    try {
      if (tipoSolicitud === 'Solicitud de Conciliación Unificada') {
        await downloadConciliacionDocument(solicitudId, format, anexo);
      } else {
        await downloadSolicitudDocument(solicitudId, format, anexo);
      }
      toast.update(toastId, { 
        render: "¡Descarga Completada!", 
        type: "success", 
        isLoading: false, 
        autoClose: 5000 
      });
    } catch (error) {
      toast.dismiss(toastId);
      handleAxiosError(error, `Error al descargar el documento ${format.toUpperCase()}.`);
    }
  };

  useEffect(() => {
    const filters = Object.entries(debouncedLocalFilters)
      .filter(([, value]) => value !== '')
      .map(([id, value]) => ({ id, value }));
    setColumnFilters(filters);
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, [debouncedLocalFilters]);

  const { data: stats, isLoading: isLoadingStats, isError: isErrorStats, refetch: refetchStats } = useQuery({ 
    queryKey: ['adminStats', refreshKey], 
    queryFn: getAdminStats,
    staleTime: 30000,
  });

  const queryKey = useMemo(() => 
    ['adminSolicitudes', pagination, columnFilters, sorting, refreshKey], 
    [pagination, columnFilters, sorting, refreshKey]
  );

  const { 
    data: solicitudesData, 
    isLoading: isLoadingSolicitudes, 
    isError: isErrorSolicitudes,
    refetch: refetchSolicitudes,
  } = useQuery({ 
    queryKey: queryKey, 
    queryFn: () => getAdminSolicitudes({ 
      pageIndex: pagination.pageIndex, 
      pageSize: pagination.pageSize, 
      filters: JSON.stringify(columnFilters), 
      sorting: JSON.stringify(sorting) 
    }),
    enabled: tabIndex === 1,
    keepPreviousData: true,
    staleTime: 10000,
  });

  const onUploadSuccess = () => {
    refetchSolicitudes();
  };


  const columns = useMemo(() => [
    {
        id: 'expander',
        header: () => null,
        cell: ({ row }) => (
            <IconButton size="small" onClick={() => row.toggleExpanded()}>
                {row.getIsExpanded() ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
        ),
    },
    { 
      accessorKey: 'createdAt', 
      header: 'Fecha', 
      cell: ({ getValue }) => new Date(getValue()).toLocaleDateString()
    },
    { 
      accessorKey: 'user.name', 
      header: 'Usuario', 
      cell: ({ getValue }) => (
        <Stack direction="row" alignItems="center" spacing={1}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
            {(getValue() || 'N')[0]}
          </Avatar>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {getValue() || 'N/A'}
          </Typography>
        </Stack>
      )
    },
    { 
      accessorKey: 'tipoSolicitud', 
      header: 'Tipo',
      cell: ({ getValue }) => {
        const isI = getValue().startsWith("Solicitud de Insolvencia");
        return <Chip label={isI ? "Insolvencia" : "Conciliación"} size="small" color={isI ? "error" : "primary"}/>
      }
    },
    {
        id: 'deudor',
        header: 'Deudor/a',
        cell: ({ row }) => {
            const { original } = row;
            if (original.tipoSolicitud.startsWith('Solicitud de Insolvencia')) {
                return <Button onClick={() => handleOpenModal('deudor', original.deudor)}>{original.deudor?.nombreCompleto}</Button>
            }
            return null;
        }
    },
    {
        id: 'acreedores',
        header: 'Acreedores',
        cell: ({ row }) => {
            const { original } = row;
            if (original.tipoSolicitud.startsWith('Solicitud de Insolvencia')) {
                return (
                    <IconButton onClick={() => handleOpenModal('acreedores', original.acreencias)}>
                        <GroupIcon />
                    </IconButton>
                );
            }
            return null;
        }
    },
    {
        id: 'convocantes',
        header: 'Convocantes',
        cell: ({ row }) => {
            const { original } = row;
            if (original.tipoSolicitud.startsWith('Solicitud de Conciliación')) {
                return (
                    <IconButton onClick={() => handleOpenModal('convocantes', original.convocantes)}>
                        <PeopleIcon />
                    </IconButton>
                );
            }
            return null;
        }
    },
    {
        id: 'convocados',
        header: 'Convocados',
        cell: ({ row }) => {
            const { original } = row;
            if (original.tipoSolicitud.startsWith('Solicitud de Conciliación')) {
                return (
                    <IconButton onClick={() => handleOpenModal('convocados', original.convocados)}>
                        <PeopleIcon />
                    </IconButton>
                );
            }
            return null;
        }
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        const { original } = row;
        return (
            <Stack direction="row" spacing={1}>
                {original.tipoSolicitud.startsWith('Solicitud de Insolvencia') && (
                    <Tooltip title="Editar Solicitud de Insolvencia">
                        <IconButton onClick={() => navigate(`/admin/editar-solicitud/${original._id}`)}><EditIcon /></IconButton>
                    </Tooltip>
                )}
                {original.tipoSolicitud.startsWith('Solicitud de Conciliación') && (
                    <Tooltip title="Editar Solicitud de Conciliación">
                        <IconButton onClick={() => navigate(`/admin/editar-conciliacion/${original._id}`)}><EditIcon /></IconButton>
                    </Tooltip>
                )}
                <Tooltip title="Descargar PDF">
                    <IconButton onClick={() => handleDownload(original._id, original.tipoSolicitud, 'pdf')}><PictureAsPdf /></IconButton>
                </Tooltip>
            </Stack>
        )
      }
    },
  ], [theme, navigate]);

  const table = useReactTable({
    data: solicitudesData?.rows ?? [],
    columns,
    pageCount: solicitudesData?.pageCount ?? -1,
    state: { pagination, sorting, columnFilters, expanded },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  });

  const handleTabChange = (event, newValue) => setTabIndex(newValue);
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters(prev => ({...prev, [name]: value}));
  };

  const handleRefresh = () => {
    if (tabIndex === 0) {
      refetchStats();
    }
    if (tabIndex === 1) {
      refetchSolicitudes();
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 20% 50%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 50%), radial-gradient(circle at 80% 20%, ${alpha(theme.palette.secondary.main, 0.05)} 0%, transparent 50%)`,
          pointerEvents: 'none',
          zIndex: 0,
        }
      }}
    >
      <Container maxWidth="xl" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
        <Stack spacing={4}>
          {/* Enhanced Header */}
          <Slide in={true} direction="down" timeout={600}>
            <GlassCard hover={false} sx={{ mb: 2 }}>
              <CardContent sx={{ p: 4 }}>
                <Grid container alignItems="center" justifyContent="space-between">
                  <Grid item>
                    <Stack direction="row" alignItems="center" spacing={3}>
                      <Avatar 
                        sx={{ 
                          width: 64, 
                          height: 64, 
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                          border: `3px solid ${alpha(theme.palette.primary.main, 0.2)}`
                        }}
                      >
                        <DashboardIcon sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Box>
                        <Typography 
                          variant="h4" 
                          component="h1" 
                          sx={{ 
                            fontWeight: 800,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            color: 'transparent',
                            mb: 0.5,
                            fontFamily: '"Inter", "Roboto", sans-serif'
                          }}
                        >
                          Panel de Control Administrativo
                        </Typography>
                        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
                          Gestión inteligente de solicitudes y análisis en tiempo real
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid item>
                    <Stack direction="row" spacing={2}>
                      <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={handleRefresh}
                        sx={{
                          borderRadius: 3,
                          textTransform: 'none',
                          fontWeight: 600,
                          borderColor: alpha(theme.palette.primary.main, 0.3),
                          '&:hover': {
                            borderColor: theme.palette.primary.main,
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                            transform: 'translateY(-2px)',
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Actualizar
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </GlassCard>
          </Slide>

          {/* Enhanced Tabs */}
          <GlassCard hover={false}>
            <Tabs 
              value={tabIndex} 
              onChange={handleTabChange} 
              variant="fullWidth"
              sx={{ 
                px: 2,
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  minHeight: 64,
                  borderRadius: 3,
                  margin: '8px 4px',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    transform: 'translateY(-2px)',
                  },
                  '&.Mui-selected': {
                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                    color: theme.palette.primary.main,
                  }
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: 3,
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                }
              }}
            >
              <Tab 
                icon={<DashboardIcon />} 
                iconPosition="start" 
                label="Dashboard" 
              />
              <Tab 
                icon={
                  <Badge 
                    badgeContent={solicitudesData?.totalRows || 0} 
                    color="secondary"
                    max={999}
                  >
                    <HistoryIcon />
                  </Badge>
                } 
                iconPosition="start" 
                label="Historial Detallado" 
              />
            </Tabs>
          </GlassCard>

          {/* Tab Content */}
          <TabPanel value={tabIndex} index={0}>
            {isLoadingStats && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <Stack alignItems="center" spacing={2}>
                  <CircularProgress size={60} thickness={4} />
                  <Typography variant="h6" color="text.secondary">
                    Cargando estadísticas...
                  </Typography>
                </Stack>
              </Box>
            )}
            {isErrorStats && (
              <Alert 
                severity="error" 
                sx={{ 
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`
                }}
              >
                Error al cargar las estadísticas. Intenta actualizar la página.
              </Alert>
            )}
            {stats && <EnhancedDashboard stats={stats} />}
          </TabPanel>

          <TabPanel value={tabIndex} index={1}>
            <Stack spacing={3}>
              {/* Enhanced Filters */}
              <GlassCard>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main }}>
                        <FilterList />
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Filtros Avanzados
                      </Typography>
                    </Stack>
                    <Chip 
                      label={`${solicitudesData?.totalRows || 0} registros`}
                      color="primary"
                      variant="outlined"
                    />
                  </Stack>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField 
                        name="user" 
                        label="Buscar por Usuario" 
                        value={localFilters.user} 
                        onChange={handleFilterChange} 
                        variant="outlined" 
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Search color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: alpha(theme.palette.primary.main, 0.5),
                              }
                            },
                            '&.Mui-focused': {
                              transform: 'translateY(-2px)',
                              boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
                            }
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField 
                        name="tipoSolicitud" 
                        label="Buscar por Tipo de Solicitud" 
                        value={localFilters.tipoSolicitud} 
                        onChange={handleFilterChange} 
                        variant="outlined" 
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <CategoryIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: alpha(theme.palette.primary.main, 0.5),
                              }
                            },
                            '&.Mui-focused': {
                              transform: 'translateY(-2px)',
                              boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
                            }
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </GlassCard>

              {/* Enhanced Table */}
              <EnhancedTable 
                table={table} 
                isLoading={isLoadingSolicitudes} 
                solicitudesData={solicitudesData}
                navigate={navigate}
                onDownload={handleDownload}
                onOpenModal={handleOpenModal}
                onUploadSuccess={onUploadSuccess}
              />

              {isErrorSolicitudes && (
                <Alert 
                  severity="error"
                  sx={{ 
                    borderRadius: 3,
                    bgcolor: alpha(theme.palette.error.main, 0.1),
                    border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`
                  }}
                >
                  Error al cargar las solicitudes. Verifica tu conexión e intenta nuevamente.
                </Alert>
              )}
            </Stack>
          </TabPanel>
        </Stack>
        <DeudorModal open={modalState.type === 'deudor'} onClose={handleCloseModal} deudor={modalState.type === 'deudor' ? modalState.data : null} />
        <AcreedoresModal open={modalState.type === 'acreedores'} onClose={handleCloseModal} acreedores={modalState.type === 'acreedores' ? modalState.data : []} />
        <InvolucradosModal open={modalState.type === 'convocantes'} onClose={handleCloseModal} involucrados={modalState.type === 'convocantes' ? modalState.data : []} title="Convocantes" />
        <InvolucradosModal open={modalState.type === 'convocados'} onClose={handleCloseModal} involucrados={modalState.type === 'convocados' ? modalState.data : []} title="Convocados" />
      </Container>
    </Box>
  );
};

export default AdminPage;
