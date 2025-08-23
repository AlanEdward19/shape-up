import { 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  getIdToken,
  User,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  sendEmailVerification,
  applyActionCode,
  checkActionCode
} from "firebase/auth";
import { getDoc } from "firebase/firestore";
import { auth } from "@/config/firebase.ts";
import { SERVICES } from "@/config/services.ts";
import {createHeaders} from "@/services/utils/serviceUtils.ts";

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

const FIREBASE_API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;

export const refreshIdToken = async (refreshToken: string) => {
  console.log(`Refresh token: ${refreshToken}`);

  const url = `https://securetoken.googleapis.com/v1/token?key=${FIREBASE_API_KEY}`;
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!response.ok) throw new Error("Failed to refresh token");
  return response.json();
};

export const getAuthToken = async (): Promise<string | null> => {
  let token = sessionStorage.getItem('authToken');
  let refreshToken = sessionStorage.getItem('refreshToken');
  let storage = sessionStorage;

  // If not found, try localStorage
  if (!token) {
    token = localStorage.getItem('authToken');
    refreshToken = localStorage.getItem('refreshToken');
    storage = localStorage;
  }

  if (!token) return null;

  const decoded = decodeJwt(token);
  const now = Math.floor(Date.now() / 1000);
  if (decoded?.exp && decoded.exp > now) {
    return token;
  }
  // Token expired, try to refresh
  if (refreshToken) {
    try {
      const refreshed = await refreshIdToken(refreshToken);
      const newToken = refreshed.id_token;
      const newRefreshToken = refreshed.refresh_token;
      storage.setItem('authToken', newToken);
      storage.setItem('refreshToken', newRefreshToken);
      return newToken;
    } catch (err) {
      console.error('Failed to refresh token:', err);
      return null;
    }
  }
  return null;
};

export const getUserId = () => {
  return auth.currentUser?.uid || null;
};

export const setAuthData = async (userOrToken: User | string, rememberMe: boolean = false) => {
  let token: string;
  let userId: string;
  let refreshToken: string | undefined;

  console.log("setAuthData called with:", userOrToken);

  if (typeof userOrToken === 'string') {
    token = userOrToken;
    const decoded = decodeJwt(token);
    userId = decoded?.sub || '';
  } else {
    token = await getIdToken(userOrToken);
    userId = userOrToken.uid;
    refreshToken = userOrToken.refreshToken;
  }

  if (rememberMe) {
    localStorage.setItem('userId', userId);
    localStorage.setItem('authToken', token);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
  } else {
    sessionStorage.setItem('userId', userId);
    sessionStorage.setItem('authToken', token);
    if (refreshToken) sessionStorage.setItem('refreshToken', refreshToken);
  }
};

export const clearAuthData = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userId');
  sessionStorage.removeItem('authToken');
  sessionStorage.removeItem('userId');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('refreshToken');
};

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

export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    const randomPassword = Math.random().toString(36).slice(-8);
    await createUserWithEmailAndPassword(auth, email, randomPassword);
    
    if (auth.currentUser) {
      await auth.currentUser.delete();
    }
    
    return false;
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      return true;
    }
    
    console.error('Error checking email existence:', error);
    return false;
  }
};

export const sendVerificationCode = async (email: string): Promise<{ success: boolean; error?: any }> => {
  try {
    const emailExists = await checkEmailExists(email);
    
    if (emailExists) {
      return { success: false, error: { code: 'auth/email-already-in-use' } };
    }
    
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    sessionStorage.setItem(`verification_code_${email}`, verificationCode);
    console.log(`Verification code for ${email}: ${verificationCode}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { success: true };
  } catch (error) {
    console.error('Error sending verification code:', error);
    return { success: false, error };
  }
};

export const verifyCode = (email: string, code: string): boolean => {
  const storedCode = sessionStorage.getItem(`verification_code_${email}`);
  return storedCode === code;
};

export const enhanceToken = async (userData: any): Promise<boolean> => {
  try {
    const token = await getAuthToken();

    if (!token) {
      console.error('No auth token available');
      return false;
    }
    
    const response = await fetch(`${SERVICES.AUTH.baseUrl}${SERVICES.AUTH.endpoints.enhanceToken}`, {
      method: 'POST',
      headers: await createHeaders(),
      body: JSON.stringify({
        scopes: userData
      }),
    });
    
    if (!response.ok) {
      console.error('Failed to enhance token:', await response.text());
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error enhancing token:', error);
    return false;
  }
};

export const signUp = async (email: string, password: string, userData?: any) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    if (userCredential.user) {
      await sendEmailVerification(userCredential.user);
      
      // Add custom claims via the Auth service if userData is provided
      if (userData) {
        await setAuthData(userCredential.user);
        await enhanceToken(userData);
      }
    }
    
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Signup error:', error);
    return { success: false, error };
  }
};
