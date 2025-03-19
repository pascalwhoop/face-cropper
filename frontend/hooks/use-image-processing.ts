// NOTE: This file was partially generated using AI assistance.
import { useState } from 'react';
import { api } from '@/lib/api/client';
import { toast } from 'sonner';

interface UseImageProcessingOptions {
  aspectRatio?: string;
  zoom?: string;
}

export function useImageProcessing(options: UseImageProcessingOptions = {}) {
  const [isProcessing, setIsProcessing] = useState(false);

  const processImage = async (file: File) => {
    try {
      setIsProcessing(true);
      const response = await api.processImageApiV1ProcessImagePost(
        file,
        options.aspectRatio,
        options.zoom,
        {
          responseType: 'blob', // Tell axios to handle the response as a blob
        }
      );

      // The response.data is already a blob since we specified responseType: 'blob'
      return response.data;
    } catch (error: any) {
      console.error('Error processing image:', error);
      
      // More detailed error message based on the error type
      let errorMessage = 'There was a problem processing your image. Please try again.';
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 422) {
          errorMessage = 'Invalid image format or parameters. Please check your input.';
        } else if (error.response.status === 413) {
          errorMessage = 'Image file is too large. Please try a smaller image.';
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'Could not reach the server. Please check your internet connection.';
      }

      toast.error(errorMessage);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processImage,
    isProcessing,
  };
}
