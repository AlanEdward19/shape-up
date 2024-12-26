export const decodeJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
};

export const getUserId = () => {
  return localStorage.getItem('userId') || sessionStorage.getItem('userId');
};

export const setAuthData = (token: string, rememberMe: boolean = false) => {
  const storage = rememberMe ? localStorage : sessionStorage;
  const decoded = decodeJwt(token);
  
  if (decoded && decoded.oid) {
    storage.setItem('userId', decoded.oid);
    storage.setItem('authToken', token);
  }
};

export const clearAuthData = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userId');
  sessionStorage.removeItem('authToken');
  sessionStorage.removeItem('userId');
};

// Adding the missing exports that were causing errors
export const clearAuthConfig = clearAuthData; // Alias for backward compatibility

export const signUp = async (email: string, password: string) => {
  try {
    // Implement actual signup logic here
    // For now, returning a mock success response
    return { success: true };
  } catch (error) {
    console.error('Signup error:', error);
    return { success: false };
  }
};