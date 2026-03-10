import BackButton from '../components/BackButton';
import Image from 'next/image';
import bagelsPic from '../icon.png';

interface Props {
  caregiver?: boolean;
  hiddenOnMobile?: boolean;
}

export default function HalfScreen({
  caregiver = false,
  hiddenOnMobile = false,
}: Props) {
  return (
    <div
      style={{ background: '#D6E9FF' }}
      className={`${hiddenOnMobile ? "hidden sm:flex" : "flex"} flex-col w-full h-[20%] justify-center items-center sm:w-[70%] sm:h-full`}
    >

      <div className="flex flex-col w-full justify-center items-center shrink-0 text-black text-center font-opensans tracking-wide">
        <Image src={bagelsPic} alt="Bagels Logo" />
      </div>
    </div>
  );
}