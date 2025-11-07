"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./page.module.css";
import { getShift } from "@/server/db/actions/shift";
import { Shift } from "@/server/db/models/shift";
import Sidebar from "@/components/Sidebar";
import { postConfirmationForm } from "@/server/db/actions/confirmationForm";
import { dateToString } from "@/lib/dateHandler";

interface FormData {
    completed: boolean;
    bagelsPickedUp: string;
    bagelsDelivered: string;
    hours: string;
    minutes: string;
    comments: string;
}

export default function PostShiftForm() {
    const searchParams = useSearchParams();
    const shiftId = searchParams.get("userShiftId");
    const date = searchParams.get("date");
    const router = useRouter();
    const [shift, setShift] = useState<Shift | null>(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState<FormData>({
        completed: true,
        bagelsPickedUp: "",
        bagelsDelivered: "",
        hours: "",
        minutes: "",
        comments: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "radio" ? value === "Yes" : value,
        }));
    };

    useEffect(() => {
        if (!shiftId) return;
        const fetchShift = async () => {
            const fetchedShift = await getShift(shiftId);
            if (fetchedShift) {
                setShift(fetchedShift);
            }
            setLoading(false);
        };
        fetchShift();
    }, [shiftId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const {
            completed,
            bagelsPickedUp,
            bagelsDelivered,
            hours,
            minutes,
            comments,
        } = formData;
        const bagelsPickedUpInt = parseInt(bagelsPickedUp, 10);
        const bagelsDeliveredInt = parseInt(bagelsDelivered, 10);
        const hoursInt = parseInt(hours, 10);
        const minutesInt = parseInt(minutes, 10);

        if (!completed) {
            alert("Please select if you completed your route.");
            return;
        }
        if (bagelsPickedUp === "" || bagelsPickedUpInt < 0) {
            alert(
                "Please enter a valid number of bagels picked up (0 or more)."
            );
            return;
        }
        if (bagelsDelivered === "" || bagelsDeliveredInt < 0) {
            alert(
                "Please enter a valid number of bagels delivered (0 or more)."
            );
            return;
        }
        if (hours === "" || hoursInt < 0) {
            alert("Please enter valid hours (0 or more).");
            return;
        }
        if (minutes === "" || minutesInt < 0) {
            alert("Please enter valid minutes (0 or more).");
            return;
        }

        if (date) {
            await postConfirmationForm(date, shiftId!, {
                completed: completed,
                numPickedUp: bagelsPickedUpInt,
                numDelivered: bagelsDeliveredInt,
                time: hoursInt * 60 + minutesInt,
                comments: comments,
            });
        }

        alert("Thank you for submitting!");
        router.push("/VolunteerNavView/Homepage");
    };

    const handleBackClick = () => {
        router.push("/VolunteerNavView/Homepage");
    };

    return (
        <Suspense>
            <div className={styles.container}>
                <Sidebar />
                <div className={styles.mainContent}>
                    {/* Header */}
                    <div className={styles.header}>
                        <button
                            onClick={handleBackClick}
                            className={styles.backButton}
                        >
                            <svg
                                width="11"
                                height="16"
                                viewBox="0 0 11 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M9.5 1.5L1.5 8L9.5 14.5"
                                    stroke="#072B68"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            Back
                        </button>
                        <h1 className={styles.pageTitle}>Post-Shift Form</h1>
                    </div>

                    {loading && <div>Loading...</div>}
                    {!loading && (
                        <div className={styles.formContainer}>
                            {/* Form Header */}
                            <div className={styles.formHeaderContainer}>
                                <div className={styles.formIcon}>🥯</div>
                                <h2 className={styles.formHeader}>
                                    Thank you for completing your route!
                                </h2>
                                <p className={styles.formSubHeader}>
                                    Just a couple of questions
                                </p>
                                <div className={styles.formDivider} />
                            </div>

                            {/* Form Body */}
                            <div className={styles.formBodyContainer}>
                                <form
                                    onSubmit={handleSubmit}
                                    className={styles.formBody}
                                >
                                    {/* Completion Question */}
                                    <div>
                                        <div className={styles.formQuestion}>
                                            * Did you complete your route in
                                            full?
                                        </div>
                                        <div className={styles.radioGroup}>
                                            <label
                                                className={styles.radioOption}
                                            >
                                                <input
                                                    type="radio"
                                                    name="completed"
                                                    value="Yes"
                                                    checked={
                                                        formData.completed ===
                                                        true
                                                    }
                                                    onChange={handleChange}
                                                    className={
                                                        formData.completed ===
                                                        true
                                                            ? styles.radioChecked
                                                            : styles.radioUnchecked
                                                    }
                                                />
                                                Yes
                                            </label>
                                            <label
                                                className={styles.radioOption}
                                            >
                                                <input
                                                    type="radio"
                                                    name="completed"
                                                    value="No"
                                                    checked={
                                                        formData.completed ===
                                                        false
                                                    }
                                                    onChange={handleChange}
                                                    className={
                                                        formData.completed ===
                                                        false
                                                            ? styles.radioChecked
                                                            : styles.radioUnchecked
                                                    }
                                                />
                                                No
                                            </label>
                                        </div>
                                    </div>

                                    {/* Bagels Picked Up */}
                                    <div>
                                        <div className={styles.formQuestion}>
                                            * Approximately how many bagels did
                                            you pick up?
                                        </div>
                                        <input
                                            className={styles.inputFull}
                                            type="number"
                                            name="bagelsPickedUp"
                                            value={formData.bagelsPickedUp}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    {/* Bagels Delivered */}
                                    <div>
                                        <div className={styles.formQuestion}>
                                            * Approximately how many bagels did
                                            you deliver?
                                        </div>
                                        <input
                                            className={styles.inputFull}
                                            type="number"
                                            name="bagelsDelivered"
                                            value={formData.bagelsDelivered}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    {/* Time Taken */}
                                    <div>
                                        <div className={styles.timeInputGroup}>
                                            <div
                                                className={styles.formQuestion}
                                            >
                                                * How much time did your route
                                                take?
                                            </div>
                                            <input
                                                className={styles.input}
                                                type="number"
                                                name="hours"
                                                value={formData.hours}
                                                onChange={handleChange}
                                            />
                                            <span>Hrs</span>
                                            <input
                                                className={styles.input}
                                                type="number"
                                                name="minutes"
                                                value={formData.minutes}
                                                onChange={handleChange}
                                            />
                                            <span>Mins</span>
                                        </div>
                                    </div>

                                    {/* Comments */}
                                    <div>
                                        <div className={styles.formQuestion}>
                                            Any additional comments?
                                        </div>
                                        <input
                                            className={styles.inputFull}
                                            type="text"
                                            name="comments"
                                            value={formData.comments}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <div className={styles.submitButtonContainer}>
                                      <button
                                          className={styles.submitButton}
                                          type="submit"
                                      >
                                          Submit
                                      </button>
                                    </div>
                                </form>
                            </div>

                            {/* Form Footer */}
                            <div className={styles.formFooter}>
                                <span>
                                    If you ran into any issues on your route,
                                    please contact
                                </span>
                                <span>BagelRescueTeam@gmail.com</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Suspense>
    );
}
