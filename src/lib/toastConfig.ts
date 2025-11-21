import toast, { ToastOptions } from "react-hot-toast";

const errorToastOptions: ToastOptions = {
  position: "top-center",
  style: {
    color: "red",
  },
};
const successToastOptions: ToastOptions = {
  position: "top-center",
  style: {
    color: "green",
  },
};

export const errorToast = (errorMsg: string) =>
  toast.error(errorMsg, errorToastOptions);
export const successToast = (successMsg: string) =>
  toast.success(successMsg, successToastOptions);
