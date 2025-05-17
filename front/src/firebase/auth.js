import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";

export const doSignInWithEmailAndPassword = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
};