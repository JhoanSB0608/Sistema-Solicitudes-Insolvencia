import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { 
  TextField, Button, Typography, Box, Paper, Grid, Tabs, Tab, Checkbox, 
  FormControlLabel, FormControl, InputLabel, Select, MenuItem, FormHelperText,
  alpha, useTheme, Stack, Avatar, IconButton, Chip
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
  Business as BusinessIcon
} from '@mui/icons-material';
import LocationSelector from './LocationSelector';

// --- Reusable Glassmorphism Components ---
const GlassCard = ({ children, sx = {}, ...props }) => (
  <Paper
    elevation={0}
    sx={{
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
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
            
            <LocationSelector control={control} errors={errors} watch={watch} setValue={setValue} showDepartment={true} showCity={true} departmentFieldName={`${partyType}.${index}.departamentoExpedicion`} cityFieldName={`${partyType}.${index}.ciudadExpedicion`} departmentLabel="Departamento de Expedición" cityLabel="Ciudad de Expedición" departmentGridProps={{ xs: 12, sm: 6 }} cityGridProps={{ xs: 12, sm: 6 }} />
            <Grid item xs={12} sm={6}><GlassTextField {...register(`${partyType}.${index}.telefono`, { required: 'Campo requerido' })} label="Teléfono" fullWidth error={errors[partyType]?.[index]?.telefono} helperText={errors[partyType]?.[index]?.telefono?.message} /></Grid>
            <Grid item xs={12} sm={6}><GlassTextField {...register(`${partyType}.${index}.email`, { required: 'Campo requerido' })} label="Email" type="email" fullWidth error={errors[partyType]?.[index]?.email} helperText={errors[partyType]?.[index]?.email?.message} /></Grid>
            <LocationSelector control={control} errors={errors} watch={watch} setValue={setValue} showCountry={true} countryFieldName={`${partyType}.${index}.paisOrigen`} countryLabel="País de Origen" countryGridProps={{ xs: 12, sm: 6 }} />
            
            {tipoInvolucrado === 'Persona Natural' && (
                <>
                    <Grid item xs={12} sm={6}><GlassTextField {...register(`${partyType}.${index}.fechaNacimiento`, { required: 'Campo requerido' })} label="Fecha de Nacimiento" type="date" InputLabelProps={{ shrink: true }} fullWidth error={errors[partyType]?.[index]?.fechaNacimiento} helperText={errors[partyType]?.[index]?.fechaNacimiento?.message} /></Grid>
                    <Grid item xs={12} sm={6}><GlassSelect control={control} name={`${partyType}.${index}.genero`} label="Género" options={[{ value: 'Masculino', label: 'Masculino' }, { value: 'Femenino', label: 'Femenino' }, { value: 'No Aplica', label: 'No Aplica' }]} rules={{ required: 'Campo requerido' }} error={errors[partyType]?.[index]?.genero} /></Grid>
                    <Grid item xs={12} sm={6}><GlassSelect control={control} name={`${partyType}.${index}.estadoCivil`} label="Estado Civil" options={[{ value: 'Casado(a)', label: 'Casado(a)' }, { value: 'Soltero(a)', label: 'Soltero(a)' }, { value: 'No Informa', label: 'No Informa' }]} rules={{ required: 'Campo requerido' }} error={errors[partyType]?.[index]?.estadoCivil} /></Grid>
                </>
            )}

            <LocationSelector control={control} errors={errors} watch={watch} setValue={setValue} showDepartment={true} showCity={true} departmentFieldName={`${partyType}.${index}.departamento`} cityFieldName={`${partyType}.${index}.ciudad`} departmentLabel="Departamento de Domicilio" cityLabel="Ciudad de Domicilio" departmentGridProps={{ xs: 12, sm: 6 }} cityGridProps={{ xs: 12, sm: 6 }} />
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
  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      sede: {},
      infoGeneral: { asuntoJuridicoDefinible: false, cuantiaIndeterminada: false, cuantiaDetallada: false },
      convocantes: [],
      convocados: [],
      hechos: [],
      pretensiones: '',
      fundamentos: '',
      anexos: [],
    }
  });

  const { fields: convocantes, append: appendConvocante, remove: removeConvocante } = useFieldArray({ control, name: "convocantes" });
  const { fields: convocados, append: appendConvocado, remove: removeConvocado } = useFieldArray({ control, name: "convocados" });
  const { fields: hechos, append: appendHecho, remove: removeHecho } = useFieldArray({ control, name: "hechos" });
  const { fields: anexos, append: appendAnexo, remove: removeAnexo } = useFieldArray({ control, name: "anexos" });

  const [tabValue, setTabValue] = useState(0);

  const areaDerecho = watch('infoGeneral.areaDerecho');
  const watchCuantiaDetallada = watch('infoGeneral.cuantiaDetallada');
  const watchCuantiaIndeterminada = watch('infoGeneral.cuantiaIndeterminada');

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

  return (
    <Box>
      <GlassCard sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)} variant="scrollable" scrollButtons="auto">
          <Tab label="Sede" icon={<LocationCityIcon />} iconPosition="start" />
          <Tab label="Info General" icon={<InfoIcon />} iconPosition="start" />
          <Tab label="Convocantes" icon={<PersonIcon />} iconPosition="start" />
          <Tab label="Convocados" icon={<PersonIcon />} iconPosition="start" />
          <Tab label="Hechos" icon={<DescriptionIcon />} iconPosition="start" />
          <Tab label="Pretensiones" icon={<AccountBalanceWalletIcon />} iconPosition="start" />
          <Tab label="Fundamentos" icon={<GavelIcon />} iconPosition="start" />
          <Tab label="Pruebas y Anexos" icon={<AttachFileIcon />} iconPosition="start" />
        </Tabs>
      </GlassCard>

      <form onSubmit={handleSubmit(onSubmit)}>
        <TabPanel value={tabValue} index={0}>
          <GlassCard sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Typography variant="h6">Sede</Typography>
              <LocationSelector control={control} errors={errors} watch={watch} setValue={setValue} showDepartment={true} showCity={true} departmentFieldName="sede.departamento" cityFieldName="sede.ciudad" />
              <GlassTextField {...register('sede.entidadPromotora')} label="Entidad Promotora" fullWidth />
              <GlassTextField {...register('sede.sedeCentro')} label="Sede / Centro" fullWidth />
            </Stack>
          </GlassCard>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <GlassCard sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Typography variant="h6">Información General del Caso</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}><GlassSelect control={control} name="infoGeneral.solicitanteServicio" label="Solicitante del servicio" options={[{value: 'LAS DOS PARTES-MUTUO ACUERDO', label: 'LAS DOS PARTES-MUTUO ACUERDO'}, {value: 'MEDIANTE APODERADO', label: 'MEDIANTE APODERADO'}, {value: 'SOLO UNA DE LAS PARTES', label: 'SOLO UNA DE LAS PARTES'}]} /></Grid>
                <Grid item xs={12} sm={6}><GlassSelect control={control} name="infoGeneral.finalidadServicio" label="Finalidad de Adquisición" options={[{value: 'CUMPLIR REQUISITO DE PROCEDIBILIDAD', label: 'CUMPLIR REQUISITO DE PROCEDIBILIDAD'}, {value: 'RESOLVER DE MANERA ALTERNATIVA EL CONFLICTO', label: 'RESOLVER DE MANERA ALTERNATIVA EL CONFLICTO'}]} /></Grid>
                <Grid item xs={12} sm={6}><GlassSelect control={control} name="infoGeneral.tiempoConflicto" label="Tiempo del Conflicto" options={[{value: 'NO INFORMA', label: 'NO INFORMA'}, {value: 'DE 1 A 30 Días (HASTA 1 MES)', label: 'DE 1 A 30 Días (HASTA 1 MES)'}, {value: 'DE 31 A 180 Días (ENTRE 2 Y 6 MESES)', label: 'DE 31 A 180 Días (ENTRE 2 Y 6 MESES)'}, {value: 'SUPERIOR A 180 Días (ENTRE 7 Y 12 MESES)', label: 'SUPERIOR A 180 Días (ENTRE 7 Y 12 MESES)'}, {value: 'SUPERIOR A 365 Días (SUPERIOR A 1 AÑO)', label: 'SUPERIOR A 365 Días (SUPERIOR A 1 AÑO)'}]} /></Grid>
                <Grid item xs={12} sm={6}><FormControlLabel control={<Controller name="infoGeneral.asuntoJuridicoDefinible" control={control} render={({ field }) => <Checkbox {...field} checked={field.value} />} />} label="¿Asunto Juridico Definible?" /></Grid>
                <Grid item xs={12} sm={6}><GlassSelect control={control} name="infoGeneral.areaDerecho" label="Área del Derecho" options={[{value: 'COMUNITARIO', label: 'COMUNITARIO'}, {value: 'FAMILIARES', label: 'FAMILIARES'}]} /></Grid>
                {areaDerecho && <Grid item xs={12} sm={6}><GlassSelect control={control} name="infoGeneral.tema" label="Tema" options={(temas[areaDerecho] || []).map(t => ({value: t, label: t}))} /></Grid>}
                <Grid item xs={12} sm={6}><FormControlLabel control={<Controller name="infoGeneral.cuantiaDetallada" control={control} render={({ field }) => <Checkbox {...field} checked={field.value} />} />} label="¿Cuantía Detallada?" /></Grid>
                <Grid item xs={12} sm={6}><FormControlLabel control={<Controller name="infoGeneral.cuantiaIndeterminada" control={control} render={({ field }) => <Checkbox {...field} checked={field.value} />} />} label="¿Cuantía Indeterminada?" /></Grid>
                {watchCuantiaDetallada && <>
                    <Grid item xs={12} sm={6}><GlassTextField {...register('infoGeneral.cuantiaTexto')} label="Detalle Cuantía" fullWidth /></Grid>
                    <Grid item xs={12} sm={6}><GlassTextField {...register('infoGeneral.cuantiaTotal')} label="Cuantía Total" type="number" fullWidth /></Grid>
                </>}
              </Grid>
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
                                <GlassTextField {...register(`hechos.${index}.descripcion`)} label="Descripción del Hecho" multiline rows={4} fullWidth />
                            </Stack>
                        </GlassCard>
                    ))}
                    <Button variant="outlined" onClick={() => appendHecho({ descripcion: '' })} startIcon={<AddIcon />}>Añadir Hecho</Button>
                </Stack>
            </GlassCard>
        </TabPanel>

        <TabPanel value={tabValue} index={5}>
            <GlassCard sx={{ p: 3 }}>
                <Stack spacing={2}>
                    <Typography variant="h6">Pretensiones</Typography>
                    <GlassTextField {...register('pretensiones')} label="Descripción de las Pretensiones" multiline rows={6} fullWidth />
                </Stack>
            </GlassCard>
        </TabPanel>

        <TabPanel value={tabValue} index={6}>
            <GlassCard sx={{ p: 3 }}>
                <Stack spacing={2}>
                    <Typography variant="h6">Fundamentos</Typography>
                    <GlassTextField {...register('fundamentos')} label="Fundamentos de Derecho" multiline rows={6} fullWidth />
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
                                <Button variant="outlined" component="label" startIcon={<UploadFileIcon />}>
                                    Seleccionar Archivo
                                    <input type="file" hidden onChange={(e) => handleFileChange(e, index)} />
                                </Button>
                                <Typography variant="body2" noWrap>{watch(`anexos.${index}.name`) || 'Ningún archivo seleccionado'}</Typography>
                                <IconButton onClick={() => removeAnexo(index)}><DeleteIcon /></IconButton>
                            </Stack>
                        </GlassCard>
                    ))}
                    <Button variant="outlined" onClick={() => appendAnexo({ name: '', file: null })} startIcon={<AddIcon />}>Añadir Anexo</Button>
                </Stack>
            </GlassCard>
        </TabPanel>

        <Button type="submit" variant="contained" color="primary" sx={{ mt: 4, py: 1.5, fontSize: '1rem' }}>Generar Solicitud Unificada</Button>
      </form>
    </Box>
  );
};

export default ConciliacionUnificadaForm;
