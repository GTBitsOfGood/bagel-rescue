"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "../Homepage/page.module.css"
import { getShift } from "@/server/db/actions/shift";
import { Shift } from "@/server/db/models/shift";
import Sidebar from "@/components/Sidebar";
import { postConfirmationForm } from "@/server/db/actions/confirmationForm";

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
  const date = searchParams.get("date")
  const router = useRouter();
  const [shift, setShift] = useState<Shift|null>(null);
  const [formData, setFormData] = useState<FormData>({
    completed: true,
    bagelsPickedUp: "",
    bagelsDelivered: "",
    hours: "",
    minutes: "",
    comments: "",
  });

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name as keyof FormData]: type === "checkbox" || type === "radio" ? (checked ? value : prev[name as keyof FormData]) : value,
    }));
  };


  useEffect(() => {
    if (!shiftId) return;
    const fetchShift = async () => {
      const fetchedShift = await getShift(shiftId);
      if (fetchedShift) {
        setShift(fetchedShift);
      }
    };
    fetchShift();
  }, [shiftId]);

  const handleSubmit = async (e:any) => {
    e.preventDefault();
    const { completed, bagelsPickedUp, bagelsDelivered, hours, minutes, comments } = formData;
    const bagelsPickedUpInt = parseInt(formData.bagelsPickedUp, 10);
    const bagelsDeliveredInt = parseInt(formData.bagelsDelivered, 10);
    const hoursInt = parseInt(formData.hours, 10);
    const minutesInt = parseInt(formData.minutes, 10);

    if (!completed) {
      alert("Please select if you completed your route.");
      return;
    }
    if (bagelsPickedUp === "" || bagelsPickedUpInt < 0) {
      alert("Please enter a valid number of bagels picked up (0 or more).");
      return;
    }
    if (bagelsDelivered === "" || bagelsDeliveredInt < 0) {
      alert("Please enter a valid number of bagels delivered (0 or more).");
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
        time: (hoursInt * 60 + minutesInt),
        comments: comments
      });
    }
    
    
    alert("Thank you for submitting!");
    router.push("/VolunteerNavView/Homepage")
  };

  return (
    <Suspense>
      <div className={styles.container}>
        <Sidebar />
        <div className={styles.mainContent}>
          <div className={styles.header}>
            <button onClick={() => router.push("/VolunteerNavView/Homepage")}>&lt;Back</button>
            <h1 className={styles.pageTitle}>My Shifts</h1>
          </div>
          <div className={styles.formContainer}>
            <div className={styles.formHeader}>Thank you for completing your route!</div>
            <div className={styles.formQuestion}>Just a couple of questions</div>
            <form onSubmit={handleSubmit}>
              <div className={styles.formBody}>
                <div>* Did you complete your route in full?</div>
                <div>
                  <div>
                    <input
                      type="radio"
                      name="completed"
                      value="Yes"
                      checked={formData.completed === true}
                      onChange={handleChange}
                    />{" "}
                    Yes
                  </div>
                  <div>
                    <input
                      type="radio"
                      name="completed"
                      value="No"
                      checked={formData.completed === false}
                      onChange={handleChange}
                    />{" "}
                    No
                  </div>
                </div>

                <div>* Approximately how many bagels did you pick up?</div>
                <div>
                  <input
                    className={styles.inputOutline}
                    type="number"
                    name="bagelsPickedUp"
                    value={formData.bagelsPickedUp}
                    onChange={handleChange}
                  />
                </div>

                <div>* Approximately how many bagels did you deliver?</div>
                <div>
                  <input
                    className={styles.inputOutline}
                    type="number"
                    name="bagelsDelivered"
                    value={formData.bagelsDelivered}
                    onChange={handleChange}
                  />
                </div>

                <div>* How much time did your route take?</div>
                <div>
                  <input
                    className={styles.inputOutline}
                    type="number"
                    name="hours"
                    value={formData.hours}
                    onChange={handleChange}
                  />{" "}
                  <span style={{ marginRight: "8px", marginLeft: "8px" }}>Hrs</span>
                  <input
                    className={styles.inputOutline}
                    type="number"
                    name="minutes"
                    value={formData.minutes}
                    onChange={handleChange}
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
                    onChange={handleChange}
                  />
                </div>
              </div>

              <button className={styles.submitButton} type="submit">
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </Suspense>
  );
}