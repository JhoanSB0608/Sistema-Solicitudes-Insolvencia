import React from 'react';
import { useForm } from 'react-hook-form';
import { TextField, Button, Typography, Box, Paper, Grid } from '@mui/material';

const ConciliacionExtrajudicialForm = ({ onSubmit }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Solicitud de Conciliación Extrajudicial en Derecho</Typography>
      <form onSubmit={handleSubmit(onSubmit)}>

        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Datos del Convocante (Quien solicita la conciliación)</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}><TextField {...register('convocante.nombre', { required: 'El nombre es requerido' })} label="Nombre Completo" fullWidth error={!!errors.convocante?.nombre} helperText={errors.convocante?.nombre?.message} /></Grid>
          <Grid item xs={12} sm={6}><TextField {...register('convocante.cedula', { required: 'La cédula es requerida' })} label="Cédula" fullWidth error={!!errors.convocante?.cedula} helperText={errors.convocante?.cedula?.message} /></Grid>
          <Grid item xs={12} sm={6}><TextField {...register('convocante.direccion')} label="Dirección para Notificaciones" fullWidth /></Grid>
          <Grid item xs={12} sm={6}><TextField {...register('convocante.telefono')} label="Teléfono" fullWidth /></Grid>
          <Grid item xs={12}><TextField {...register('convocante.email', { required: 'El email es requerido para notificaciones' })} label="Email para Notificaciones" type="email" fullWidth error={!!errors.convocante?.email} helperText={errors.convocante?.email?.message} /></Grid>
        </Grid>

        <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>Datos del Convocado (A quien se cita a conciliar)</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}><TextField {...register('convocado.nombre', { required: 'El nombre es requerido' })} label="Nombre Completo" fullWidth error={!!errors.convocado?.nombre} helperText={errors.convocado?.nombre?.message} /></Grid>
          <Grid item xs={12} sm={6}><TextField {...register('convocado.cedula', { required: 'La cédula es requerida' })} label="Cédula" fullWidth error={!!errors.convocado?.cedula} helperText={errors.convocado?.cedula?.message} /></Grid>
          <Grid item xs={12} sm={6}><TextField {...register('convocado.direccion')} label="Dirección para Notificaciones" fullWidth /></Grid>
          <Grid item xs={12} sm={6}><TextField {...register('convocado.telefono')} label="Teléfono" fullWidth /></Grid>
          <Grid item xs={12}><TextField {...register('convocado.email')} label="Email para Notificaciones" type="email" fullWidth /></Grid>
        </Grid>

        <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>Asunto de la Conciliación</Typography>
        <Grid container spacing={2}>
            <Grid item xs={12}><TextField {...register('asunto')} label="Asunto General" helperText="Ej: Deuda, Incumplimiento de contrato, etc." fullWidth /></Grid>
            <Grid item xs={12}><TextField {...register('hechos', { required: 'Debe relatar los hechos.' })} label="Relato de los Hechos" helperText="Describa de forma clara y breve la situación que da origen a la controversia." multiline rows={5} fullWidth error={!!errors.hechos} helperText={errors.hechos?.message} /></Grid>
            <Grid item xs={12}><TextField {...register('pretensiones', { required: 'Debe indicar sus pretensiones.' })} label="Pretensiones" helperText="Especifique qué busca lograr con la conciliación. Sea claro y conciso." multiline rows={5} fullWidth error={!!errors.pretensiones} helperText={errors.pretensiones?.message} /></Grid>
            <Grid item xs={12}><TextField {...register('cuantia')} label="Cuantía (si aplica)" helperText="Valor estimado de las pretensiones, si es determinable." fullWidth /></Grid>
        </Grid>

        <Button type="submit" variant="contained" sx={{ mt: 4 }}>Generar Solicitud</Button>
      </form>
    </Paper>
  );
};

export default ConciliacionExtrajudicialForm;