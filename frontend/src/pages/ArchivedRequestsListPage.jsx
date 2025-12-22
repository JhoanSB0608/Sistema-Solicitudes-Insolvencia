import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getArchiverEntries } from '../services/archiverService';
import { downloadFile } from '../services/fileStorageService';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button,
  Typography, Box, TextField, Stack, CircularProgress, Alert, IconButton, TablePagination,
  Card, CardContent, Avatar, Container, Tooltip, Chip, Fade, Grow, Slide, Grid,
  InputAdornment, useTheme, alpha
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';
import {
  Archive as ArchiveIcon, Refresh, Add, Search, FilterList, Description as DescriptionIcon,
  ArrowUpward, ArrowDownward, CloudDownload as CloudDownloadIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { handleAxiosError } from '../utils/alert';

import GlassCard from '../components/common/GlassCard';

const ArchivedRequestsListPage = () => {
  const theme = useTheme();

  // State management for table
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [localFilters, setLocalFilters] = useState({ tipoSolicitud: '', entityName: '' });
  const debouncedLocalFilters = useDebounce(localFilters, 500);

  // Data fetching
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['archivedEntries'],
    queryFn: getArchiverEntries,
    staleTime: 60 * 1000, // 1 minute
  });

  // Filter and sort client-side for simplicity, as backend getArchiverEntries doesn't support complex params yet
  const filteredAndSortedData = useMemo(() => {
    if (!data) return [];

    let processedData = [...data];

    // Apply text filters
    if (debouncedLocalFilters.tipoSolicitud) {
      processedData = processedData.filter(entry =>
        entry.tipoSolicitud.toLowerCase().includes(debouncedLocalFilters.tipoSolicitud.toLowerCase())
      );
    }
    if (debouncedLocalFilters.entityName) {
      processedData = processedData.filter(entry => {
        const name = entry.tipoSolicitud === 'Solicitud de Insolvencia Económica'
          ? entry.insolvenciaData?.deudor?.nombreCompleto
          : entry.conciliacionData?.convocante?.nombreCompleto;
        return name?.toLowerCase().includes(debouncedLocalFilters.entityName.toLowerCase());
      });
    }

    // Apply sorting
    if (sorting.length > 0) {
      const { id, desc } = sorting[0];
      processedData.sort((a, b) => {
        let valA, valB;
        if (id === 'tipoSolicitud') {
          valA = a.tipoSolicitud;
          valB = b.tipoSolicitud;
        } else if (id === 'entityName') {
          valA = a.tipoSolicitud === 'Solicitud de Insolvencia Económica'
            ? a.insolvenciaData?.deudor?.nombreCompleto
            : a.conciliacionData?.convocante?.nombreCompleto;
          valB = b.tipoSolicitud === 'Solicitud de Insolvencia Económica'
            ? b.insolvenciaData?.deudor?.nombreCompleto
            : b.conciliacionData?.convocante?.nombreCompleto;
        } else if (id === 'anexosCount') {
          valA = (a.insolvenciaData?.anexos?.length || a.conciliacionData?.anexos?.length) || 0;
          valB = (b.insolvenciaData?.anexos?.length || b.conciliacionData?.anexos?.length) || 0;
        } else if (id === 'createdAt') {
          valA = new Date(a.createdAt);
          valB = new Date(b.createdAt);
        } else {
            valA = a[id];
            valB = b[id];
        }

        if (valA === valB) return 0;
        if (valA === undefined || valA === null) return desc ? -1 : 1;
        if (valB === undefined || valB === null) return desc ? 1 : -1;

        if (typeof valA === 'string') {
          return desc ? valB.localeCompare(valA) : valA.localeCompare(valB);
        }
        return desc ? (valB - valA) : (valA - valB);
      });
    }

    return processedData;
  }, [data, debouncedLocalFilters, sorting]);

  // Table configuration
  const columns = useMemo(() => [
    { 
      accessorKey: 'tipoSolicitud', 
      header: 'Tipo de Solicitud',
      cell: ({ getValue }) => {
        const isI = getValue().startsWith("Solicitud de Insolvencia");
        return <Chip label={isI ? "Insolvencia" : "Conciliación"} size="small" color={isI ? "error" : "primary"}/>;
      }
    },
    { 
      accessorKey: 'entityName', 
      header: 'Deudor / Convocante',
      cell: ({ row }) => {
        const entry = row.original;
        const name = entry.tipoSolicitud === 'Solicitud de Insolvencia Económica'
          ? entry.insolvenciaData?.deudor?.nombreCompleto
          : entry.conciliacionData?.convocante?.nombreCompleto;
        return (
          <Stack direction="row" alignItems="center" spacing={1}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
              {(name || 'N')[0]}
            </Avatar>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {name || 'N/A'}
            </Typography>
          </Stack>
        );
      }
    },
    {
      accessorKey: 'createdAt',
      header: 'Fecha de Creación',
      cell: ({ getValue }) => new Date(getValue()).toLocaleDateString()
    },
    {
      accessorKey: 'anexosCount',
      header: 'Anexos',
      cell: ({ row }) => {
        const entry = row.original;
        const count = entry.tipoSolicitud === 'Solicitud de Insolvencia Económica'
          ? entry.insolvenciaData?.anexos?.length
          : entry.conciliacionData?.anexos?.length;
        return (
          <Chip
            label={`${count || 0}`}
            size="small"
            icon={<DescriptionIcon />}
            sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main, fontWeight: 600 }}
          />
        );
      }
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        const entry = row.original;
        const annexes = entry.tipoSolicitud === 'Solicitud de Insolvencia Económica'
          ? entry.insolvenciaData?.anexos
          : entry.conciliacionData?.anexos;

        const handleDownloadAnexo = async (anexo) => {
          const toastId = toast.loading(`Descargando ${anexo.name}, por favor espere...`);
          try {
            await downloadFile(anexo.name);
            toast.update(toastId, {
              render: "¡Descarga Completada!",
              type: "success",
              isLoading: false,
              autoClose: 5000
            });
          } catch (err) {
            toast.dismiss(toastId);
            handleAxiosError(err, 'Error al descargar el anexo.');
          }
        };

        return (
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            {annexes && annexes.length > 0 && (
              annexes.map((anexo, idx) => (
                <Tooltip key={idx} title={`Descargar ${anexo.name}`}>
                  <IconButton onClick={() => handleDownloadAnexo(anexo)}>
                    <CloudDownloadIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              ))
            )}
            {/* Add more actions if needed, e.g., view entry details */}
          </Stack>
        );
      }
    }
  ], [theme]);

  const table = useReactTable({
    data: filteredAndSortedData,
    columns,
    pageCount: Math.ceil(filteredAndSortedData.length / pagination.pageSize),
    state: {
      pagination,
      sorting,
      columnFilters,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualFiltering: false, // Client-side filtering
    manualSorting: false,   // Client-side sorting
    manualPagination: false, // Client-side pagination
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setLocalFilters({ tipoSolicitud: '', entityName: '' });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.02)} 0%, ${alpha(theme.palette.info.main, 0.02)} 100%)`,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 20% 50%, ${alpha(theme.palette.success.main, 0.05)} 0%, transparent 50%), radial-gradient(circle at 80% 20%, ${alpha(theme.palette.info.main, 0.05)} 0%, transparent 50%)`,
          pointerEvents: 'none',
          zIndex: 0,
        }
      }}
    >
      <Container maxWidth="xl" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
        <Stack spacing={4}>
          {/* Header */}
          <Slide in={true} direction="down" timeout={600}>
            <GlassCard hover={false}>
              <CardContent sx={{ p: 4 }}>
                <Grid container alignItems="center" justifyContent="space-between">
                  <Grid item xs={12} md={8}>
                    <Stack direction="row" alignItems="center" spacing={3}>
                      <Avatar
                        sx={{
                          width: 64,
                          height: 64,
                          bgcolor: alpha(theme.palette.success.main, 0.1),
                          color: theme.palette.success.main,
                          border: `3px solid ${alpha(theme.palette.success.main, 0.2)}`
                        }}
                      >
                        <ArchiveIcon sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Box>
                        <Typography
                          variant="h4"
                          component="h1"
                          sx={{
                            fontWeight: 800,
                            background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.info.main} 100%)`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            mb: 0.5,
                            fontFamily: '"Inter", "Roboto", sans-serif'
                          }}
                        >
                          Solicitudes Archivadas
                        </Typography>
                        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
                          Visualiza y gestiona todas tus solicitudes archivadas
                        </Typography>
                        <Chip
                          label={`${data?.length || 0} registros`}
                          size="small"
                          sx={{
                            mt: 1,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            fontWeight: 600
                          }}
                        />
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Stack direction="row" spacing={2} justifyContent={{ xs: 'flex-start', md: 'flex-end' }} sx={{ mt: { xs: 2, md: 0 } }}>
                      <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={() => refetch()}
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
                      <Button
                        variant="contained"
                        component={Link}
                        to="/archiver-create" // Link to the form for creating new archived requests
                        startIcon={<Add />}
                        sx={{
                          borderRadius: 3,
                          textTransform: 'none',
                          fontWeight: 600,
                          background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.info.main} 100%)`,
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: theme.shadows[8],
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Nueva Solicitud Archivada
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </GlassCard>
          </Slide>

          {/* Filters */}
          <Fade in={true} timeout={800}>
            <GlassCard>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                      <FilterList />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Filtros de Búsqueda
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Encuentra solicitudes archivadas específicas
                      </Typography>
                    </Box>
                  </Stack>
                  <Button
                    variant="text"
                    onClick={clearFilters}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600
                    }}
                  >
                    Limpiar Filtros
                  </Button>
                </Stack>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="tipoSolicitud"
                      label="Filtrar por Tipo de Solicitud"
                      value={localFilters.tipoSolicitud}
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
                      name="entityName"
                      label="Filtrar por Nombre de Deudor/Convocante"
                      value={localFilters.entityName}
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
                </Grid>
              </CardContent>
            </GlassCard>
          </Fade>

          {/* Error Alert */}
          {isError && (
            <Fade in={isError} timeout={300}>
              <Alert
                severity="error"
                sx={{
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                  '& .MuiAlert-icon': {
                    fontSize: '1.5rem'
                  }
                }}
                action={
                  <Button
                    color="error"
                    size="small"
                    onClick={() => refetch()}
                    startIcon={<Refresh />}
                    sx={{ textTransform: 'none' }}
                  >
                    Reintentar
                  </Button>
                }
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Error al cargar los datos
                </Typography>
                <Typography variant="body2">
                  No se pudieron cargar las solicitudes archivadas. Verifica tu conexión e intenta nuevamente.
                  {error?.message && ` (${error.message})`}
                </Typography>
              </Alert>
            </Fade>
          )}

          {/* Table */}
          <Grow in={true} timeout={1000}>
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
                        <TableCell colSpan={columns.length} align="center" sx={{ py: 8 }}>
                          <Stack alignItems="center" spacing={2}>
                            <CircularProgress size={40} thickness={4} />
                            <Typography variant="body2" color="text.secondary">
                              Cargando solicitudes archivadas...
                            </Typography>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ) : filteredAndSortedData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={columns.length} align="center" sx={{ py: 8 }}>
                          <Stack alignItems="center" spacing={2}>
                            <ArchiveIcon sx={{ fontSize: 48, color: theme.palette.text.disabled }} />
                            <Typography variant="h6" color="text.secondary">
                              No se encontraron solicitudes archivadas
                            </Typography>
                            <Typography variant="body2" color="text.disabled">
                              Intenta ajustar los filtros de búsqueda o crea una nueva.
                            </Typography>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ) : (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          sx={{
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.02),
                            },
                            '&:last-child td': { border: 0 },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {row.getVisibleCells().map(cell => (
                            <TableCell
                              key={cell.id}
                              sx={{
                                py: 2,
                                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`
                              }}
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              <TablePagination
                rowsPerPageOptions={[5, 10, 20]}
                component="div"
                count={filteredAndSortedData.length}
                rowsPerPage={pagination.pageSize}
                page={pagination.pageIndex}
                onPageChange={(event, newPage) => table.setPageIndex(newPage)}
                onRowsPerPageChange={(event) => table.setPageSize(Number(event.target.value))}
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
          </Grow>
        </Stack>
      </Container>
    </Box>
  );
};

export default ArchivedRequestsListPage;
