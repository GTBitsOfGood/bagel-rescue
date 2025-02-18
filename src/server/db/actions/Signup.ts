'use server'
import { auth } from "../firebase";
import { createUserWithEmailAndPassword, deleteUser } from "firebase/auth";
import { createUser } from "./User";
import User, { IUser } from "../models/User";
import dbConnect from "../dbConnect";


export const signupWithCredentials = async (
  username: string,
  firstName: string,
  lastName: string,
  email: string, 
  phoneNumber: string,
  password: string
) => {
  await dbConnect();
    return await createUserWithEmailAndPassword(auth, email, password)
      .then(async () => {;
        const user: IUser = {
          username,
          firstName,
          lastName,
          email,
          phoneNumber,
        }
        
        const isUsernameUnique = await User.findOne({ username: username });
        if (isUsernameUnique) {
          throw new Error("Username is already taken");
        }

        const res = await createUser(user);
        if (!res) {
          throw new Error("Failed to create user in the database");
        }
        return { success: true };
      })
      .catch((error) => {
        let errorMsg = "";
        console.error("Error during signup:", error);
        if (error.code === "auth/email-already-in-use") {
          errorMsg = "This email is already in use.";
        } else if (error.code === "auth/invalid-email") {
          errorMsg = "The email address is invalid.";
        } else if (error.code === "auth/weak-password") {
          errorMsg = "The password is too weak.";
        } else if (error.message === "Failed to create user in the database") {
          errorMsg = "Failed to create user in the database";
        } else if (error.message === "Username is already taken") {
          errorMsg = "Username is already taken";
        } else {
          errorMsg = "Something went wrong, please try again.";
        }
         
        deleteUser(auth.currentUser!);
        return { success: false, error: errorMsg };
      });
};