
const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Requests a signed URL from the backend for uploading a file to GCS,
 * then uploads the file directly to GCS using a PUT request.
 * @param {File} file The file to upload.
 * @returns {Promise<string>} A promise that resolves with the URL of the uploaded file.
 */
export const uploadFile = async (file) => {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined.");
  }

  try {
    // 1. Request a signed URL from the backend for upload
    const response = await fetch(`${API_URL}/api/gcs/upload-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to get signed URL: ${errorData.message || response.statusText}`);
    }

    const { signedUrl, fileUrl } = await response.json();

    if (!signedUrl || !fileUrl) {
      throw new Error("Signed URL or file URL not received from backend.");
    }

    // 2. Upload the file directly to GCS using the signed URL
    const uploadResponse = await fetch(signedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload file to GCS: ${uploadResponse.statusText}`);
    }

    console.log(`File uploaded successfully to: ${fileUrl}`);
    return fileUrl; // Return the public URL of the uploaded file
  } catch (error) {
    console.error('Error in uploadFile:', error);
    throw error;
  }
};

/**
 * Requests a signed URL from the backend for downloading a file from GCS,
 * then opens the URL in a new browser tab to initiate download.
 * @param {string} filename The name of the file to download.
 */
export const downloadFile = async (filename) => {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined.");
  }

  try {
    // 1. Request a signed URL from the backend for download
    const response = await fetch(`${API_URL}/api/gcs/download-url?filename=${encodeURIComponent(filename)}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to get signed URL for download: ${errorData.message || response.statusText}`);
    }

    const { signedUrl } = await response.json();

    if (!signedUrl) {
      throw new Error("Signed URL for download not received from backend.");
    }

    // 2. Open the signed URL in a new tab to initiate download
    window.open(signedUrl, '_blank');
    console.log(`Initiated download for file: ${filename}`);
  } catch (error) {
    console.error('Error in downloadFile:', error);
    throw error;
  }
};
