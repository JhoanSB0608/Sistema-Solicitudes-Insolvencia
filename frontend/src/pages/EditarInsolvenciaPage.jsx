import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSolicitudById, updateSolicitud } from '../services/solicitudService';
import InsolvenciaForm from '../components/forms/InsolvenciaForm';
import { Container, CircularProgress, Alert, Typography, Box } from '@mui/material';

const EditarInsolvenciaPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: solicitud, isLoading, isError, error } = useQuery({
    queryKey: ['solicitud', id],
    queryFn: () => getSolicitudById(id),
    enabled: !!id,
  });

  const { mutate: update, isLoading: isUpdating } = useMutation({
    mutationFn: (solicitudData) => updateSolicitud(id, solicitudData),
    onSuccess: () => {
      queryClient.invalidateQueries(['solicitudes']);
      queryClient.invalidateQueries(['solicitud', id]);
      navigate('/admin');
    },
    onError: (error) => {
      console.error('Error actualizando la solicitud:', error);
    },
  });

  const handleSubmit = (data) => {
    console.log("[EditarInsolvenciaPage] Data received from form:", data);
    update(data);
  };

  if (isLoading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          <Typography>Error al cargar la solicitud: {error.message}</Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Editar Solicitud de Insolvencia
      </Typography>
      {solicitud && (
        <InsolvenciaForm
          onSubmit={handleSubmit}
          initialData={solicitud}
          isUpdating={isUpdating}
        />
      )}
    </Container>
  );
};

export default EditarInsolvenciaPage;
