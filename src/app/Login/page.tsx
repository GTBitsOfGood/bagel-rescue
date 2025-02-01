"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

import { loginWithCredentials, loginWithGoogle } from "../../server/db/actions/Login";

import HalfScreen from "./HalfScreen";
import Button from "./Button";
import TextInput from "./TextInput";
//import Banner from "@components/molecules/Banner";

export default function LoginScreen() {
  const router = useRouter();
  const { register, formState, trigger, getValues } = useForm<{
    email: string;
    password: string;
  }>();
  const [errorBannerMsg, setErrorBannerMsg] = useState("");

  return (
    <div className="flex absolute bg-[#D6E9FF]">
      <div className="h-screen w-screen">
        <div className="flex flex-col w-full h-full sm:flex-row">
          <HalfScreen />
          <div className="flex flex-col w-full h-full justify-center items-center mt-8 sm:mt-0 sm:w-1/2 bg-white rounded-l-3xl">
            <div className={`flex flex-col w-[90%] sm:w-[60%] sm:items-center`}>
              {/* {errorBannerMsg && (
                <div className="hidden sm:inline">
                  <Banner text={errorBannerMsg} />
                </div>
              )} */}
              <div className="flex justify-start w-[100%]">
                <p className="text-left text-primary-text text-2xl font-bold font-opensans text-[#013779] text-4xl mb-2">
                  Sign in
                </p>
              </div>
              {/* {errorBannerMsg && (
                <div className="inline -mt-8 sm:hidden sm:mt-0">
                  <Banner text={errorBannerMsg} />
                </div>
              )} */}
              <div className="flex justify-start w-[100%] mb-7">
                <p className="text-gray-400">
                  Enter your email and password to sign in!
                </p>
              </div>
              <div className="flex flex-col w-full sm:order-2">
                <TextInput
                  label="Email"
                  placeholder="example@email.com"
                  formValue={register("email", {
                    validate: (v) =>
                      !v ? "Email cannot be empty." : undefined,
                  })}
                  error={formState.errors.email?.message}
                />
                <TextInput
                  label="Password"
                  inputType="password"
                  placeholder="Minimum 8 Characters"
                  formValue={register("password", {
                    validate: (v) =>
                      !v ? "Password cannot be empty." : undefined,
                  })}
                  error={formState.errors.password?.message}
                />
                <div className="flex justify-center mb-4">
                  <hr className="w-[45%] my-3 mr-5 border-t-2"/>
                    <span className="text-gray-400">or</span>
                  <hr className="w-[45%] my-3 ml-5 border-t-2"/>
                </div>
                <Button type="Google" text="Sign in with Google"></Button>
                <div className="flex justify-between mb-7 sm:mb-7">
                  <div className="flex justify-start">
                    <input className='rounded-none checked:bg-[#016ff3] mr-2' type="checkbox"/>
                    <p className="text-[#016ff3] font-opensans text-sm">Keep me logged in</p>
                  </div>
                  <button
                    className="w-auto text-center text-mbb-pink text-sm font-semibold font-opensans text-[#016ff3]" 
                    onClick={() => {
                      const email = getValues().email;

                      router.push(
                        email
                          ? `/forgotPassword?email=${encodeURIComponent(email)}`
                          : "/forgotPassword"
                      );
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="mb-3 sm:mb-1">
                  <Button
                    text="Continue"
                    onClick={async () => {
                      setErrorBannerMsg("");
                      const isValid = await trigger(undefined, {
                        shouldFocus: true,
                      });
                      if (!isValid) return;

                      const { email, password } = getValues();
                      try {
                        const res = await loginWithCredentials(email, password);

                        if (res.success) {
                          // Push to a generic route, let middleware handle role-based redirection
                          router.push("/AdminNavView/WeeklyShiftDashboard");
                        } else {
                          setErrorBannerMsg("error" in res ? res.error : "");
                        }
                      } catch (err) {
                        console.error(err);
                        setErrorBannerMsg(
                          "An unknown error ocurred logging in. Check your internet connection."
                        );
                      }
                    }}
                  />
                </div>
                <div className="mb-1 flex justify-center items-center">
                </div>
                <div className="flex flex-row justify-center mb-8 sm:mb-1">
                  <div className="text-[#063c7c] text-base font-normal font-opensans leading-tight tracking-tight mr-2">
                    Don&apos;t have an account?&nbsp;
                    <button
                      className="text-mbb-pink text-base font-semibold text-[#016ff3] hover:underline"
                      onClick={() => router.push("/signup")}
                    >
                      Sign Up Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
