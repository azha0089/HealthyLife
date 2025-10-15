// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAnByul4-TMiGydaw7MFlwVgyKNGKWGVUs",
    authDomain: "healthlife-69173.firebaseapp.com",
    projectId: "healthlife-69173",
    storageBucket: "healthlife-69173.appspot.com",
    messagingSenderId: "269867874628",
    appId: "1:269867874628:web:9c99e1cc2f2c68cee8ff11",
    measurementId: "G-Y68SNF4SH2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

// Export Firebase services
export { database, auth, firestore, storage };
export default app;
