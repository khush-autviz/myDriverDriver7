import { ShowToast } from './Toast';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export const handleApiResponse = async <T>(
  apiCall: Promise<any>,
  {
    successMessage = 'Operation successful',
    errorMessage = 'Something went wrong',
  }: {
    successMessage?: string;
    errorMessage?: string;
  } = {}
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiCall;
    
    // Check if the API call was successful
    if (response?.status === 200 || response?.status === 201) {
      ShowToast(successMessage, { type: 'success' });
      return {
        data: response.data,
        success: true
      };
    }
    
    // Handle known error responses
    ShowToast(response?.data?.message || errorMessage, { type: 'error' });
    return {
      error: response?.data?.message || errorMessage,
      success: false
    };

  } catch (error: any) {
    // Handle unexpected errors
    const errorMsg = error?.response?.data?.message || error?.message || errorMessage;
    ShowToast(errorMsg, { type: 'error' });
    return {
      error: errorMsg,
      success: false
    };
  }
};

// Example usage with different API patterns:

// For REST APIs:
export const handleRestApi = {
  get: async <T>(
    apiCall: Promise<any>,
    messages?: { success?: string; error?: string }
  ) => {
    return handleApiResponse<T>(apiCall, {
      successMessage: messages?.success || 'Data fetched successfully',
      errorMessage: messages?.error || 'Failed to fetch data'
    });
  },

  post: async <T>(
    apiCall: Promise<any>,
    messages?: { success?: string; error?: string }
  ) => {
    return handleApiResponse<T>(apiCall, {
      successMessage: messages?.success || 'Successfully created',
      errorMessage: messages?.error || 'Failed to create'
    });
  },

  put: async <T>(
    apiCall: Promise<any>,
    messages?: { success?: string; error?: string }
  ) => {
    return handleApiResponse<T>(apiCall, {
      successMessage: messages?.success || 'Successfully updated',
      errorMessage: messages?.error || 'Failed to update'
    });
  },

  delete: async <T>(
    apiCall: Promise<any>,
    messages?: { success?: string; error?: string }
  ) => {
    return handleApiResponse<T>(apiCall, {
      successMessage: messages?.success || 'Successfully deleted',
      errorMessage: messages?.error || 'Failed to delete'
    });
  }
}; 