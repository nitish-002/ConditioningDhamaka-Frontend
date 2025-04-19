import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyBFE4EskkZ-TnnHP39gWHqw6xs49gtXQi8",
    authDomain: "zuvee-auth.firebaseapp.com",
    projectId: "zuvee-auth",
    storageBucket: "zuvee-auth.firebasestorage.app",
    messagingSenderId: "401090672433",
    appId: "1:401090672433:web:d9c4f1501ab5945b696210"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
