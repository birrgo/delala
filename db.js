import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getDatabase, 
    ref, 
    set, 
    get, 
    onValue, 
    push 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBXoIY6Q1Cf3Dw0jU5VImIqxchW79OME6Q",
  authDomain: "delala-1b582.firebaseapp.com",
  databaseURL: "https://delala-1b582-default-rtdb.firebaseio.com",
  projectId: "delala-1b582",
  storageBucket: "delala-1b582.firebasestorage.app",
  messagingSenderId: "1073041850834",
  appId: "1:1073041850834:web:fe5d0095c3ff1b238f480b",
  measurementId: "G-2XW8F8FKBT"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, set, get, onValue, push };


