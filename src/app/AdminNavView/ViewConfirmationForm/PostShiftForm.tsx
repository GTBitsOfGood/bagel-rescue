"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "../ViewConfirmationForm/page.module.css";
import {
    getConfirmationForm,
    postConfirmationForm,
} from "@/server/db/actions/confirmationForm";
import { dateToString, stringToDate } from "@/lib/dateHandler";
import AdminSidebar from "@/components/AdminSidebar";

export default function PostShiftForm() {
    const searchParams = useSearchParams();
    const confirmationFormId = searchParams.get("confirmationFormId");
    const returnRoute = searchParams.get("returnRoute");
    const router = useRouter();
    const [formData, setFormData] = useState({
        completed: true,
        bagelsPickedUp: "",
        bagelsDelivered: "",
        hours: "",
        minutes: "",
        comments: "",
        routeName: "",
        volunteerName: "",
        shiftDate: new Date(),
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!confirmationFormId) return;

        const fetchForm = async () => {
            const form = await getConfirmationForm(confirmationFormId);
            if (!form) {
                return;
            }
            const minutes = form.minutes % 60;
            const hours = Math.floor(form.minutes / 60);
            setFormData({
                completed: form.completed ?? true,
                bagelsPickedUp: form.bagelsPickedUp.toString() ?? "",
                bagelsDelivered: form.bagelsDelivered.toString() ?? "",
                hours: hours.toString() ?? "",
                minutes: minutes.toString() ?? "",
                comments: form.comments ?? "",
                routeName: form.routeName ?? "",
                volunteerName: form.volunteerName ?? "",
                shiftDate: stringToDate(form.shiftDate) ?? new Date(),
            });
            setLoading(false);
        };

        fetchForm();
    }, []);

    return (
        <Suspense>
            <div className={styles.container}>
                <AdminSidebar />
                <div className={styles.mainContent}>
                    <div className={styles.header}>
                        <button
                            onClick={() =>
                                router.push(
                                    returnRoute ||
                                        "/AdminNavView/DailyShiftDashboard"
                                )
                            }
                            className={styles.backButton}
                        >
                            <svg
                                width="5"
                                height="8"
                                viewBox="0 0 11 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M9.5 1.5L1.5 8L9.5 14.5"
                                    stroke="#072B68"
                                    stroke-width="3"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                />
                            </svg>
                            Back
                        </button>
                        <h1 className={styles.pageTitle}>Post-Shift Form</h1>
                    </div>
                    {loading && <div>Loading...</div>}
                    {!loading && (
                        <div className={styles.formContainer}>
                            <div className={styles.formHeaderContainer}>
                                <div className={styles.formIcon}>🥯</div>
                                <div className={styles.formHeader}>
                                    {formData.routeName}
                                </div>
                                <div className={styles.formSubHeader}>
                                    {formData.volunteerName} -{" "}
                                    {dateToString(formData.shiftDate)}
                                </div>
                                <div className={styles.formDivider} />
                            </div>

                            <div className={styles.formBodyContainer}>
                                <div className={styles.formBody}>
                                    <div>
                                        Did you complete your route in full?
                                    </div>
                                    <div>
                                        <div>
                                            <input
                                                disabled={true}
                                                type="radio"
                                                name="completed"
                                                value="Yes"
                                                checked={
                                                    formData.completed === true
                                                }
                                                className={
                                                    formData.completed === true
                                                        ? styles.radioChecked
                                                        : styles.radioUnchecked
                                                }
                                            />{" "}
                                            Yes
                                        </div>
                                        <div>
                                            <input
                                                disabled={true}
                                                type="radio"
                                                name="completed"
                                                value="No"
                                                checked={
                                                    formData.completed === false
                                                }
                                                className={
                                                    formData.completed === true
                                                        ? styles.radioChecked
                                                        : styles.radioUnchecked
                                                }
                                            />{" "}
                                            No
                                        </div>
                                    </div>

                                    <div>
                                        Approximately how many bagels did you
                                        pick up?
                                    </div>
                                    <div>
                                        <input
                                            disabled={true}
                                            className={styles.inputFull}
                                            type="number"
                                            value={formData.bagelsPickedUp}
                                        />
                                    </div>

                                    <div>
                                        Approximately how many bagels did you
                                        deliver?
                                    </div>
                                    <div>
                                        <input
                                            disabled={true}
                                            className={styles.inputFull}
                                            type="number"
                                            value={formData.bagelsDelivered}
                                        />
                                    </div>

                                    <div>
                                        <span
                                            style={{
                                                marginRight: "8px",
                                                marginLeft: "8px",
                                            }}
                                        >
                                            How much time did you take?
                                        </span>
                                        <input
                                            disabled={true}
                                            className={styles.input}
                                            type="number"
                                            value={formData.hours}
                                        />{" "}
                                        <span
                                            style={{
                                                marginRight: "8px",
                                                marginLeft: "8px",
                                            }}
                                        >
                                            Hrs
                                        </span>
                                        <input
                                            disabled={true}
                                            className={styles.input}
                                            type="number"
                                            value={formData.minutes}
                                        />{" "}
                                        <span
                                            style={{
                                                marginRight: "8px",
                                                marginLeft: "8px",
                                            }}
                                        >
                                            Mins
                                        </span>
                                    </div>

                                    <div>Any additional comments?</div>
                                    <div>
                                        <input
                                            disabled={true}
                                            className={styles.inputFull}
                                            type="text"
                                            value={formData.comments}
                                        />
                                    </div>
                                </div>
                            </div>
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
