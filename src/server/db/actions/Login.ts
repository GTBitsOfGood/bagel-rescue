import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { auth } from "../firebase";

// Login with Email and Password
export const loginWithCredentials = async (email: string, password: string) => {
  return await setPersistence(auth, browserLocalPersistence)
    .then(() => {
      return signInWithEmailAndPassword(auth, email, password);
    })
    .then(async (userCredential) => {
      const user = userCredential.user;
      const token = await user.getIdToken();
      // Optionally: You can store the token in a secure cookie if needed,
      // but Firebase already handles session persistence securely.
      return { success: true };
    })
    .catch((error) => {
      console.error("Error during login:", error);
      let errorMsg = "";
      if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found" ||
        error.code === "auth/invalid-email"
      ) {
        errorMsg =
          "Email or password is incorrect, please double check the email and password for your account.";
      } else {
        errorMsg = "Something went wrong, please try again.";
      }
      return { success: false, error: errorMsg };
    });
};

// Login with Google
export const loginWithGoogle = async () => {
  return await setPersistence(auth, browserLocalPersistence)
    .then(() => {
      return signInWithPopup(auth, new GoogleAuthProvider());
    })
    .then(async (res) => {
      const user = res.user;
      const token = await user.getIdToken();
      const isNewUser =
        res.user.metadata.creationTime === res.user.metadata.lastSignInTime;
      return { success: true, isNewUser };
    })
    .catch((error) => {
      console.error("Error during Google login:", error);
      const errorMsg = "Something went wrong, please try again.";
      return { success: false, error: errorMsg };
    });
};
