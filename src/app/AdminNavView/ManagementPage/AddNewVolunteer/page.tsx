"use client";
import AdminSidebar from "@/components/AdminSidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import React, { useRef, useState, useEffect } from "react";
import Select from "react-select";
import locations from "@/lib/locations";
import { createUser } from "@/server/db/actions/User";
import { IUser } from "@/server/db/models/User";

export default function AddNewVolunteer() {
    const router = useRouter();
    const formRef = useRef<HTMLFormElement | null>(null);
    const [isComplete, setIsComplete] = useState<boolean>(false);
    const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

    const options = locations.map((location) => {
        return {
            value: `${location}`,
            label: `${location}`
        }
    });

    useEffect(() => {
        setIsComplete(formRef.current?.checkValidity() ?? false);
    }, []);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        try {
            e.preventDefault();

            const formData = new FormData(e.currentTarget);

            const nameParts = (formData.get("name") as string).trim().split(" ");
            if (nameParts.length < 2) {
                throw new Error("Please enter both first and last name");
            }
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(" ");
                lastName: nameParts[1],
                email: formData.get("email") as string,
                phoneNumber: formData.get("phoneNumber") as string,
                locations: locations,
                prefersNormalRoutes: formData.get("prefersNormalRoutes") ? true : false,
                prefersSubOnly: formData.get("prefersSubOnly") ? true : false,
                openToAny: formData.get("openToAny") ? true : false,
            } 

            await createUser(newUser);

            router.push("/AdminNavView/ManagementPage");
        } catch (e) {
            console.error(e);
        }
    }

    function handleInputChange(e: React.FormEvent<HTMLFormElement>) {
        setIsComplete(e.currentTarget.checkValidity());
    }

    return (
    <div className="flex">
      <AdminSidebar />
      <div className='flex flex-col flex-1 gap-6 mx-8'>
        <div onClick={() => router.push('/AdminNavView/ManagementPage')} className='flex mt-8 items-center gap-2 hover:cursor-pointer text-[#57A0D5]'>
            <FontAwesomeIcon icon={faChevronLeft} className="size-4" />
            <span>Back</span>
        </div>
        <div className='flex justify-between items-center'>
            <h1 className="font-bold text-4xl text-[#072B68]">Add a Volunteer</h1>
            <button onClick={() => formRef.current?.requestSubmit()} className={`font-bold text-white ${isComplete ? 'bg-[#0F7AFF] hover:opacity-75 active:opacity-100' : 'bg-[#A3A3A3] cursor-not-allowed'} p-4 rounded-xl`}>Complete Profile</button>
        </div>
        <hr className="border-[#CCE3FF]" />
        <form ref={formRef} onSubmit={handleSubmit} onInput={handleInputChange} className='flex gap-6'>
            <div className='flex flex-col gap-6 grow max-w-[45%]'>
                <div className='flex flex-col gap-2'>
                    <label htmlFor="name" className="text-lg font-bold text-[#072B68]">Volunteer Name <span className="text-[#E60000]">*</span></label>
                    <input type="text" required id="name" name="name" className="p-4 border-solid border-2 border-[#0F7AFF] rounded-lg text-[#072B68]" placeholder="Enter a Volunteer here"></input>
                </div>
                <div className='flex flex-col gap-2'>
                    <label htmlFor="locations" className="text-lg font-bold text-[#072B68]">Location Preferences</label>
                    <Select isMulti styles={{
                        control: (baseStyles) => ({
                            ...baseStyles,
                            padding: "1rem",
                            border: "solid 2px #0F7AFF",
                            borderRadius: "0.5rem",
                            color: "#072B68",
                            display: "flex",
                            alignItems: "center",
                            height: "60px"
                        }),
                        indicatorSeparator: (baseStyles) => ({
                            ...baseStyles,
                            display: "none"
                        }),
                        dropdownIndicator: (baseStyles) => ({
                            ...baseStyles,
                            display: "none"
                        })
                    }}
                    options={options}
                    placeholder="Enter a location here"
                    onChange={(value) => {
                        const vals = (value ?? []).map((v) => v.value);
                        setSelectedLocations(vals);
                    }}
                    />
                    <input type="hidden" name="locations" id="locations" value={selectedLocations.join(',')} />
                </div>
                <div className='flex flex-col gap-2'>
                    <label htmlFor="name" className="text-lg font-bold text-[#072B68]">Volunteering Preferences</label>
                    <div className='flex gap-4 align-center mx-2'>
                        <div className='flex gap-2 align-center'>
                            <input type="checkbox" name="prefersNormalRoutes" id="preferNormalRoutes" className="size-6" />
                            <label htmlFor="preferNormalRoutes">Normal Routes</label>
                        </div>
                        <div className='flex gap-2 align-center'>
                        <div className='flex gap-2 align-center'>
                            <input type="checkbox" name="prefersSubOnly" id="prefersSubOnly" className="size-6" />
                            <label htmlFor="prefersSubOnly">Sub Only</label>
                        </div>
                        <div className='flex gap-2 align-center'>
                            <input type="checkbox" name="openToAny" id="openToAny" className="size-6" />
                            <label htmlFor="openToAny">Open to Any</label>
                        </div>
                        </div>
                    </div>
                </div>
                <div className='flex flex-col gap-2'>
                    <label htmlFor="additionalInfo" className="text-lg font-bold text-[#072B68]">Additional Information</label>
                    <textarea id="additionalInfo" name="additionalInfo" className="p-4 border-solid border-2 border-[#0F7AFF] rounded-lg text-[#072B68]" placeholder="Enter additional information here"></textarea>
                </div>
            </div>
            <div className='flex flex-col gap-6 grow max-w-[45%]'>
                <div className='flex flex-col gap-2'>
                    <label htmlFor="email" className="text-lg font-bold text-[#072B68]">Volunteer Email <span className="text-[#E60000]">*</span></label>
                    <input type="email" required id="email" name="email" className="p-4 border-solid border-2 border-[#0F7AFF] rounded-lg text-[#072B68]" placeholder="Enter an email address here"></input>
                </div>
                <div className='flex flex-col gap-2'>
                    <label htmlFor="phoneNumber" className="text-lg font-bold text-[#072B68]">Volunteer Phone Number</label>
                    <input type="tel" id="phoneNumber" name="phoneNumber" className="p-4 border-solid border-2 border-[#0F7AFF] rounded-lg text-[#072B68]" placeholder="Enter a phone number here"></input>
                </div>
            </div>
        </form>
      </div>
    </div>
  );
}