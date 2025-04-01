
import { 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  getIdToken,
  User
} from "firebase/auth";
import { auth } from "@/config/firebase";

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

export const getAuthToken = async () => {
  const user = auth.currentUser;
  if (user) {
    return await getIdToken(user);
  }
  return null;
};

export const getUserId = () => {
  return auth.currentUser?.uid || null;
};

// Updated to accept either a User object or a token string
export const setAuthData = async (userOrToken: User | string, rememberMe: boolean = false) => {
  let token: string;
  let userId: string;
  
  if (typeof userOrToken === 'string') {
    // It's a token string
    token = userOrToken;
    const decoded = decodeJwt(token);
    userId = decoded?.sub || '';
  } else {
    // It's a User object
    token = await getIdToken(userOrToken);
    userId = userOrToken.uid;
  }
  
  if (rememberMe) {
    localStorage.setItem('userId', userId);
    localStorage.setItem('authToken', token);
  } else {
    sessionStorage.setItem('userId', userId);
    sessionStorage.setItem('authToken', token);
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

export const signInWithEmail = async (email: string, password: string, rememberMe: boolean = false) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    await setAuthData(userCredential.user, rememberMe);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error };
  }
};

export const signInWithGoogle = async (rememberMe: boolean = false) => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    await setAuthData(userCredential.user, rememberMe);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Google login error:', error);
    return { success: false, error };
  }
};

export const signInWithFacebook = async (rememberMe: boolean = false) => {
  try {
    const provider = new FacebookAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    await setAuthData(userCredential.user, rememberMe);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Facebook login error:', error);
    return { success: false, error };
  }
};

export const signUp = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Signup error:', error);
    return { success: false, error };
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    clearAuthData();
    return { success: true };
  } catch (error) {
    console.error('Signout error:', error);
    return { success: false, error };
  }
};
