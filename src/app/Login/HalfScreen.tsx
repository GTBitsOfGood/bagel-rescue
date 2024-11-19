import BackButton from "./BackButton";

interface Props {
  caregiver?: boolean;
  backButtonFunction?: (value: any) => void;
  hiddenOnMobile?: boolean;
}

export default function HalfScreen({
  caregiver = false,
  backButtonFunction = undefined,
  hiddenOnMobile = false,
}: Props) {
  return (
    <div
      style={{ background: '#D6E9FF' }}
      className={`${hiddenOnMobile ? "hidden sm:flex" : "flex"} flex-col w-full h-[20%] justify-center items-center sm:w-1/2 sm:h-full`}
    >
      {backButtonFunction && (
        <div className="flex sm:hidden flex-start w-[90%] mt-2 -mb-5">
          <BackButton darkerColor={true} onClick={backButtonFunction} />
        </div>
      )}
      <div className="flex flex-col w-full justify-center items-center shrink-0 text-black text-center font-opensans tracking-wide">
        <p className="hidden sm:flex font-bold uppercase text-3xl sm:text-4xl">
          Bagel <br /> Rescue
        </p>
      </div>
    </div>
  );
}
