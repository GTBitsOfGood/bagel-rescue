import React from "react";

function ShiftCompletionForm () {
  return (
    <div className="flex flex-col justify-center content-center items-center w-full h-full bg-white px-9 pt-16 pb-[13.88rem] rounded-lg">
      <div className="w-[39.5rem]">
          <div className="flex flex-col text-center content-center justify-center space-y-2 ">
            <span className="font-normal text-5xl">🥯</span>
            <h1 className="text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] text-2xl font-bold">Thank you for completing your route!</h1>
            <h2 className="text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] text-2xl">Just a couple of questions</h2>
          </div>
          <hr className="my-12 stroke-1 stroke-[var(--Bagel-Rescue-Light-Grey,#D3D8DE)]"/>
          <form className="flex flex-col space-y-[4.38rem]">
            <div className="flex flex-col space-y-4">
              <span className="text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] text-base font-bold">Did you complete your route in full?</span>
            
                <label>
                  <input className="align-middle w-6 h-6 border-2 border-[var(--Bagel-Rescue-Light-Grey,#D3D8DE)] text-blue-600 focus:ring-blue-500 appearance-none rounded-full checked:bg-blue-600 checked:border-blue-600" type="radio" name="route-completed" value="yes" />
                  <span className="pl-4 text-[var(--Bagel-Rescue-Dark-Blue,#072B68)]">Yes</span>
                </label>
                <label>
                  <input className="align-middle w-6 h-6 border-2 border-[var(--Bagel-Rescue-Light-Grey,#D3D8DE)] text-blue-600 focus:ring-blue-500 appearance-none rounded-full checked:bg-blue-600 checked:border-blue-600" type="radio" name="route-completed" value="no" />
                  <span className="pl-4 text-[var(--Bagel-Rescue-Dark-Blue,#072B68)]">No</span>
                </label>
              
            </div>
            <label className="text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] text-base font-bold">Approximately how many bagels did you deliver?</label>
            <input className="h-[3.125rem] self-stretch border border-[var(--Bagel-Rescue-Light-Grey,#D3D8DE)] rounded-lg px-3" type="number"/>
            <label className="text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] text-base font-bold">Approximately how many bagels did you pickup?</label>
            <input className="h-[3.125rem] self-stretch border border-[var(--Bagel-Rescue-Light-Grey,#D3D8DE)] rounded-lg px-3" type="number"/>
            <div className="flex justify-between content-center items-center">
              <label className="text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] text-base font-bold ">How much time did you route take?</label>
              <div className="flex h-[3.125rem] pr-[.63rem] w-[18.1875rem] border border-[var(--Bagel-Rescue-Light-Grey,#D3D8DE)] rounded-lg items-center">
                <input className="h-full w-5/6 rounded-lg outline-none pl-2 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" type="number"></input>
                <span className="opacity-50 font-bold text-[var(--Bagel-Rescue-Dark-Blue,#072B68)]">Minutes</span>
              </div>
            </div>
          </form>
          <div className="py-[4.44rem] flex justify-center content-center items-center">
            <button className="w-[13.125rem] h-[3.125rem] bg-[var(--Bagel-Rescue-Primary-Blue,#0F7AFF)] text-white rounded-xl font-bold">Submit</button>
          </div>
          <p className="opacity-50 text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-inter text-base font-normal text-center">
            If you ran into any issues on your route, please contact <br/>
          <a href="mailto:BagelRescueTeam@gmail.com" className="underline decoration-solid decoration-auto underline-offset-4">BagelRescueTeam@gmail.com</a>
          </p>      
      </div>
    </div>
    
  );
};

export default ShiftCompletionForm;
