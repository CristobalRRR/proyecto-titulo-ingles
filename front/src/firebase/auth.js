import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "./firebase";

export const doSignInWithEmailAndPassword = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
};

export const doSignOut = () => signOut(auth);
