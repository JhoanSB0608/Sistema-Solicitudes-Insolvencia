import { toast } from 'react-toastify';

/**
 * Shows a toast notification.
 * @param {string} message The message to display.
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
 * @param {string} message The message to display.
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

/**
 * A utility to handle and display errors from API calls or other promises.
 * It checks for specific error message formats from Axios and the backend.
 * @param {any} error The error object.
 * @param {string} [defaultMessage='Ha ocurrido un error inesperado.'] Optional default message if a specific one can't be found.
 */
export const handleAxiosError = (error, defaultMessage = 'Ha ocurrido un error inesperado.') => {
  let message = defaultMessage;
  if (error.response) {
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
