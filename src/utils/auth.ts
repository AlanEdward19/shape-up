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

export const setAuthData = async (userOrToken: User | string, rememberMe: boolean = false) => {
  let token: string;
  let userId: string;
  
  if (typeof userOrToken === 'string') {
    token = userOrToken;
    const decoded = decodeJwt(token);
    userId = decoded?.sub || '';
  } else {
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

export const clearAuthConfig = clearAuthData;

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

export const signUp = async (email: string, password: string, userData?: any) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    if (userCredential.user) {
      await sendEmailVerification(userCredential.user);
    }
    
    if (userData) {
      console.log('Additional user data to store:', userData);
    }
    
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
