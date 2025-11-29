import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { 
  TextField, Button, Typography, Box, Paper, Grid, Tabs, Tab, Checkbox, 
  FormControlLabel, FormControl, InputLabel, Select, MenuItem, FormHelperText,
  alpha, useTheme, Stack, Avatar, IconButton, Chip, LinearProgress, Collapse,
  Alert, Badge, RadioGroup, Radio, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import {
  LocationCity as LocationCityIcon,
  Info as InfoIcon,
  Person as PersonIcon,
  Gavel as GavelIcon,
  Description as DescriptionIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  AttachFile as AttachFileIcon,
  UploadFile as UploadFileIcon,
  Business as BusinessIcon,
  Save as SaveIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Close as CloseIcon,
  TrendingUp as TrendingUpIcon,
  Create as CreateIcon
} from '@mui/icons-material';
import SignatureCanvas from 'react-signature-canvas';
import LocationSelector from './LocationSelector';

// --- Reusable Glassmorphism Components ---
const GlassCard = ({ children, sx = {}, hover = true, ...props }) => (
  <Paper
    elevation={0}
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

const GlassTextField = React.forwardRef(({ error, helperText, ...props }, ref) => {
  const theme = useTheme();
  return (
    <TextField
      {...props}
      inputRef={ref}
      error={!!error}
      helperText={helperText}
      variant="outlined"
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(10px)',
          '& fieldset': { border: '1px solid rgba(255, 255, 255, 0.2)' },
          '&:hover fieldset': { border: '1px solid rgba(255, 255, 255, 0.3)' },
          '&.Mui-focused fieldset': { border: `2px solid ${error ? theme.palette.error.main : alpha(theme.palette.primary.main, 0.5)} !important` },
        },
        '& .MuiInputLabel-root': {
          color: 'rgba(0, 0, 0, 0.6)',
          '&.Mui-focused': { color: error ? theme.palette.error.main : theme.palette.primary.main },
        },
        ...props.sx
      }}
    />
  );
});

const GlassSelect = ({ control, name, label, options, rules, error, ...props }) => {
    const theme = useTheme();
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
                        sx={{
                            minWidth: 300,
                            borderRadius: '12px',
                            background: 'rgba(255, 255, 255, 0.08)',
                            backdropFilter: 'blur(10px)',
                            '.MuiOutlinedInput-notchedOutline': { border: '1px solid rgba(255, 255, 255, 0.2)' },
                            '&:hover .MuiOutlinedInput-notchedOutline': { border: '1px solid rgba(255, 255, 255, 0.3)' },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: `2px solid ${error ? theme.palette.error.main : alpha(theme.palette.primary.main, 0.5)} !important` },
                        }}
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

// --- Internal Component for Party Fields ---
const PartyMemberFields = ({ partyType, index, control, errors, register, watch, setValue }) => {
    const tipoInvolucrado = watch(`${partyType}.${index}.tipoInvolucrado`);

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
                <GlassSelect
                    control={control}
                    name={`${partyType}.${index}.tipoInvolucrado`}
                    label="Tipo de Involucrado"
                    options={[{ value: 'Persona Natural', label: 'Persona Natural' }, { value: 'Persona Jurídica', label: 'Persona Jurídica' }]}
                    rules={{ required: 'Campo requerido' }}
                    error={errors[partyType]?.[index]?.tipoInvolucrado}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <GlassSelect
                    control={control}
                    name={`${partyType}.${index}.tipoIdentificacion`}
                    label="Tipo de Identificación"
                    options={[
                        { value: 'CÉDULA DE CIUDADANÍA', label: 'CÉDULA DE CIUDADANÍA' },
                        { value: 'CÉDULA DE EXTRANJERÍA', label: 'CÉDULA DE EXTRANJERÍA' },
                        { value: 'TARJETA DE IDENTIDAD', label: 'TARJETA DE IDENTIDAD' },
                        { value: 'REGISTRO CIVIL', label: 'REGISTRO CIVIL' },
                        { value: 'PASAPORTE', label: 'PASAPORTE' },
                        { value: 'NÚMERO DE IDENTIFICACIÓN DE EXTRANJERO', label: 'NÚMERO DE IDENTIFICACIÓN DE EXTRANJERO' }
                    ]}
                    rules={{ required: 'Campo requerido' }}
                    error={errors[partyType]?.[index]?.tipoIdentificacion}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <GlassTextField {...register(`${partyType}.${index}.numeroIdentificacion`, { required: 'Campo requerido' })} label="Número de Identificación" fullWidth error={errors[partyType]?.[index]?.numeroIdentificacion} helperText={errors[partyType]?.[index]?.numeroIdentificacion?.message} />
            </Grid>

            {tipoInvolucrado === 'Persona Jurídica' && (
                <Grid item xs={12} sm={6}>
                    <GlassTextField {...register(`${partyType}.${index}.razonSocial`, { required: 'Campo requerido' })} label="Razón Social" fullWidth error={errors[partyType]?.[index]?.razonSocial} helperText={errors[partyType]?.[index]?.razonSocial?.message} />
                </Grid>
            )}

            {tipoInvolucrado === 'Persona Natural' && (
                <>
                    <Grid item xs={12} sm={6} md={3}><GlassTextField {...register(`${partyType}.${index}.primerNombre`, { required: 'Campo requerido' })} label="Primer Nombre" fullWidth error={errors[partyType]?.[index]?.primerNombre} helperText={errors[partyType]?.[index]?.primerNombre?.message} /></Grid>
                    <Grid item xs={12} sm={6} md={3}><GlassTextField {...register(`${partyType}.${index}.segundoNombre`)} label="Segundo Nombre" fullWidth /></Grid>
                    <Grid item xs={12} sm={6} md={3}><GlassTextField {...register(`${partyType}.${index}.primerApellido`, { required: 'Campo requerido' })} label="Primer Apellido" fullWidth error={errors[partyType]?.[index]?.primerApellido} helperText={errors[partyType]?.[index]?.primerApellido?.message} /></Grid>
                    <Grid item xs={12} sm={6} md={3}><GlassTextField {...register(`${partyType}.${index}.segundoApellido`)} label="Segundo Apellido" fullWidth /></Grid>
                </>
            )}
            
            <LocationSelector control={control} errors={errors} watch={watch} setValue={setValue} showDepartment={true} showCity={true} departmentFieldName={`${partyType}.${index}.departamentoExpedicion`} cityFieldName={`${partyType}.${index}.ciudadExpedicion`} departmentLabel="Departamento de Expedición" cityLabel="Ciudad de Expedición" departmentGridProps={{ xs: 12, sm: 6 }} cityGridProps={{ xs: 12, sm: 6 }} departmentRules={{ required: 'Campo requerido' }} cityRules={{ required: 'Campo requerido' }} />
            <Grid item xs={12} sm={6}><GlassTextField {...register(`${partyType}.${index}.telefono`, { required: 'Campo requerido' })} label="Teléfono" fullWidth error={errors[partyType]?.[index]?.telefono} helperText={errors[partyType]?.[index]?.telefono?.message} /></Grid>
            <Grid item xs={12} sm={6}><GlassTextField {...register(`${partyType}.${index}.email`, { required: 'Campo requerido', pattern: { value: /^\S+@\S+$/i, message: "Email inválido" } })} label="Email" type="email" fullWidth error={errors[partyType]?.[index]?.email} helperText={errors[partyType]?.[index]?.email?.message} /></Grid>
            <LocationSelector control={control} errors={errors} watch={watch} setValue={setValue} showCountry={true} countryFieldName={`${partyType}.${index}.paisOrigen`} countryLabel="País de Origen" countryGridProps={{ xs: 12, sm: 6 }} countryRules={{ required: 'Campo requerido' }} />
            
            {tipoInvolucrado === 'Persona Natural' && (
                <>
                    <Grid item xs={12} sm={6}><GlassTextField {...register(`${partyType}.${index}.fechaNacimiento`, { required: 'Campo requerido' })} label="Fecha de Nacimiento" type="date" InputLabelProps={{ shrink: true }} fullWidth error={errors[partyType]?.[index]?.fechaNacimiento} helperText={errors[partyType]?.[index]?.fechaNacimiento?.message} /></Grid>
                    <Grid item xs={12} sm={6}><GlassSelect control={control} name={`${partyType}.${index}.genero`} label="Género" options={[{ value: 'Masculino', label: 'Masculino' }, { value: 'Femenino', label: 'Femenino' }, { value: 'No Aplica', label: 'No Aplica' }]} rules={{ required: 'Campo requerido' }} error={errors[partyType]?.[index]?.genero} /></Grid>
                    <Grid item xs={12} sm={6}><GlassSelect control={control} name={`${partyType}.${index}.estadoCivil`} label="Estado Civil" options={[{ value: 'Casado(a)', label: 'Casado(a)' }, { value: 'Soltero(a)', label: 'Soltero(a)' }, { value: 'No Informa', label: 'No Informa' }]} rules={{ required: 'Campo requerido' }} error={errors[partyType]?.[index]?.estadoCivil} /></Grid>
                </>
            )}

            <LocationSelector control={control} errors={errors} watch={watch} setValue={setValue} showDepartment={true} showCity={true} departmentFieldName={`${partyType}.${index}.departamento`} cityFieldName={`${partyType}.${index}.ciudad`} departmentLabel="Departamento de Domicilio" cityLabel="Ciudad de Domicilio" departmentGridProps={{ xs: 12, sm: 6 }} cityGridProps={{ xs: 12, sm: 6 }} departmentRules={{ required: 'Campo requerido' }} cityRules={{ required: 'Campo requerido' }} />
            <Grid item xs={12} sm={6}><GlassTextField {...register(`${partyType}.${index}.domicilio`, { required: 'Campo requerido' })} label="Domicilio (Dirección)" fullWidth error={errors[partyType]?.[index]?.domicilio} helperText={errors[partyType]?.[index]?.domicilio?.message} /></Grid>
        </Grid>
    );
};


function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const ConciliacionUnificadaForm = ({ onSubmit }) => {
  const theme = useTheme();
  const { register, control, handleSubmit, watch, setValue, trigger, formState: { errors } } = useForm({
    defaultValues: {
      sede: {},
      infoGeneral: { asuntoJuridicoDefinible: false, cuantiaIndeterminada: false, cuantiaDetallada: false },
      convocantes: [],
      convocados: [],
      hechos: [],
      pretensiones: '',
      fundamentos: '',
      anexos: [],
      firma: { source: 'draw', data: null, file: null },
    }
  });

  const { fields: convocantes, append: appendConvocante, remove: removeConvocante } = useFieldArray({ control, name: "convocantes", rules: { minLength: { value: 1, message: "Debe agregar al menos un convocante" }} });
  const { fields: convocados, append: appendConvocado, remove: removeConvocado } = useFieldArray({ control, name: "convocados", rules: { minLength: { value: 1, message: "Debe agregar al menos un convocado" }} });
  const { fields: hechos, append: appendHecho, remove: removeHecho } = useFieldArray({ control, name: "hechos", rules: { minLength: { value: 1, message: "Debe agregar al menos un hecho" }} });
  const { fields: anexos, append: appendAnexo, remove: removeAnexo } = useFieldArray({ control, name: "anexos" });

  const [tabValue, setTabValue] = useState(0);
  const [validationError, setValidationError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [savedSections, setSavedSections] = useState({
      sede: false,
      infoGeneral: false,
      convocantes: false,
      convocados: false,
      hechos: false,
      pretensiones: false,
      fundamentos: false,
      anexos: false,
      firma: false,
  });
  const sigCanvas = React.useRef({});
  const watchedFirmaSource = watch('firma.source');
  const [signatureSource, setSignatureSource] = useState('draw');
  const [signatureImage, setSignatureImage] = useState(null);

  const areaDerecho = watch('infoGeneral.areaDerecho');
  const watchCuantiaDetallada = watch('infoGeneral.cuantiaDetallada');
  const watchCuantiaIndeterminada = watch('infoGeneral.cuantiaIndeterminada');

    useEffect(() => {
        if (watchedFirmaSource) {
        setSignatureSource(watchedFirmaSource);
        }
    }, [watchedFirmaSource]);

    const handleSignatureFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
        setValue('firma.file', file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setSignatureImage(reader.result);
        };
        reader.readAsDataURL(file);
        }
    };


  useEffect(() => {
    if (watchCuantiaDetallada) {
      setValue('infoGeneral.cuantiaIndeterminada', false);
    }
  }, [watchCuantiaDetallada, setValue]);

  useEffect(() => {
    if (watchCuantiaIndeterminada) {
      setValue('infoGeneral.cuantiaDetallada', false);
    }
  }, [watchCuantiaIndeterminada, setValue]);

  const temas = {
    COMUNITARIO: ['ANIMALES', 'BRUJERÍA', 'CONTAMINACIÓN', 'DAÑOS', 'DROGADICCIÓN', 'INSEGURIDAD', 'LINDEROS / INVASIÓN', 'MAL USO DEL ESPACIO COMUNITARIO', 'MANEJO DE DINEROS', 'RUIDOS', 'RUMORES / CHISMES', 'SERVICIOS PÚBLICOS', 'VENDEDORES AMBULANTES', 'VIOLENCIA CALLEJERA', 'OTROS'],
    FAMILIARES: ['ECONOMÍA DOMÉSTICA', 'INFIDELIDAD', 'PROBLEMAS DE COMUNICACIÓN', 'VIOLENCIA / MALTRATO', 'OTROS'],
  };

  const handleFileChange = (e, index) => {
    if (e.target.files[0]) {
      setValue(`anexos.${index}.file`, e.target.files[0]);
      setValue(`anexos.${index}.name`, e.target.files[0].name);
    }
  };

  const handleSaveSection = async (sectionName, nextTabIndex) => {
    setIsSaving(true);
    let fieldsToValidate = [];

    switch (sectionName) {
      case 'sede': fieldsToValidate = ['sede']; break;
      case 'infoGeneral': fieldsToValidate = ['infoGeneral']; break;
      case 'convocantes': fieldsToValidate = ['convocantes']; break;
      case 'convocados': fieldsToValidate = ['convocados']; break;
      case 'hechos': fieldsToValidate = ['hechos']; break;
      case 'pretensiones': fieldsToValidate = ['pretensiones']; break;
      case 'fundamentos': fieldsToValidate = ['fundamentos']; break;
      case 'anexos': fieldsToValidate = ['anexos']; break;
      case 'firma': fieldsToValidate = ['firma']; break;
      default: break;
    }

    const results = await Promise.all(fieldsToValidate.map(field => trigger(field)));
    const isValid = results.every(Boolean);

    if (isValid) {
      setValidationError('');
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate save
      setSavedSections(prev => ({ ...prev, [sectionName]: true }));
      if (nextTabIndex !== undefined) {
        setTabValue(nextTabIndex);
      }
    } else {
      setValidationError(`Hay errores en la sección actual. Por favor, revise los campos marcados.`);
    }
    setIsSaving(false);
  };

  const onInvalid = (errors) => {
    console.error('Errores de validación del formulario:', errors);
    setValidationError('El formulario tiene errores. Por favor, revise todas las pestañas y corrija los campos marcados en rojo.');
  };

  const customOnSubmit = (data) => {
    const formData = new FormData();
    if (data.anexos && data.anexos.length > 0) {
      data.anexos.forEach(anexo => {
        if (anexo.file) {
          formData.append('anexos', anexo.file);
        }
      });
    }

    if (signatureSource === 'upload' && data.firma?.file) {
      formData.append('firma', data.firma.file);
    }

    const dataToSend = {
      ...data,
      anexos: (data.anexos || []).map(a => ({ name: a.name })),
    };

    if (signatureSource === 'draw' && sigCanvas.current && !sigCanvas.current.isEmpty()) {
      dataToSend.firma = {
        source: 'draw',
        data: sigCanvas.current.getTrimmedCanvas().toDataURL('image/png')
      };
    } else if (signatureSource === 'upload' && data.firma?.file) {
        dataToSend.firma = {
          source: 'upload',
          name: data.firma.file.name,
        };
    }

    formData.append('solicitudData', JSON.stringify(dataToSend));
    onSubmit(formData);
  }

  const allSectionsSaved = Object.values(savedSections).every(Boolean);
  const completionPercentage = (Object.values(savedSections).filter(Boolean).length / Object.values(savedSections).length) * 100;

  const tabsConfig = [
    { key: 'sede', label: 'Sede', icon: LocationCityIcon, color: '#673ab7' },
    { key: 'infoGeneral', label: 'Info General', icon: InfoIcon, color: '#2196f3' },
    { key: 'convocantes', label: 'Convocantes', icon: PersonIcon, color: '#ff5722' },
    { key: 'convocados', label: 'Convocados', icon: PersonIcon, color: '#f44336' },
    { key: 'hechos', label: 'Hechos', icon: DescriptionIcon, color: '#4caf50' },
    { key: 'pretensiones', label: 'Pretensiones', icon: AccountBalanceWalletIcon, color: '#ff9800' },
    { key: 'fundamentos', label: 'Fundamentos', icon: GavelIcon, color: '#9c27b0' },
    { key: 'anexos', label: 'Anexos', icon: AttachFileIcon, color: '#009688' },
    { key: 'firma', label: 'Firma', icon: CreateIcon, color: '#795548' },
  ];

  return (
    <Box>
       <GlassCard hover={false} sx={{ mb: 3, p: 3 }}>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                }}
              >
                <GavelIcon />
              </Avatar>
              <Box>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Solicitud de Conciliación Unificada
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Complete todos los pasos para generar la solicitud
                </Typography>
              </Box>
            </Stack>
          </Stack>
          <Chip
            icon={<TrendingUpIcon />}
            label={`${completionPercentage.toFixed(0)}% Completado`}
            sx={{
              background: alpha(theme.palette.success.main, 0.1),
              color: theme.palette.success.main,
              fontWeight: 600,
              px: 2,
              py: 2.5,
              alignSelf: 'flex-start'
            }}
          />
          <Box>
            <LinearProgress
              variant="determinate"
              value={completionPercentage}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: alpha(theme.palette.grey[500], 0.1),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.info.main})`,
                },
              }}
            />
          </Box>
        </Stack>
      </GlassCard>

      <Collapse in={!!validationError}>
        <GlassCard
          hover={false}
          sx={{
            mb: 3,
            border: `2px solid ${alpha(theme.palette.error.main, 0.3)}`,
            background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.error.main, 0.05)} 100%)`,
          }}
        >
            <Alert
              severity="error"
              icon={<ErrorIcon sx={{ fontSize: 28 }} />}
              sx={{ background: 'transparent', border: 'none' }}
              action={
                <IconButton size="small" onClick={() => setValidationError('')} sx={{ color: theme.palette.error.main }}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              }
            >
              {validationError}
            </Alert>
          </GlassCard>
      </Collapse>

      <GlassCard hover={false} sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              minHeight: 72,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              transition: 'all 0.3s ease',
              '&:hover': { background: alpha(theme.palette.primary.main, 0.05) },
              '&.Mui-selected': { color: theme.palette.primary.main },
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            },
          }}
        >
          {tabsConfig.map((tab, index) => {
            const Icon = tab.icon;
            const isSaved = savedSections[tab.key];
            const isDisabled = index > 0 && !Object.values(savedSections).slice(0, index).every(Boolean);
            
            return (
              <Tab
                key={tab.key}
                disabled={isDisabled}
                onClick={() => setTabValue(index)}
                label={
                  <Stack spacing={0.5} alignItems="center">
                    <Badge badgeContent={isSaved ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : null} color="success">
                      <Icon sx={{ fontSize: 24, color: isSaved ? theme.palette.success.main : tab.color }} />
                    </Badge>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>{tab.label}</Typography>
                  </Stack>
                }
                sx={{ opacity: isDisabled ? 0.4 : 1, '&.Mui-disabled': { color: 'text.disabled' } }}
              />
            );
          })}
        </Tabs>
      </GlassCard>

      <form onSubmit={handleSubmit(customOnSubmit, onInvalid)}>
        <TabPanel value={tabValue} index={0}>
          <GlassCard sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Typography variant="h6">Sede</Typography>
              <LocationSelector control={control} errors={errors} watch={watch} setValue={setValue} showDepartment={true} showCity={true} departmentFieldName="sede.departamento" cityFieldName="sede.ciudad" departmentRules={{ required: 'Campo requerido' }} cityRules={{ required: 'Campo requerido' }} />
              <GlassTextField {...register('sede.entidadPromotora', { required: 'Campo requerido' })} label="Entidad Promotora" fullWidth error={!!errors.sede?.entidadPromotora} helperText={errors.sede?.entidadPromotora?.message} />
              <GlassTextField {...register('sede.sedeCentro', { required: 'Campo requerido' })} label="Sede / Centro" fullWidth error={!!errors.sede?.sedeCentro} helperText={errors.sede?.sedeCentro?.message} />
              <Button variant="contained" onClick={() => handleSaveSection('sede', 1)} disabled={isSaving} startIcon={<SaveIcon />} sx={{ mt: 2 }}>
                {isSaving ? 'Guardando...' : 'Guardar y Continuar'}
              </Button>
            </Stack>
          </GlassCard>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <GlassCard sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Typography variant="h6">Información General del Caso</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}><GlassSelect control={control} name="infoGeneral.solicitanteServicio" label="Solicitante del servicio" options={[{value: 'LAS DOS PARTES-MUTUO ACUERDO', label: 'LAS DOS PARTES-MUTUO ACUERDO'}, {value: 'MEDIANTE APODERADO', label: 'MEDIANTE APODERADO'}, {value: 'SOLO UNA DE LAS PARTES', label: 'SOLO UNA DE LAS PARTES'}]} rules={{ required: 'Campo requerido' }} error={errors.infoGeneral?.solicitanteServicio} /></Grid>
                <Grid item xs={12} sm={6}><GlassSelect control={control} name="infoGeneral.finalidadServicio" label="Finalidad de Adquisición" options={[{value: 'CUMPLIR REQUISITO DE PROCEDIBILIDAD', label: 'CUMPLIR REQUISITO DE PROCEDIBILIDAD'}, {value: 'RESOLVER DE MANERA ALTERNATIVA EL CONFLICTO', label: 'RESOLVER DE MANERA ALTERNATIVA EL CONFLICTO'}]} rules={{ required: 'Campo requerido' }} error={errors.infoGeneral?.finalidadServicio} /></Grid>
                <Grid item xs={12} sm={6}><GlassSelect control={control} name="infoGeneral.tiempoConflicto" label="Tiempo del Conflicto" options={[{value: 'NO INFORMA', label: 'NO INFORMA'}, {value: 'DE 1 A 30 Días (HASTA 1 MES)', label: 'DE 1 A 30 Días (HASTA 1 MES)'}, {value: 'DE 31 A 180 Días (ENTRE 2 Y 6 MESES)', label: 'DE 31 A 180 Días (ENTRE 2 Y 6 MESES)'}, {value: 'SUPERIOR A 180 Días (ENTRE 7 Y 12 MESES)', label: 'SUPERIOR A 180 Días (ENTRE 7 Y 12 MESES)'}, {value: 'SUPERIOR A 365 Días (SUPERIOR A 1 AÑO)', label: 'SUPERIOR A 365 Días (SUPERIOR A 1 AÑO)'}]} rules={{ required: 'Campo requerido' }} error={errors.infoGeneral?.tiempoConflicto} /></Grid>
                <Grid item xs={12} sm={6}><FormControlLabel control={<Controller name="infoGeneral.asuntoJuridicoDefinible" control={control} render={({ field }) => <Checkbox {...field} checked={field.value} />} />} label="¿Asunto Juridico Definible?" /></Grid>
                <Grid item xs={12} sm={6}><GlassSelect control={control} name="infoGeneral.areaDerecho" label="Área del Derecho" options={[{value: 'COMUNITARIO', label: 'COMUNITARIO'}, {value: 'FAMILIARES', label: 'FAMILIARES'}]} rules={{ required: 'Campo requerido' }} error={errors.infoGeneral?.areaDerecho} /></Grid>
                {areaDerecho && <Grid item xs={12} sm={6}><GlassSelect control={control} name="infoGeneral.tema" label="Tema" options={(temas[areaDerecho] || []).map(t => ({value: t, label: t}))} rules={{ required: 'Campo requerido' }} error={errors.infoGeneral?.tema} /></Grid>}
                <Grid item xs={12} sm={6}><FormControlLabel control={<Controller name="infoGeneral.cuantiaDetallada" control={control} render={({ field }) => <Checkbox {...field} checked={field.value} />} />} label="¿Cuantía Detallada?" /></Grid>
                <Grid item xs={12} sm={6}><FormControlLabel control={<Controller name="infoGeneral.cuantiaIndeterminada" control={control} rules={{ validate: (value, formValues) => formValues.infoGeneral.cuantiaDetallada || value || 'Debe seleccionar un tipo de cuantía' }} render={({ field }) => <Checkbox {...field} checked={field.value} />} />} label="¿Cuantía Indeterminada?" /></Grid>
                {errors.infoGeneral?.cuantiaIndeterminada && <Grid item xs={12}><FormHelperText error>{errors.infoGeneral.cuantiaIndeterminada.message}</FormHelperText></Grid>}
                {watchCuantiaDetallada && <>
                    <Grid item xs={12} sm={6}><GlassTextField {...register('infoGeneral.cuantiaTexto', { required: 'Campo requerido' })} label="Detalle Cuantía" fullWidth error={!!errors.infoGeneral?.cuantiaTexto} helperText={errors.infoGeneral?.cuantiaTexto?.message} /></Grid>
                    <Grid item xs={12} sm={6}><GlassTextField {...register('infoGeneral.cuantiaTotal', { required: 'Campo requerido' })} label="Cuantía Total" type="number" fullWidth error={!!errors.infoGeneral?.cuantiaTotal} helperText={errors.infoGeneral?.cuantiaTotal?.message} /></Grid>
                </>}
              </Grid>
              <Button variant="contained" onClick={() => handleSaveSection('infoGeneral', 2)} disabled={isSaving} startIcon={<SaveIcon />} sx={{ mt: 2 }}>
                {isSaving ? 'Guardando...' : 'Guardar y Continuar'}
              </Button>
            </Stack>
          </GlassCard>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
            <Stack spacing={3}>
                {convocantes.map((field, index) => (
                    <GlassCard key={field.id} sx={{ p: 3 }}>
                        <Stack spacing={2}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Chip avatar={<Avatar><PersonIcon /></Avatar>} label={`Convocante #${index + 1}`} />
                                <IconButton onClick={() => removeConvocante(index)} size="small"><DeleteIcon /></IconButton>
                            </Stack>
                            <PartyMemberFields partyType="convocantes" index={index} {...{ control, errors, register, watch, setValue }} />
                        </Stack>
                    </GlassCard>
                ))}
                <Button variant="outlined" onClick={() => appendConvocante({})} startIcon={<AddIcon />}>Añadir Convocante</Button>
                {errors.convocantes?.root && <FormHelperText error>{errors.convocantes.root.message}</FormHelperText>}
                <Button variant="contained" onClick={() => handleSaveSection('convocantes', 3)} disabled={isSaving} startIcon={<SaveIcon />} sx={{ mt: 2 }}>
                  {isSaving ? 'Guardando...' : 'Guardar y Continuar'}
                </Button>
            </Stack>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
            <Stack spacing={3}>
                {convocados.map((field, index) => (
                    <GlassCard key={field.id} sx={{ p: 3 }}>
                        <Stack spacing={2}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Chip avatar={<Avatar><BusinessIcon /></Avatar>} label={`Convocado #${index + 1}`} />
                                <IconButton onClick={() => removeConvocado(index)} size="small"><DeleteIcon /></IconButton>
                            </Stack>
                            <PartyMemberFields partyType="convocados" index={index} {...{ control, errors, register, watch, setValue }} />
                        </Stack>
                    </GlassCard>
                ))}
                <Button variant="outlined" onClick={() => appendConvocado({})} startIcon={<AddIcon />}>Añadir Convocado</Button>
                {errors.convocados?.root && <FormHelperText error>{errors.convocados.root.message}</FormHelperText>}
                <Button variant="contained" onClick={() => handleSaveSection('convocados', 4)} disabled={isSaving} startIcon={<SaveIcon />} sx={{ mt: 2 }}>
                  {isSaving ? 'Guardando...' : 'Guardar y Continuar'}
                </Button>
            </Stack>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
            <GlassCard sx={{ p: 3 }}>
                <Stack spacing={2}>
                    <Typography variant="h6">Hechos</Typography>
                    {hechos.map((field, index) => (
                        <GlassCard key={field.id} sx={{ p: 2, mt: 2 }}>
                            <Stack spacing={2}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Chip label={`Hecho #${index + 1}`} />
                                    <IconButton onClick={() => removeHecho(index)}><DeleteIcon /></IconButton>
                                </Stack>
                                <GlassTextField {...register(`hechos.${index}.descripcion`, { required: 'Campo requerido' })} label="Descripción del Hecho" multiline rows={4} fullWidth error={!!errors.hechos?.[index]?.descripcion} helperText={errors.hechos?.[index]?.descripcion?.message} />
                            </Stack>
                        </GlassCard>
                    ))}
                    <Button variant="outlined" onClick={() => appendHecho({ descripcion: '' })} startIcon={<AddIcon />}>Añadir Hecho</Button>
                    {errors.hechos?.root && <FormHelperText error>{errors.hechos.root.message}</FormHelperText>}
                    <Button variant="contained" onClick={() => handleSaveSection('hechos', 5)} disabled={isSaving} startIcon={<SaveIcon />} sx={{ mt: 2 }}>
                      {isSaving ? 'Guardando...' : 'Guardar y Continuar'}
                    </Button>
                </Stack>
            </GlassCard>
        </TabPanel>

        <TabPanel value={tabValue} index={5}>
            <GlassCard sx={{ p: 3 }}>
                <Stack spacing={2}>
                    <Typography variant="h6">Pretensiones</Typography>
                    <GlassTextField {...register('pretensiones', { required: 'Campo requerido' })} label="Descripción de las Pretensiones" multiline rows={6} fullWidth error={!!errors.pretensiones} helperText={errors.pretensiones?.message} />
                    <Button variant="contained" onClick={() => handleSaveSection('pretensiones', 6)} disabled={isSaving} startIcon={<SaveIcon />} sx={{ mt: 2 }}>
                      {isSaving ? 'Guardando...' : 'Guardar y Continuar'}
                    </Button>
                </Stack>
            </GlassCard>
        </TabPanel>

        <TabPanel value={tabValue} index={6}>
            <GlassCard sx={{ p: 3 }}>
                <Stack spacing={2}>
                    <Typography variant="h6">Fundamentos</Typography>
                    <GlassTextField {...register('fundamentos', { required: 'Campo requerido' })} label="Fundamentos de Derecho" multiline rows={6} fullWidth error={!!errors.fundamentos} helperText={errors.fundamentos?.message}/>
                    <Button variant="contained" onClick={() => handleSaveSection('fundamentos', 7)} disabled={isSaving} startIcon={<SaveIcon />} sx={{ mt: 2 }}>
                      {isSaving ? 'Guardando...' : 'Guardar y Continuar'}
                    </Button>
                </Stack>
            </GlassCard>
        </TabPanel>

        <TabPanel value={tabValue} index={7}>
            <GlassCard sx={{ p: 3 }}>
                <Stack spacing={2}>
                    <Typography variant="h6">Pruebas y Anexos</Typography>
                    {anexos.map((field, index) => (
                        <GlassCard key={field.id} sx={{ p: 2, mt: 2 }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Controller
                                    name={`anexos.${index}.file`}
                                    control={control}
                                    rules={{ required: 'Debe seleccionar un archivo' }}
                                    render={({ field: { onChange, ...fieldProps }, fieldState }) => (
                                        <>
                                            <Button variant="outlined" component="label" startIcon={<UploadFileIcon />} color={fieldState.error ? 'error' : 'primary'}>
                                                Seleccionar Archivo
                                                <input
                                                    type="file"
                                                    hidden
                                                    {...fieldProps}
                                                    onChange={(e) => {
                                                        handleFileChange(e, index);
                                                        onChange(e.target.files[0]);
                                                    }}
                                                />
                                            </Button>
                                            <Box flexGrow={1}>
                                                <Typography variant="body2" noWrap sx={{ color: fieldState.error ? 'error.main' : 'inherit' }}>
                                                    {watch(`anexos.${index}.name`) || 'Ningún archivo seleccionado'}
                                                </Typography>
                                                {fieldState.error && <FormHelperText error>{fieldState.error.message}</FormHelperText>}
                                            </Box>
                                        </>
                                    )}
                                />
                                <IconButton onClick={() => removeAnexo(index)}><DeleteIcon /></IconButton>
                            </Stack>
                        </GlassCard>
                    ))}
                    <Button variant="outlined" onClick={() => appendAnexo({ name: '', file: null })} startIcon={<AddIcon />}>Añadir Anexo</Button>
                    <Button variant="contained" onClick={() => handleSaveSection('anexos', 8)} disabled={isSaving} startIcon={<SaveIcon />} sx={{ mt: 2 }}>
                      {isSaving ? 'Guardando...' : 'Guardar y Continuar'}
                    </Button>
                </Stack>
            </GlassCard>
        </TabPanel>

        <TabPanel value={tabValue} index={8}>
          <GlassCard sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Typography variant="h6">Firma</Typography>
              <FormControl component="fieldset" fullWidth>
                <RadioGroup row value={signatureSource} onChange={(e) => {
                  const newSource = e.target.value;
                  setSignatureSource(newSource);
                  setValue('firma.source', newSource);
                  setValue('firma.data', null);
                  setValue('firma.file', null);
                  if (sigCanvas.current) sigCanvas.current.clear();
                  setSignatureImage(null);
                }}>
                  <FormControlLabel value="draw" control={<Radio />} label="Dibujar Firma" />
                  <FormControlLabel value="upload" control={<Radio />} label="Subir Imagen de Firma" />
                </RadioGroup>
              </FormControl>
              
              {signatureSource === 'draw' && (
                <Box sx={{ border: `1px solid ${alpha(theme.palette.grey[500], 0.4)}`, borderRadius: '12px', overflow: 'hidden' }}>
                  <SignatureCanvas
                    ref={sigCanvas}
                    penColor='black'
                    canvasProps={{ width: 500, height: 200, className: 'sigCanvas' }}
                    onEnd={() => setValue('firma.data', sigCanvas.current.toDataURL())}
                  />
                </Box>
              )}

              {signatureSource === 'upload' && (
                <Stack spacing={2} alignItems="center">
                  <Button variant="outlined" component="label" startIcon={<UploadFileIcon />}>
                    Seleccionar Imagen
                    <input type="file" hidden accept="image/*" onChange={handleSignatureFileUpload} />
                  </Button>
                  {signatureImage && <Avatar src={signatureImage} sx={{ width: 200, height: 100, mt: 2 }} variant="rounded" />}
                  <Controller name="firma.file" control={control} render={({ fieldState }) => fieldState.error && <FormHelperText error>{fieldState.error.message}</FormHelperText>} />
                </Stack>
              )}

              <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setConfirmModalOpen(true)}
                  disabled={!allSectionsSaved || isSaving}
                  sx={{ mt: 4, py: 1.5, fontSize: '1rem' }}
              >
                  Generar Solicitud Unificada
              </Button>
            </Stack>
          </GlassCard>
        </TabPanel>
        
        <Dialog open={isConfirmModalOpen} onClose={() => setConfirmModalOpen(false)}>
            <DialogTitle>Confirmar Envío</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    ¿Está seguro de que desea generar la solicitud? Verifique que toda la información sea correcta antes de continuar.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setConfirmModalOpen(false)}>Cancelar</Button>
                <Button onClick={() => {
                    setConfirmModalOpen(false);
                    handleSubmit(customOnSubmit, onInvalid)();
                }} color="primary" autoFocus>
                    Confirmar y Enviar
                </Button>
            </DialogActions>
        </Dialog>
      </form>
    </Box>
  );
};

export default ConciliacionUnificadaForm;
