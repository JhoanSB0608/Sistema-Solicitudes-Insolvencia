import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { 
  TextField, Button, Typography, Box, Paper, Grid, FormControl, InputLabel, Select, MenuItem,
  FormHelperText, useTheme, alpha, Stack, Avatar, Chip, IconButton, CircularProgress, Alert,
  Collapse, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import {
  Person as PersonIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Add as AddIcon,
  UploadFile as UploadFileIcon,
  Download as DownloadIcon,
  Gavel as GavelIcon
} from '@mui/icons-material';
import LocationSelector from './LocationSelector';
import { uploadFile, downloadFile } from '../../services/fileStorageService';
import { showSuccess, handleAxiosError } from '../../utils/alert';
import { toast } from 'react-toastify';

// Reusable Glassmorphism Components (copied from InsolvenciaForm for self-containment)
const GlassCard = ({ children, sx = {}, hover = true, ...props }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Paper
      elevation={0}
      onMouseEnter={() => hover && setIsHovered(true)}
      onMouseLeave={() => hover && setIsHovered(false)}
      sx={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
        },
        ...(hover && {
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
          }
        }),
        ...sx
      }}
      {...props}
    >
      {children}
    </Paper>
  );
};

const GlassTextField = React.forwardRef(({ error, ...props }, ref) => {
  const theme = useTheme();
  
  return (
    <TextField
      {...props}
      inputRef={ref}
      error={error}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '& fieldset': {
            border: '1px solid rgba(255, 255, 255, 0.2)',
          },
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.12)',
            transform: 'translateY(-1px)',
            '& fieldset': {
              border: '1px solid rgba(255, 255, 255, 0.3)',
            },
          },
          '&.Mui-focused': {
            background: 'rgba(255, 255, 255, 0.15)',
            '& fieldset': {
              border: `2px solid ${error ? theme.palette.error.main : alpha(theme.palette.primary.main, 0.5)} !important`,
            },
          },
          '&.Mui-error': {
            '& fieldset': {
              border: `1px solid ${alpha(theme.palette.error.main, 0.5)}`,
            },
          },
        },
        '& .MuiInputLabel-root': {
          color: 'rgba(0, 0, 0, 0.6)',
          '&.Mui-focused': {
            color: error ? theme.palette.error.main : theme.palette.primary.main,
          },
        },
        ...props.sx
      }}
    />
  );
});

const GlassSelect = ({ control, name, label, options, rules, error, ...props }) => {
  const theme = useTheme();
  const selectSx = {
    minWidth: 250,
    width: '100%',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '& .MuiOutlinedInput-notchedOutline': {
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      border: '1px solid rgba(255, 255, 255, 0.3)',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      border: `2px solid ${error ? theme.palette.error.main : alpha(theme.palette.primary.main, 0.5)} !important`,
    },
    '&:hover': {
        background: 'rgba(255, 255, 255, 0.12)',
    },
    '&.Mui-focused': {
        background: 'rgba(255, 255, 255, 0.15)',
    },
  };
  return (
      <FormControl fullWidth error={!!error}>
          <InputLabel>{label}</InputLabel>
          <Controller
              name={name}
              control={control}
              rules={rules}
              defaultValue=""
              render={({ field }) => (
                  <Select
                      {...field}
                      label={label}
                      sx={selectSx}
                      {...props}
                  >
                      {options.map(option => (
                          <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                      ))}
                  </Select>
              )}
          />
          {error && <FormHelperText>{error.message}</FormHelperText>}
      </FormControl>
  );
};


// Reusable Description Modal component
const DescriptionModal = ({ open, onClose, onConfirm, defaultValue = '' }) => {
  const theme = useTheme();
  const [description, setDescription] = useState(defaultValue);

  const handleConfirm = () => {
    onConfirm(description);
    setDescription(''); // Reset description after confirming
  };

  const handleClose = () => {
    onClose();
    setDescription(''); // Reset description on close
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth 
      PaperProps={{
        sx: {
          background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.85)} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
          backdropFilter: 'blur(40px) saturate(180%)',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
          borderRadius: 4,
          boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.37)}`,
          overflow: 'hidden',
        }
      }}
      BackdropProps={{
        sx: {
          backdropFilter: 'blur(8px)',
          backgroundColor: alpha(theme.palette.common.black, 0.5),
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
          py: 3,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Añadir Descripción al Anexo
          </Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ py: 3 }}>
        <TextField
          autoFocus
          margin="dense"
          label="Descripción"
          type="text"
          fullWidth
          variant="outlined"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleConfirm();
            }
          }}
        />
      </DialogContent>
      <DialogActions sx={{ p: 3, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
        <Button onClick={handleClose} color="inherit">
          Cancelar
        </Button>
        <Button onClick={handleConfirm} variant="contained" color="primary">
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ArchiverAnexosSection (reused from AdminPage.jsx)
const ArchiverAnexosSection = ({ anexos, archiverEntryId, onUploadSuccess }) => {
  const theme = useTheme();
  const fileInputRef = React.useRef(null);
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [currentFileToUpload, setCurrentFileToUpload] = useState(null);
  const [uploadingAnexo, setUploadingAnexo] = useState(false);

  const handleFileSelect = (event) => {
      const file = event.target.files[0];
      if (file) {
          setCurrentFileToUpload(file);
          setIsDescriptionModalOpen(true);
      }
      // Reset the input value so the same file can be selected again
      event.target.value = null;
  };

  const handleDescriptionConfirm = async (description) => {
    setIsDescriptionModalOpen(false);
    if (!currentFileToUpload || !archiverEntryId) return;

    setUploadingAnexo(true);
    try {
        console.log('ArchiverAnexosSection: Starting file upload to GCS for:', currentFileToUpload.name, 'with description:', description);
        const { fileUrl, uniqueFilename } = await uploadFile(currentFileToUpload);
        console.log('ArchiverAnexosSection: GCS upload successful. fileUrl:', fileUrl, 'uniqueFilename:', uniqueFilename);

        const payload = {
            name: uniqueFilename,
            url: fileUrl,
            descripcion: description,
            size: currentFileToUpload.size, // Pass file size
        };

        const { uploadArchiverAnexo } = require('../../services/archiverService'); // Dynamic import
        await uploadArchiverAnexo(archiverEntryId, payload);

        showSuccess("Archivo subido con éxito");
        onUploadSuccess(); // Refresh list/entry after upload
    } catch (error) {
        handleAxiosError(error, "Error al subir archivo a Google Cloud Storage.");
    } finally {
        setUploadingAnexo(false);
        setCurrentFileToUpload(null);
    }
  };

  const handleDownload = async (anexo) => {
    if (!anexo.name) {
        toast.error("Nombre del archivo no encontrado.");
        return;
    }
    const toastId = toast.loading(`Descargando ${anexo.name}, por favor espere...`);
    try {
      await downloadFile(anexo.name);
      toast.update(toastId, { 
        render: "¡Descarga Completada!", 
        type: "success", 
        isLoading: false, 
        autoClose: 5000 
      });
    } catch (error) {
      toast.dismiss(toastId);
      handleAxiosError(error, `Error al descargar el archivo: ${error.message}`);
    }
  };

  return (
    <Box>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      <Button
        startIcon={uploadingAnexo ? <CircularProgress size={20} /> : <UploadFileIcon />}
        variant="contained"
        onClick={() => fileInputRef.current.click()}
        disabled={uploadingAnexo || !archiverEntryId}
        sx={{ 
          mb: 3,
          borderRadius: 3,
          textTransform: 'none',
          fontWeight: 600,
          py: 1.5,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
          },
          transition: 'all 0.3s ease',
        }}
      >
        {uploadingAnexo ? 'Subiendo...' : 'Subir Documento'}
      </Button>
      <Typography variant="caption" display="block" sx={{ mb: 2, color: theme.palette.text.secondary }}>
        {archiverEntryId ? '' : 'Guarde el formulario para poder subir anexos.'}
      </Typography>
      
      <Stack spacing={1}>
        {anexos?.map((anexo, index) => (
          <GlassCard
            key={index}
            hover={false}
            sx={{
              p: 1.5,
              background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.4)} 0%, ${alpha(theme.palette.background.paper, 0.1)} 100%)`,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main, width: 36, height: 36 }}>
                  <DescriptionIcon sx={{ fontSize: 20 }} />
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{anexo.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{anexo.descripcion} - {anexo.size ? `${(anexo.size / 1024).toFixed(2)} KB` : 'N/A KB'}</Typography>
                </Box>
              </Stack>
              <IconButton 
                edge="end" 
                onClick={() => handleDownload(anexo)}
                sx={{
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  color: theme.palette.success.main,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.success.main, 0.2),
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <DownloadIcon />
              </IconButton>
            </Stack>
          </GlassCard>
        ))}
      </Stack>
      <DescriptionModal
        open={isDescriptionModalOpen}
        onClose={() => setIsDescriptionModalOpen(false)}
        onConfirm={handleDescriptionConfirm}
        defaultValue={currentFileToUpload?.name || ''}
      />
    </Box>
  );
};


const ArchiverInsolvenciaForm = ({ onSubmit, archiverEntryId, initialData, onUploadSuccess }) => {
  const theme = useTheme();
  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      deudor: {
        nombreCompleto: '',
        tipoIdentificacion: '',
        numeroIdentificacion: '',
        telefono: '',
        email: '',
        pais: '',
        departamento: '',
        ciudad: '',
        domicilio: '',
      },
      anexos: [],
    }
  });

  const watchedDeudorName = watch('deudor.nombreCompleto');

  React.useEffect(() => {
    if (initialData) {
      setValue('deudor.nombreCompleto', initialData.deudor.nombreCompleto);
      setValue('deudor.tipoIdentificacion', initialData.deudor.tipoIdentificacion);
      setValue('deudor.numeroIdentificacion', initialData.deudor.numeroIdentificacion);
      setValue('deudor.telefono', initialData.deudor.telefono);
      setValue('deudor.email', initialData.deudor.email);
      setValue('deudor.pais', initialData.deudor.pais);
      setValue('deudor.departamento', initialData.deudor.departamento);
      setValue('deudor.ciudad', initialData.deudor.ciudad);
      setValue('deudor.domicilio', initialData.deudor.domicilio);
      setValue('anexos', initialData.anexos);
    }
  }, [initialData, setValue]);

  const onSubmitForm = (data) => {
    onSubmit({
      tipoSolicitud: 'Solicitud de Insolvencia Económica',
      insolvenciaData: {
        deudor: data.deudor,
        anexos: data.anexos,
      },
    });
  };

  return (
    <GlassCard sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.main }}>
            <GavelIcon />
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Datos del Deudor (Insolvencia)
          </Typography>
        </Stack>
        <Grid container spacing={2}>
          <Grid item xs={12}><GlassTextField {...register('deudor.nombreCompleto', { required: 'Nombre completo del deudor es requerido' })} label="Nombre Completo del Deudor" fullWidth error={!!errors.deudor?.nombreCompleto} helperText={errors.deudor?.nombreCompleto?.message} /></Grid>
          <Grid item xs={12} sm={6}>
            <GlassSelect
              control={control}
              name="deudor.tipoIdentificacion"
              label="Tipo de Identificación"
              options={[
                { value: 'CÉDULA DE CIUDADANÍA', label: 'CÉDULA DE CIUDADANÍA' },
                { value: 'CÉDULA DE EXTRANJERÍA', label: 'CÉDULA DE EXTRANJERÍA' },
                { value: 'NIT', label: 'NIT' },
                { value: 'PASAPORTE', label: 'PASAPORTE' }
              ]}
              rules={{ required: 'Campo requerido' }}
              error={errors.deudor?.tipoIdentificacion}
            />
          </Grid>
          <Grid item xs={12} sm={6}><GlassTextField {...register('deudor.numeroIdentificacion', { required: 'Número de identificación es requerido' })} label="Número de Identificación" fullWidth error={!!errors.deudor?.numeroIdentificacion} helperText={errors.deudor?.numeroIdentificacion?.message} /></Grid>
          <Grid item xs={12} sm={6}><GlassTextField {...register('deudor.telefono', { required: 'Teléfono es requerido' })} label="Teléfono" fullWidth error={!!errors.deudor?.telefono} helperText={errors.deudor?.telefono?.message} /></Grid>
          <Grid item xs={12} sm={6}><GlassTextField {...register('deudor.email', { required: 'Email es requerido', pattern: { value: /^\S+@\S+$/i, message: "Email inválido" } })} label="Email" type="email" fullWidth error={!!errors.deudor?.email} helperText={errors.deudor?.email?.message} /></Grid>
          <LocationSelector
            control={control}
            errors={errors}
            watch={watch}
            setValue={setValue}
            showCountry={true}
            countryFieldName="deudor.pais"
            countryLabel="País"
            countryGridProps={{ xs: 12, sm: 4 }}
            countryRules={{ required: 'Campo requerido' }}
            showDepartment={true}
            departmentFieldName="deudor.departamento"
            departmentLabel="Departamento"
            departmentGridProps={{ xs: 12, sm: 4 }}
            departmentRules={{ required: 'Campo requerido' }}
            showCity={true}
            cityFieldName="deudor.ciudad"
            cityLabel="Ciudad"
            cityGridProps={{ xs: 12, sm: 4 }}
            cityRules={{ required: 'Campo requerido' }}
          />
          <Grid item xs={12}><GlassTextField {...register('deudor.domicilio', { required: 'Dirección es requerida' })} label="Dirección" fullWidth error={!!errors.deudor?.domicilio} helperText={errors.deudor?.domicilio?.message} /></Grid>
        </Grid>

        <Button
          variant="contained"
          onClick={handleSubmit(onSubmitForm)}
          startIcon={<SaveIcon />}
          sx={{ mt: 2 }}
        >
          Guardar Solicitud
        </Button>

        <Typography variant="h6" sx={{ fontWeight: 700, mt: 4 }}>Anexos/Documentos</Typography>
        <ArchiverAnexosSection anexos={initialData?.anexos || []} archiverEntryId={archiverEntryId} onUploadSuccess={onUploadSuccess} />
      </Stack>
    </GlassCard>
  );
};

export default ArchiverInsolvenciaForm;
