import { apiConfig, apiCall } from '../config/api';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'admin' | 'rider';
}

export const registerWithMongoDB = async (userData: RegisterData) => {
  try {
    console.log('Attempting to register with data:', userData);
    
    const data = await apiCall(apiConfig.endpoints.register, {
      method: 'POST',
      body: JSON.stringify(userData)
    });

    console.log('Registration successful:', data);
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};
