// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC_iuRzChhASx8n7jfo6PIupubCQj4_pac",
  authDomain: "memerygame-43237405-625ed.firebaseapp.com",
  projectId: "memerygame-43237405-625ed",
  storageBucket: "memerygame-43237405-625ed.appspot.com",
  messagingSenderId: "65006235119",
  appId: "1:65006235119:web:9fb6d18a8ad10a7bedda1a",
  measurementId: "G-GQTTHC6H7R"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
