import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Defined Google Workspace scopes for Sheets and Drive File access
export const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);

// Test connection on initial boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

const provider = new GoogleAuthProvider();
// Add required workspace scopes
SCOPES.forEach((scope) => {
  provider.addScope(scope);
});

// Flag to track ongoing sign in flow
let isSigningIn = false;
// Cache the access token in memory only (never in localStorage/sessionStorage)
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal mendapatkan token akses dari Google.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign in error:', error);
    if (error.code === 'auth/unauthorized-domain' || error.message?.includes('unauthorized-domain')) {
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'domain ini';
      throw new Error(`unauthorized-domain: Domain "${currentHost}" belum didaftarkan di Firebase Console. Untuk mengizinkannya di Vercel, buka Firebase Console > Authentication > Settings > Authorized domains > Add domain "${currentHost}". Atau silakan masuk dengan Email & Kata Sandi.`);
    }
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const emailSignIn = async (email: string, pass: string): Promise<User> => {
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  return cred.user;
};

export const emailSignUp = async (email: string, pass: string, displayName?: string): Promise<User> => {
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  if (displayName) {
    await updateProfile(cred.user, { displayName });
  }
  return cred.user;
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

