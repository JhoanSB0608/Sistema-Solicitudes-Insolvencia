import React from 'react';
import { useForm } from 'react-hook-form';
import { TextField, Button, Typography, Box, Paper, Grid } from '@mui/material';

const AlimentosConyugeForm = ({ onSubmit }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Solicitud de Alimentos para Cónyuge</Typography>
      <form onSubmit={handleSubmit(onSubmit)}>

        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Datos del Cónyuge Convocante (Quien solicita)</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}><TextField {...register('convocante.nombre', { required: 'El nombre es requerido' })} label="Nombre Completo" fullWidth error={!!errors.convocante?.nombre} helperText={errors.convocante?.nombre?.message} /></Grid>
          <Grid item xs={12} sm={6}><TextField {...register('convocante.cedula', { required: 'La cédula es requerida' })} label="Cédula" fullWidth error={!!errors.convocante?.cedula} helperText={errors.convocante?.cedula?.message} /></Grid>
          <Grid item xs={12} sm={6}><TextField {...register('convocante.direccion')} label="Dirección de Domicilio" fullWidth /></Grid>
          <Grid item xs={12} sm={6}><TextField {...register('convocante.telefono')} label="Teléfono" fullWidth /></Grid>
          <Grid item xs={12}><TextField {...register('convocante.email', { required: 'El email es requerido para notificaciones' })} label="Email para Notificaciones" type="email" fullWidth error={!!errors.convocante?.email} helperText={errors.convocante?.email?.message} /></Grid>
        </Grid>

        <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>Datos del Cónyuge Convocado (A quien se solicita)</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}><TextField {...register('convocado.nombre', { required: 'El nombre es requerido' })} label="Nombre Completo" fullWidth error={!!errors.convocado?.nombre} helperText={errors.convocado?.nombre?.message} /></Grid>
          <Grid item xs={12} sm={6}><TextField {...register('convocado.cedula', { required: 'La cédula es requerida' })} label="Cédula" fullWidth error={!!errors.convocado?.cedula} helperText={errors.convocado?.cedula?.message} /></Grid>
          <Grid item xs={12} sm={6}><TextField {...register('convocado.direccion')} label="Última Dirección Conocida" fullWidth /></Grid>
          <Grid item xs={12} sm={6}><TextField {...register('convocado.telefono')} label="Último Teléfono Conocido" fullWidth /></Grid>
          <Grid item xs={12}><TextField {...register('convocado.email')} label="Email para Notificaciones" type="email" fullWidth /></Grid>
        </Grid>

        <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>Hechos y Pretensiones</Typography>
        <Grid container spacing={2}>
            <Grid item xs={12}><TextField {...register('hechos.detallesMatrimonio')} label="Detalles del Matrimonio" helperText="Ej: Fecha, notaría y ciudad del matrimonio." fullWidth /></Grid>
            <Grid item xs={12}><TextField {...register('hechos.relato', { required: 'Debe relatar los hechos.' })} label="Relato de los Hechos" helperText="Describa brevemente la situación actual (ej. separación de cuerpos), la necesidad económica, etc." multiline rows={5} fullWidth error={!!errors.hechos?.relato} helperText={errors.hechos?.relato?.message} /></Grid>
            <Grid item xs={12}><TextField {...register('pretensiones.cuotaAlimentos', { required: 'Debe indicar sus pretensiones.' })} label="Pretensiones de la Cuota Alimentaria" helperText="Especifique el valor de la cuota que solicita y la forma de pago." multiline rows={3} fullWidth error={!!errors.pretensiones?.cuotaAlimentos} helperText={errors.pretensiones?.cuotaAlimentos?.message} /></Grid>
            <Grid item xs={12}><TextField {...register('pruebas')} label="Pruebas que Aporta" helperText="(Opcional) Mencione los documentos que anexa, como el registro de matrimonio." multiline rows={3} fullWidth /></Grid>
        </Grid>

        <Button type="submit" variant="contained" sx={{ mt: 4 }}>Generar Solicitud</Button>
      </form>
    </Paper>
  );
};

export default AlimentosConyugeForm;