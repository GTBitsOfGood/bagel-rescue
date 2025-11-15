"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState, Suspense } from "react";
import { useForm } from "react-hook-form";

import { signupWithCredentials } from "@/server/db/actions/Signup";

import HalfScreen from "./HalfScreen";
import Button from "./Button";
import TextInput from "./TextInput";
import {
  deleteSignUpToken,
  validateSignUpToken,
} from "@/server/db/actions/email";
import { errorToast } from "@/lib/toastConfig";

function SignupScreenWithParams() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  return <SignupScreen token={token} router={router} />;
}

function SignupScreen({
  token,
  router,
}: {
  token: string | null;
  router: any;
}) {
  const { register, formState, trigger, getValues, watch, setValue } = useForm<{
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password: string;
    repeatPassword: string;
  }>();

  const [email, setEmail] = useState<string>("");
  const [errorBannerMsg, setErrorBannerMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      try {
        if (!token) throw new Error("Invalid or missing token");

        const email = await validateSignUpToken(token);
        setEmail(email);
        setValue("email", email);
      } catch (error) {
        setErrorBannerMsg("Invalid or expired sign-up link.");
        errorToast("Invalid or expired sign-up link.");
        router.push("/");
      }
      setLoading(false);
    };

    validateToken();
  }, []);

  return (
    <div className="flex bg-white h-screen">
      <div className="h-screen w-screen">
        <div className="flex flex-col w-full h-full sm:flex-row">
          <HalfScreen />
          <div className="flex flex-col w-full h-full justify-center items-center mt-8 sm:mt-0 sm:w-1/2">
            <div className="flex flex-col w-[90%] sm:w-[60%] sm:items-center">
              <p className="text-primary-text text-2xl font-bold font-opensans mb-10 sm:order-1">
                Volunteer Sign Up
              </p>
              <div className="flex flex-col w-full sm:order-2">
                <TextInput
                  label="Username"
                  formValue={register("username", {
                    validate: (v) =>
                      !v ? "Username cannot be empty." : undefined,
                  })}
                  error={formState.errors.username?.message}
                />
                <TextInput
                  label="First Name"
                  formValue={register("firstName", {
                    validate: (v) =>
                      !v ? "First Name cannot be empty." : undefined,
                  })}
                  error={formState.errors.firstName?.message}
                />
                <TextInput
                  label="Last Name"
                  formValue={register("lastName", {
                    validate: (v) =>
                      !v ? "Last Name cannot be empty." : undefined,
                  })}
                  error={formState.errors.lastName?.message}
                />
                <TextInput
                  label="Email"
                  formValue={register("email", {
                    validate: (v) =>
                      !v ? "Email cannot be empty." : undefined,
                  })}
                  error={formState.errors.email?.message}
                  placeholder={email ? email : "loading..."}
                  currentValue={email}
                />
                <TextInput
                  label="Phone Number"
                  formValue={register("phoneNumber", {
                    validate: (v) =>
                      !v ? "Phone Number cannot be empty." : undefined,
                  })}
                  error={formState.errors.phoneNumber?.message}
                />
                <TextInput
                  label="Password"
                  inputType="password"
                  formValue={register("password", {
                    validate: (v) =>
                      !v ? "Password cannot be empty." : undefined,
                  })}
                  error={formState.errors.password?.message}
                />
                <TextInput
                  label="Repeat Password"
                  inputType="password"
                  formValue={register("repeatPassword", {
                    validate: (value) => {
                      const password = watch("password");
                      return value === password || "Passwords do not match.";
                    },
                  })}
                  error={formState.errors.repeatPassword?.message}
                />
                <div className="mb-5 sm:mb-7 flex justify-center">
                  {!loading ? (
                    <Button
                      text="Sign Up"
                      onClick={async () => {
                        setErrorBannerMsg("");
                        setLoading(true);
                        const isValid = await trigger(undefined, {
                          shouldFocus: true,
                        });
                        if (!isValid) {
                          setLoading(false);
                          return;
                        }

                        const {
                          username,
                          firstName,
                          phoneNumber,
                          lastName,
                          email,
                          password,
                        } = getValues();
                        try {
                          const res = await signupWithCredentials(
                            username,
                            firstName,
                            lastName,
                            email,
                            phoneNumber,
                            password
                          );
                          if (!res.success) {
                            errorToast("error" in res ? res.error : "");
                            setLoading(false);
                            return;
                          }

                          const deleteToken = await deleteSignUpToken(
                            token as string
                          );

                          if (deleteToken) {
                            router.push("/VolunteerNavView/Homepage");
                          }
                        } catch (err) {
                          console.error(err);
                          errorToast(
                            "An unknown error occurred signing up. Check your internet connection."
                          );
                        }
                      }}
                    />
                  ) : (
                    <div className="content-center spinner animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupScreenWithParams />
    </Suspense>
  );
}
