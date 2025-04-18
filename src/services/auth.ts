interface RegisterData {
    name: string;
    email: string;
    password: string;
    role: 'customer' | 'admin' | 'rider';
  }
  
  export const registerWithMongoDB = async (userData: RegisterData) => {
    try {
      console.log('Attempting to register with data:', userData);
      
      const response = await fetch('http://localhost:5000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
  
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
  
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
  
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };
