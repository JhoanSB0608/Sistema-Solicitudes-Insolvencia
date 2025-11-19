import React from 'react';
import { toast } from 'react-toastify';
import { resendVerificationEmail } from '../services/userService';

/**
 * Shows a toast notification.
 * @param {string | React.ReactNode} message The message to display.
 * @param {'info' | 'success' | 'warning' | 'error'} type The type of the toast.
 */
const showAlert = (message, type = 'info') => {
  toast(message, { type });
};

/**
 * Shows a success toast notification.
 * @param {string} message The message to display.
 */
export const showSuccess = (message) => {
  showAlert(message, 'success');
};

/**
 * Shows an error toast notification.
 * @param {string | React.ReactNode} message The message to display.
 */
export const showError = (message) => {
  showAlert(message, 'error');
};

/**
 * Shows a warning toast notification.
 * @param {string} message The message to display.
 */
export const showWarning = (message) => {
  showAlert(message, 'warning');
};


const ResendVerificationToast = ({ email, message }) => {
  const handleResend = async () => {
    try {
      const res = await resendVerificationEmail(email);
      showSuccess(res.message || 'Correo de verificación reenviado con éxito.');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al reenviar el correo.';
      showError(errorMessage);
    }
  };

  return (
    <div>
      {message}
      <br />
      <button 
        onClick={handleResend} 
        style={{ 
          marginTop: '10px', 
          padding: '5px 10px', 
          border: 'none', 
          borderRadius: '4px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          cursor: 'pointer' 
        }}
      >
        Reenviar Correo
      </button>
    </div>
  );
};


/**
 * A utility to handle and display errors from API calls or other promises.
 * It checks for specific error message formats from Axios and the backend.
 * @param {any} error The error object.
 * @param {string} [defaultMessage='Ha ocurrido un error inesperado.'] Optional default message if a specific one can't be found.
 */
export const handleAxiosError = (error, defaultMessage = 'Ha ocurrido un error inesperado.') => {
  let message = defaultMessage;
  if (error.response) {
    // Handle specific error code for unverified account
    if (error.response.data?.code === 'ACCOUNT_NOT_VERIFIED') {
      const email = error.config.data ? JSON.parse(error.config.data).email : null;
      if (email) {
        showError(
          <ResendVerificationToast 
            email={email} 
            message={error.response.data.message} 
          />
        );
        return;
      }
    }

    // Handle specific error code for existing but unverified account during registration
    if (error.response.data?.code === 'ACCOUNT_EXISTS_NOT_VERIFIED') {
      showWarning(error.response.data.message);
      return;
    }

    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    if (error.response.data && error.response.data.message) {
      message = error.response.data.message;
    } else if (typeof error.response.data === 'string') {
      message = error.response.data;
    }
  } else if (error.request) {
    // The request was made but no response was received
    message = 'No se pudo conectar con el servidor. Por favor, revise su conexión a internet.';
  } else {
    // Something happened in setting up the request that triggered an Error
    message = error.message;
  }
  showError(message);
};
