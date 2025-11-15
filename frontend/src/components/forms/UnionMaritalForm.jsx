import React from 'react';
import { useForm } from 'react-hook-form';
import { TextField, Button, Typography, Box, Paper, Grid } from '@mui/material';

const UnionMaritalForm = ({ onSubmit }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Declaración de Unión Marital de Hecho y Fijación de Cuota de Alimentos</Typography>
      <form onSubmit={handleSubmit(onSubmit)}>

        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Datos del Convocante (Compañero/a que solicita)</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}><TextField {...register('convocante.nombre', { required: 'El nombre es requerido' })} label="Nombre Completo" fullWidth error={!!errors.convocante?.nombre} helperText={errors.convocante?.nombre?.message} /></Grid>
          <Grid item xs={12} sm={6}><TextField {...register('convocante.cedula', { required: 'La cédula es requerida' })} label="Cédula" fullWidth error={!!errors.convocante?.cedula} helperText={errors.convocante?.cedula?.message} /></Grid>
          <Grid item xs={12} sm={6}><TextField {...register('convocante.direccion')} label="Dirección de Domicilio" fullWidth /></Grid>
          <Grid item xs={12} sm={6}><TextField {...register('convocante.telefono')} label="Teléfono" fullWidth /></Grid>
          <Grid item xs={12}><TextField {...register('convocante.email', { required: 'El email es requerido para notificaciones' })} label="Email para Notificaciones" type="email" fullWidth error={!!errors.convocante?.email} helperText={errors.convocante?.email?.message} /></Grid>
        </Grid>

        <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>Datos del Convocado (Otro/a compañero/a)</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}><TextField {...register('convocado.nombre', { required: 'El nombre es requerido' })} label="Nombre Completo" fullWidth error={!!errors.convocado?.nombre} helperText={errors.convocado?.nombre?.message} /></Grid>
          <Grid item xs={12} sm={6}><TextField {...register('convocado.cedula', { required: 'La cédula es requerida' })} label="Cédula" fullWidth error={!!errors.convocado?.cedula} helperText={errors.convocado?.cedula?.message} /></Grid>
          <Grid item xs={12} sm={6}><TextField {...register('convocado.direccion')} label="Última Dirección Conocida" fullWidth /></Grid>
          <Grid item xs={12} sm={6}><TextField {...register('convocado.telefono')} label="Último Teléfono Conocido" fullWidth /></Grid>
          <Grid item xs={12}><TextField {...register('convocado.email')} label="Email para Notificaciones" type="email" fullWidth /></Grid>
        </Grid>

        <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>Detalles de la Unión y Peticiones</Typography>
        <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><TextField {...register('hechos.fechaInicioUnion', { required: 'Campo requerido' })} label="Fecha de Inicio de la Convivencia" type="date" InputLabelProps={{ shrink: true }} fullWidth error={!!errors.hechos?.fechaInicioUnion} helperText={errors.hechos?.fechaInicioUnion?.message} /></Grid>
            <Grid item xs={12} sm={6}><TextField {...register('hechos.fechaFinUnion')} label="Fecha de Fin de la Convivencia (si aplica)" type="date" InputLabelProps={{ shrink: true }} fullWidth /></Grid>
            <Grid item xs={12}><TextField {...register('hechos.relato', { required: 'Debe relatar los hechos.' })} label="Relato de los Hechos" helperText="Describa cómo ha sido la convivencia, si hay bienes adquiridos en común y la situación económica actual." multiline rows={5} fullWidth error={!!errors.hechos?.relato} helperText={errors.hechos?.relato?.message} /></Grid>
            <Grid item xs={12}><TextField {...register('pretensiones.declaracionUnion', { required: 'Campo requerido' })} label="Petición de Declaración de la Unión" helperText="Ej: Solicito se declare la existencia de la unión marital de hecho entre..." multiline rows={3} fullWidth error={!!errors.pretensiones?.declaracionUnion} helperText={errors.pretensiones?.declaracionUnion?.message} /></Grid>
            <Grid item xs={12}><TextField {...register('pretensiones.cuotaAlimentos')} label="Petición de Cuota de Alimentos (si aplica)" helperText="Ej: Solicito se fije una cuota alimentaria por valor de..." multiline rows={3} fullWidth /></Grid>
            <Grid item xs={12}><TextField {...register('pruebas')} label="Pruebas que Aporta" helperText="(Opcional) Mencione los documentos que anexa, como registros, facturas, etc." multiline rows={3} fullWidth /></Grid>
        </Grid>

        <Button type="submit" variant="contained" sx={{ mt: 4 }}>Generar Solicitud</Button>
      </form>
    </Paper>
  );
};

export default UnionMaritalForm;