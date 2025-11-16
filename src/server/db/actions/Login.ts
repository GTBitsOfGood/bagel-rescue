import {
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithCustomToken,
} from "firebase/auth";
//import Cookies from "js-cookie"; // For setting cookies
import { auth } from "../firebase";
import { getUserByEmail, updateUser } from "./User";
// Login with Email and Password
export const loginWithCredentials = async (email: string, password: string) => {
    return await signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
            const user = userCredential.user;

            // Fetch the token and set it in the cookies
            const token = await user.getIdToken();

            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token }),
                credentials: "include",
            });

            const response = await res.json();

            if (!response.success) {
                if (res.status === 403) {
                    await auth.signOut();
                }
                throw new Error(response.error);
            }

            // Only check for email update if login was successful
            // Use getUserByEmail only for email update check (still needed for this specific use case)
            // This is safe as we're already authenticated via the login API
            try {
                const mongoUser = await getUserByEmail(email);

                if (
                    mongoUser &&
                    mongoUser._id &&
                    mongoUser.newEmail &&
                    auth.currentUser &&
                    auth.currentUser.email !== mongoUser.email
                ) {
                    await updateUser(mongoUser._id.toString(), {
                        email: mongoUser.newEmail,
                    });
                }
            } catch (error) {
                // If getUserByEmail fails, continue anyway as it's only for email update
                console.warn("Failed to check for email update:", error);
            }

            return response;
        })
        .catch((error) => {
            let errorMsg = "";
            console.error("Error during login:", error); // Debug log for errors
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
    return await signInWithPopup(auth, new GoogleAuthProvider())
        .then(async (res) => {
            const user = res.user;

            // Fetch the token and set it in the cookies
            const token = await user.getIdToken();

            // Check if the user is new
            const isNewUser =
                res.user.metadata.creationTime ===
                res.user.metadata.lastSignInTime;
            return { success: true, isNewUser };
        })
        .catch((error) => {
            console.error("Error during Google login:", error); // Debug log for errors
            const errorMsg = "Something went wrong, please try again.";
            return { success: false, error: errorMsg };
        });
};

export const activateUserAccount = async (authToken: string) => {
    let firebaseToken;
    try {
        const res = await fetch("/api/activate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ authToken: authToken }),
        });

        if (!res.ok) {
            const errorBody = await res.json().catch(() => ({}));
            console.error("Activation failed:", errorBody);
            throw new Error("Invalid activation token");
        }

        const data = await res.json();
        firebaseToken = data.firebaseToken;
        console.log(firebaseToken);
    } catch (err) {
        console.error(err);
        return { success: false, error: "Invalid activation token" };
    }

    return { success: true };
};

// Add this new function to check if a user is already logged in and get their admin status
export const checkAuthStatus = async () => {
    return new Promise((resolve) => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            unsubscribe(); // Unsubscribe immediately after first check

            if (user) {
                try {
                    // Use the safe API endpoint to check admin status
                    const res = await fetch("/api/user/is-admin", {
                        method: "GET",
                        credentials: "include",
                    });

                    if (res.ok) {
                        const data = await res.json();
                        resolve({
                            isLoggedIn: true,
                            isAdmin: data.isAdmin || false,
                        });
                    } else {
                        // User might not be fully authenticated on server
                        resolve({ isLoggedIn: false, isAdmin: false });
                    }
                } catch (error) {
                    console.error("Error checking auth status:", error);
                    resolve({ isLoggedIn: false, isAdmin: false });
                }
            } else {
                // User is not logged in
                resolve({ isLoggedIn: false, isAdmin: false });
            }
        });
    });
};
