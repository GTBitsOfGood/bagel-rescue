"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "../ViewConfirmationForm/page.module.css"
import Sidebar from "@/components/Sidebar";
import { getConfirmationForm, postConfirmationForm } from "@/server/db/actions/confirmationForm";


export default function PostShiftForm() {
  const searchParams = useSearchParams();
  const confirmationFormId = searchParams.get("confirmationFormId")
  const returnRoute = searchParams.get("returnRoute");
  const router = useRouter();
  const [formData, setFormData] = useState({
    completed: true,
    bagelsPickedUp: "",
    bagelsDelivered: "",
    hours: "",
    minutes: "",
    comments: "",
  });

  useEffect(() => {
    if (!confirmationFormId) return;
    const fetchForm = async () => {
      const form = await getConfirmationForm(confirmationFormId);
      if (!form) {
        return;
      }
      const minutes = form.minutes % 60;
      const hours = Math.floor(form.minutes / 60)
      setFormData({
          completed: form.completed ?? true,
          bagelsPickedUp: form.bagelsPickedUp.toString() ?? "",
          bagelsDelivered: form.bagelsDelivered.toString() ?? "",
          hours: hours.toString() ?? "",
          minutes: minutes.toString() ?? "",
          comments: form.comments ?? "",
        });
    };
    fetchForm();
  }, [confirmationFormId]);


  return (
    <Suspense>
      <div className={styles.container}>
        <Sidebar />
        <div className={styles.mainContent}>
          <div className={styles.header}>
            <button onClick={() => router.push(returnRoute || "/AdminNavView/DailyShiftDashboard")}>&lt;Back</button>
            <h1 className={styles.pageTitle}>My Shifts</h1>
          </div>
          <div className={styles.formContainer}>
            <div className={styles.formHeader}>Completed Form</div>
            <form>
              <div className={styles.formBody}>
                <div>* Did you complete your route in full?</div>
                <div>
                  <div>
                    <input
                      disabled={true}
                      type="radio"
                      name="completed"
                      value="Yes"
                      checked={formData.completed === true}
                    />{" "}
                    Yes
                  </div>
                  <div>
                    <input
                      disabled={true}
                      type="radio"
                      name="completed"
                      value="No"
                      checked={formData.completed === false}
                    />{" "}
                    No
                  </div>
                </div>

                <div>* Approximately how many bagels did you pick up?</div>
                <div>
                  <input
                    disabled={true}
                    className={styles.inputOutline}
                    type="number"
                    name="bagelsPickedUp"
                    value={formData.bagelsPickedUp}
                  />
                </div>

                <div>* Approximately how many bagels did you deliver?</div>
                <div>
                  <input
                    disabled={true}
                    className={styles.inputOutline}
                    type="number"
                    name="bagelsDelivered"
                    value={formData.bagelsDelivered}
                  />
                </div>

                <div>* How much time did your route take?</div>
                <div>
                  <input
                    disabled={true}
                    className={styles.inputOutline}
                    type="number"
                    name="hours"
                    value={formData.hours}
                  />{" "}
                  <span style={{ marginRight: "8px", marginLeft: "8px" }}>Hrs</span>
                  <input
                    disabled={true}
                    className={styles.inputOutline}
                    type="number"
                    name="minutes"
                    value={formData.minutes}
                  />{" "}
                  <span style={{ marginRight: "8px", marginLeft: "8px" }}>Mins</span>
                </div>

                <div>Any additional comments?</div>
                <div>
                  <input
                    className={styles.inputOutline}
                    style={{ width: "400px" }}
                    type="text"
                    name="comments"
                    value={formData.comments}
                  />
                </div>
              </div>

            </form>
          </div>
        </div>
      </div>
    </Suspense>
  );
}