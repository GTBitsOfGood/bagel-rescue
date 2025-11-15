import { errorToast, successToast } from "@/lib/toastConfig";
import { submitCompletionForm } from "@/server/db/actions/shiftCompletion";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

interface ShiftCompletionFormProps {
  shiftId: string;
}

interface ShiftFormValues {
  routeCompleted: string;
  delivered: number;
  pickedUp: number;
  minutes: number;
}

const ShiftCompletionForm: React.FC<ShiftCompletionFormProps> = ({
  shiftId,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShiftFormValues>();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onError = (errors: any) => {
    if (errors.delivered?.type === "min") {
      errorToast("Bagels delivered cannot be negative.");
      return;
    }
    if (errors.pickedUp?.type === "min") {
      errorToast("Bagels Picked up cannot be negative.");
      return;
    }
    if (errors.minutes?.type === "min") {
      errorToast("Time (minutes) cannot be negative.");
      return;
    }
    errorToast("Please fill out all fields.");
  };
  const onSubmit = (data: ShiftFormValues) => {
    setLoading(true);
    if (data.routeCompleted === "no") {
      successToast("Thank you for submitting your form!");
      router.push("/");
      return;
    }
    try {
      //The user id is hardcoded here! The user id is the second argument in the submitCompletionForm function
      //TODO: Change the string to the actual user id
      submitCompletionForm(data, "67aad35636f0c97be6441abe", shiftId);
      successToast("Thank you for submitting your form!");
      router.push("/");
    } catch (error) {
      setLoading(false);
      errorToast(
        "An error occurred while submitting your form. Please try again."
      );
    }
  };

  return (
    <div className="flex flex-col justify-center content-center items-center w-full h-full bg-white px-9 pt-16 pb-[13.88rem] rounded-lg">
      <div className="max-w-[39.5rem] w-full min-w-0">
        <div className="flex flex-col text-center content-center justify-center space-y-2 ">
          <span className="font-normal text-5xl">🥯</span>
          <h1 className="text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] text-2xl font-bold">
            Thank you for completing your route!
          </h1>
          <h2 className="text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] text-2xl">
            Just a couple of questions
          </h2>
        </div>
        <hr className="my-12 stroke-1 stroke-[var(--Bagel-Rescue-Light-Grey,#D3D8DE)]" />
        <form
          id="ShiftCompletionForm"
          onSubmit={handleSubmit(onSubmit, onError)}
          className="flex flex-col space-y-[4.38rem]"
        >
          <div className="flex flex-col space-y-4">
            <span className="text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] text-base font-bold">
              Did you complete your route in full?
            </span>
            <label>
              <input
                {...register("routeCompleted", { required: true })}
                className="align-middle w-6 h-6 border-2 border-[var(--Bagel-Rescue-Light-Grey,#D3D8DE)] text-blue-600 focus:ring-blue-500 appearance-none rounded-full checked:bg-blue-600 checked:border-blue-600"
                type="radio"
                value="yes"
              />
              <span className="pl-4 text-[var(--Bagel-Rescue-Dark-Blue,#072B68)]">
                Yes
              </span>
            </label>
            <label>
              <input
                {...register("routeCompleted", { required: true })}
                className="align-middle w-6 h-6 border-2 border-[var(--Bagel-Rescue-Light-Grey,#D3D8DE)] text-blue-600 focus:ring-blue-500 appearance-none rounded-full checked:bg-blue-600 checked:border-blue-600"
                type="radio"
                value="no"
              />
              <span className="pl-4 text-[var(--Bagel-Rescue-Dark-Blue,#072B68)]">
                No
              </span>
            </label>
            {errors.routeCompleted && (
              <p className="text-red-500">Please select one option.</p>
            )}
          </div>
          <label className="text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] text-base font-bold">
            Approximately how many bagels did you deliver?
          </label>
          <input
            {...register("delivered", {
              valueAsNumber: true,
              required: true,
              min: { value: 0, message: "Cant be negative" },
            })}
            className="h-[3.125rem] self-stretch border border-[var(--Bagel-Rescue-Light-Grey,#D3D8DE)] rounded-lg px-3"
            type="number"
          />
          <label className="text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] text-base font-bold">
            Approximately how many bagels did you pickup?
          </label>
          <input
            {...register("pickedUp", {
              valueAsNumber: true,
              required: true,
              min: { value: 0, message: "Cant be negative" },
            })}
            className="h-[3.125rem] self-stretch border border-[var(--Bagel-Rescue-Light-Grey,#D3D8DE)] rounded-lg px-3"
            type="number"
          />
          <div className="flex justify-between content-center items-center">
            <label className="text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] text-base font-bold">
              How much time did your route take?
            </label>
            <div className="flex h-[3.125rem] pr-[.63rem] w-[18.1875rem] min-w-0 border border-[var(--Bagel-Rescue-Light-Grey,#D3D8DE)] rounded-lg items-center">
              <input
                {...register("minutes", {
                  valueAsNumber: true,
                  required: true,
                  min: { value: 0, message: "Cant be negative" },
                })}
                className="h-full w-5/6 rounded-lg outline-none pl-2 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                type="number"
              />
              <span className="opacity-50 font-bold text-[var(--Bagel-Rescue-Dark-Blue,#072B68)]">
                Minutes
              </span>
            </div>
          </div>
        </form>
        <div className="py-[4.44rem] flex justify-center content-center items-center">
          {!loading ? (
            <button
              type="submit"
              form="ShiftCompletionForm"
              className="w-[13.125rem] h-[3.125rem] bg-[var(--Bagel-Rescue-Primary-Blue,#0F7AFF)] text-white rounded-xl font-bold"
            >
              Submit
            </button>
          ) : (
            <div className="content-center spinner animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          )}
        </div>
        <p className="opacity-50 text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-inter text-base font-normal text-center">
          If you ran into any issues on your route, please contact <br />
          <a
            href="mailto:BagelRescueTeam@gmail.com"
            className="underline decoration-solid decoration-auto underline-offset-4"
          >
            BagelRescueTeam@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default ShiftCompletionForm;
