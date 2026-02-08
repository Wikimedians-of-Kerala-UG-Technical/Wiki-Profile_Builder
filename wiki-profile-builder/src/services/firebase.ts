import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only if it hasn't been initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  googleProvider,
  signOut,
  onAuthStateChanged,
};

export type { User };

// Firebase Storage helper for uploading images
export async function uploadImage(file: File, pathPrefix = 'uploads') {
  try {
    const storage = getStorage(app);
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const fullPath = `${pathPrefix}/${filename}`;
    const ref = storageRef(storage, fullPath);

    const uploadTask = uploadBytesResumable(ref, file);

    // Wrap in a promise to await completion and get the download URL
    return await new Promise<{ url: string; name: string }>((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        () => {
          // noop: progress could be reported via callbacks in future
        },
        (error) => reject(error),
        async () => {
          try {
            const url = await getDownloadURL(ref);
            resolve({ url, name: filename });
          } catch (err) {
            reject(err);
          }
        }
      );
    });
  } catch (error) {
    console.error('uploadImage error:', error);
    throw error;
  }
}
