import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
import styles from "./shiftCardStyle.module.css";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ThreeDotModal from "@/app/components/ThreeDotModal";
import { Shift } from "@/server/db/models/shift";
import { formattedDateMDY } from "@/lib/dateHandler";

interface ShiftCardVolunteer {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
}

interface ShiftCardProps {
  shift: Shift;
  volunteers: ShiftCardVolunteer[];
  startDate: Date;
  endDate: Date;
  startTime: Date;
  endTime: Date;
  routeName: string;
  locationDescription: string;
  recurrenceDates: string[];
  shiftDate: string;
  confirmationForm: string;
  returnRoute: string;
  isRecurring: boolean;
  onOpenSidebar: () => void;
  onDeleteShift: (shift: Shift) => void;
  isSelected?: boolean;
}

export default function ShiftCard({
  shift,
  volunteers,
  startDate,
  endDate,
  startTime,
  endTime,
  routeName,
  locationDescription,
  recurrenceDates,
  shiftDate,
  confirmationForm,
  returnRoute,
  isRecurring,
  onOpenSidebar,
  onDeleteShift,
  isSelected = false,
}: ShiftCardProps) {
  const [volunteerDisplay, setVolunteerDisplay] = useState("");
  const [timeRange, setTimeRange] = useState("");
  const [recurrenceDateStr, setRecurrenceDateStr] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const ellipsisRef = useRef<HTMLButtonElement>(null);

  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);

  const router = useRouter();

  const handleEllipsisClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    setModalPosition({
      x: rect.left + rect.width / 2,
      y: rect.bottom - 10,
    });

    setModalOpen(true);
  };

  const handleDelete = () => {
    if (shift) {
      onDeleteShift(shift);
    }
  };

  useEffect(() => {
    if (!volunteers || volunteers.length === 0) {
      setVolunteerDisplay("No volunteers");
      return;
    }

    const names = volunteers.map((v) => `${v.firstName} ${v.lastName}`);

    if (names.length > 2) {
      setVolunteerDisplay(
        `${names.slice(0, 2).join(", ")} and ${names.length - 2} more…`,
      );
    } else {
      setVolunteerDisplay(names.join(", "));
    }
  }, [volunteers]);

  useEffect(() => {
    if (!startTime || !endTime) {
      setTimeRange("--");
    } else {
      const start = new Date(startTime).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      const end = new Date(endTime).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      setTimeRange(`${start} - ${end}`);
    }

    const formattedDates = recurrenceDates
      .map((dateStr) => dateStr.charAt(0).toUpperCase() + dateStr.slice(1))
      .join(", ");
    setRecurrenceDateStr(formattedDates);
  }, [startTime, endTime, recurrenceDates]);

  return (
    <div
      className={`${styles["shift-card"]} ${
        isSelected ? styles["shift-card-selected"] : ""
      }`}
      onClick={onOpenSidebar}
    >
      <div className={styles["shift-card-header"]}>
        <div className={styles["shift-card-header-content"]}>
          <div className={styles["shift-card-title-section"]}>
            <div className={styles["shift-card-route-info"]}>
              <span className={styles["shift-card-route-name"]}>
                {routeName}
              </span>
              <span className={styles["shift-card-separator"]}>-</span>
              <span className={styles["shift-card-location"]}>
                {locationDescription}
              </span>
            </div>
            {confirmationForm && (
              <div
                className={styles["shift-card-shift-form"]}
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(
                    `/AdminNavView/ViewConfirmationForm?${new URLSearchParams({
                      confirmationFormId: confirmationForm,
                      returnRoute: returnRoute,
                    })}`,
                  );
                }}
              >
                Shift Form
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 13 13"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6.5 2H2C1.60218 2 1.22064 2.15804 0.93934 2.43934C0.658035 2.72064 0.5 3.10218 0.5 3.5V11C0.5 11.3978 0.658035 11.7794 0.93934 12.0607C1.22064 12.342 1.60218 12.5 2 12.5H9.5C9.89782 12.5 10.2794 12.342 10.5607 12.0607C10.842 11.7794 11 11.3978 11 11V6.5M5.75 7.25L12.5 0.5M12.5 0.5H8.75M12.5 0.5V4.25"
                    stroke="#084C29"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </div>

          <div className={styles["shift-card-recurrence"]}>
            <span className={styles["shift-card-recurrence-text"]}>
              {recurrenceDateStr}
            </span>
          </div>
        </div>

        <ThreeDotModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onDelete={handleDelete}
          position={modalPosition}
        />
        <button
          ref={ellipsisRef}
          onClick={(e) => handleEllipsisClick(e)}
          className="flex-shrink mt-1 min-w-0 hover:bg-gray-100 rounded p-1"
          title="More options"
          aria-label="More options"
        >
          <FontAwesomeIcon
            icon={faEllipsis}
            className="flex-shrink mt-1 min-w-0"
          />
        </button>
      </div>

      <div className={styles["shift-card-details"]}>
        <div className={styles["shift-card-details-header"]}>
          <span className={styles["shift-card-label"]}>Volunteer(s)</span>
          <span className={styles["shift-card-label"]}>Time</span>
          <span className={styles["shift-card-label"]}>Period</span>
          <span className={styles["shift-card-label"]}>Shift Date</span>
        </div>

        <div className={styles["shift-card-details-content"]}>
          <span className={styles["shift-card-volunteers"]}>
            {volunteerDisplay}
          </span>
          <span className={styles["shift-card-time"]}>{timeRange}</span>
          <span className={styles["shift-card-period"]}>
            {formattedDateMDY(startDateObj)} -{" "}
            {isRecurring ? "Recurring" : formattedDateMDY(endDateObj)}
          </span>
          <span className={styles["shift-card-next-shift"]}>{shiftDate}</span>
        </div>
      </div>
    </div>
  );
}
