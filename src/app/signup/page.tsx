"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { signupWithCredentials } from "@/server/db/actions/Signup";

import HalfScreen from "./HalfScreen";
import Button from "./Button";
import TextInput from "./TextInput";
import { validateSignUpToken } from "@/server/db/actions/email";
//import Banner from "@components/molecules/Banner";

export default function SignupScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { register, formState, trigger, getValues, watch, setValue} = useForm<{
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    repeatPassword: string;
  }>();
  const [email, setEmail] = useState<string>("");
  const [errorBannerMsg, setErrorBannerMsg] = useState("");

  useEffect(() => {
    const validateToken = async () => {
      try {
        const email = await validateSignUpToken(token as string);
        setEmail(email);
        setValue("email", email)
      } catch (error) {
        setErrorBannerMsg("Invalid or expired sign up link.");
        alert("Invalid or expired sign up link.");
        router.push("/");
      }
      
    }

    if (token) {
      validateToken();
    }

  }, []);

  return (
    <div className="flex absolute bg-white">
      <div className="h-screen w-screen">
        <div className="flex flex-col w-full h-full sm:flex-row">
          <HalfScreen />
          
          <div className="flex flex-col w-full h-full justify-center items-center mt-8 sm:mt-0 sm:w-1/2">
            <div className={`flex flex-col w-[90%] sm:w-[60%] sm:items-center`}>
              {/* {errorBannerMsg && (
                <div className="hidden sm:inline">
                  <Banner text={errorBannerMsg} />
                </div>
              )} */}
              <p
                className={`text-primary-text text-2xl font-bold font-opensans mb-10 sm:order-1`}
              >
                Volunteer Sign Up
              </p>
              {/* {errorBannerMsg && (
                <div className="inline -mt-8 sm:hidden sm:mt-0">
                  <Banner text={errorBannerMsg} />
                </div>
              )} */}
              <div className="flex flex-col w-full sm:order-2">
                <div className="sm:mb-6">
                  <TextInput
                    label="Username"
                    formValue={register("username", {
                      validate: (v) =>
                        !v ? "Username cannot be empty." : undefined,
                    })}
                    error={formState.errors.username?.message}
                  />
                </div>
                <div className="sm:mb-6">
                  <TextInput
                    label="First Name"
                    formValue={register("firstName", {
                      validate: (v) =>
                        !v ? "First Name cannot be empty." : undefined,
                    })}
                    error={formState.errors.firstName?.message}
                  />
                </div>
                <div className="sm:mb-6">
                  <TextInput
                    label="Last Name"
                    formValue={register("lastName", {
                      validate: (v) =>
                        !v ? "Last Name cannot be empty." : undefined,
                    })}
                    error={formState.errors.lastName?.message}
                  />
                </div>
                <div className="sm:mb-6">
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
                </div>
                <div className="sm:mb-6">
                  <TextInput
                    label="Password"
                    inputType="password"
                    formValue={register("password", {
                      validate: (v) =>
                        !v ? "Password cannot be empty." : undefined,
                    })}
                    error={formState.errors.password?.message}
                  />
                </div>
                <TextInput
                  label="Repeat Password"
                  inputType="password"
                  formValue={register("repeatPassword", {
                    validate: (value) => {
                      const password = watch('password');
                      return value === password || "Passwords do not match.";
                    },
                  })}
                  error={formState.errors.repeatPassword?.message}
                />
                
                <div className="mb-5 sm:mb-7">
                  <Button
                    text="Sign Up"
                    onClick={async () => {
                      setErrorBannerMsg("");
                      const isValid = await trigger(undefined, {
                        shouldFocus: true,
                      });
                      if (!isValid) return;

                      const { username, firstName, lastName, email, password } = getValues();
                      try {
                        const res = await signupWithCredentials(username, firstName, lastName, email, password);

                        if (res.success) {
                          // Push to a generic route, let middleware handle role-based redirection
                          router.push("/AdminNavView/WeeklyShiftDashboard");
                        } else {
                          setErrorBannerMsg("error" in res ? res.error : "");
                        }
                      } catch (err) {
                        console.error(err);
                        setErrorBannerMsg(
                          "An unknown error ocurred signing up. Check your internet connection."
                        );
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
