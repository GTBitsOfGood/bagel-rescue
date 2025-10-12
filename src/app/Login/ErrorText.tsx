interface Props {
    error?: string;
  }
  
  export default function ErrorText({ error }: Props) {
    return (
      <>
        {error ? (
          <div className="text-sm font-normal text-red-400 mt-2 mb-4">
            {error}
          </div>
        ) : (
          <div className="mt-[1.5625rem]"></div>
        )}
      </>
    );
  }
  