import React, { ReactNode, useState } from "react";
import ErrorText from "./ErrorText";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";

interface Props {
  label?: ReactNode;
  disabled?: boolean;
  onChange?: (value: string) => void;
  formValue?: Record<string, any>;
  currentValue?: string;
  placeholder?: string;
  error?: string;
  inputType?: string;
  key?: string;
  required?: boolean;
}

export default function TextInput({
  label = "",
  disabled = false,
  onChange,
  formValue = {},
  currentValue = "",
  placeholder = "",
  error = "",
  inputType = "text",
  key = "",
  required = false,
}: Props) {
  const [value, setValue] = useState(currentValue);
  const [seePassword, setSeePassword] = useState(false);

  return (
    <div className="flex flex-col w-full">
      {label && (
        <label
          className="text-[#013779] text-base font-bold leading-normal mb-1"
          htmlFor={formValue ? formValue.name : undefined}
        >
          {label}
          {required && <span className="text-asterisks-red text-sm">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          key={key}
          type={label === "Password" && !seePassword ? "password" : "text"}
          {...formValue}
          className={`w-full py-3 px-4 bg-secondary-background items-center border rounded-lg text-sm ${disabled ? "!bg-light-gray" : "!bg-secondary-background"} ${error ? "border-red-400" : "border-light-gray"}`}
          onClick={(event) => {
            event.stopPropagation();
          }}
          onChange={(event) => {
            setValue(event.target.value);
            if (onChange) {
              onChange(event.target.value);
            }
          }}
          placeholder={placeholder}
          value={value}
        />
        {label === "Password" && (
          <button className="absolute translate-y-3 right-4"
            onClick={() => setSeePassword(!seePassword)} >
            {seePassword ? (
              <IoEyeOutline className="text-gray-400" size={20} />
            ) : (
              <IoEyeOffOutline className="text-gray-400" size={20} />
            )}
          </button>
        )}
      </div>
      <ErrorText error={error} />
    </div>
  );
}