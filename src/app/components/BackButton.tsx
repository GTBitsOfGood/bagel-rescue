import { MouseEventHandler } from "react";

interface Props {
    onClick?: MouseEventHandler<HTMLButtonElement>;
    disabled?: boolean;
    darkerColor?: boolean;
}

export default function BackButton({ onClick, disabled, darkerColor }: Props) {
    return (
      <button
        className={`group flex items-center gap-[2px] text-base font-normal ${!darkerColor ? "text-[#57A0D5]" : "text-[#57A0D5] font-semibold"}`}
        onClick={onClick}
        disabled={disabled}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M15 18L9 12L15 6"
            className={`${!darkerColor ? "stroke-[#57A0D5]" : "stroke-[#57A0D5] group-hover:stroke-[#3d88c4]"} ${disabled ? "stroke-gray-300" : "group-hover:stroke-[#3d88c4]"}`}
            strokeWidth="3"
            strokeLinecap="square"
            strokeLinejoin="round"
          />
        </svg>
        <div
          className={`${disabled ? "text-gray-300" : "group-hover:text-[#3d88c4]"}`}
        >
          Back
        </div>
      </button>
    );
  }
  