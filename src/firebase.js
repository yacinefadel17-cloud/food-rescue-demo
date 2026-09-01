import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  enableIndexedDbPersistence 
} from "firebase/firestore";
import { 
  getAuth, 
  setPersistence, 
  browserSessionPersistence 
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDijwO5F-NhW9Vvgp0m0Lc1eMkqQkEWrYE",
  authDomain: "food-rescue-demo-3155f.firebaseapp.com",
  projectId: "food-rescue-demo-3155f",
  storageBucket: "food-rescue-demo-3155f.firebasestorage.app",
  messagingSenderId: "311313250450",
  appId: "1:311313250450:web:5eea6bf95979438bd58e4b",
  measurementId: "G-8GM6N4K17N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

// Enable Offline Data Support (تفعيل وضع العمل بدون انترنت مؤقتاً)
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.warn('Persistence not supported by browser');
    }
  });
} catch (e) {
  console.log("Persistence initialization error", e);
}

// Session persistence setting
setPersistence(auth, browserSessionPersistence);