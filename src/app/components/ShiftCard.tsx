import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { Shift } from "@/server/db/models/shift";
import { IRoute } from "@/server/db/models/Route";
import "./shiftCardStyle.css"
import { useEffect, useState } from "react";

interface ShiftCardProps {
  route: IRoute;
  shifts: Shift[]
  volunteersPerShift: Map<string, string>;
  onOpenSidebar: (route: IRoute, shifts: Shift[], volunteersPerShift: Map<string, string>) => void;
}
interface ShiftCardVolunteer {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
}

interface ShiftCardProps2 {
  volunteers: ShiftCardVolunteer[];
  startDate: Date;
  endDate: Date;
  startTime: Date;
  endTime: Date;
  routeName: string;
  locationDescription: string;
  recurrenceDates: string[]
}


export default function ShiftCard({ volunteers, startDate, endDate, startTime, endTime, routeName, locationDescription, recurrenceDates }: ShiftCardProps2) {
  const [volunteerDisplay, setVolunteerDisplay] = useState("");
  const [timeRange, setTimeRange] = useState("");
  const [recurrenceDateStr, setRecurrenceDateStr] = useState("");

  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);
  console.log(startDateObj, endDateObj);
  useEffect(() => {
      if (!volunteers || volunteers.length === 0) {
        setVolunteerDisplay("No volunteers");
        return;
      }

      const names = volunteers.map(v => `${v.firstName} ${v.lastName}`);

      let displayText = "";
      if (names.length > 2) {
        displayText = `${names.slice(0, 2).join(", ")} and ${names.length - 2} more…`;
      } else {
        displayText = names.join(", ");
      }

      setVolunteerDisplay(displayText);
    }, [volunteers]);

    useEffect(() => {
      if (!startTime || !endTime) {
        setTimeRange("--");
      } else {
        setTimeRange(
          `${new Date(startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })} - ${new Date(endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`
        );
      }

      let tempStr = "";
      recurrenceDates.map((dateStr, index) => {
        tempStr += dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
        if (index !== recurrenceDates.length - 1) {
          tempStr += ", ";
        }
      });
      setRecurrenceDateStr(tempStr);
    }, [startTime, endTime, recurrenceDates]);

  function getNextShiftDate(recurrenceDates?: string[]): string {
    if (!recurrenceDates || recurrenceDates.length === 0) {
      return "--";
    }

    const dayMap: Record<string, number> = {
      "su": 0, "mo": 1, "tu": 2, "we": 3, "th": 4, "fr": 5, "sa": 6,
    };

    const recurrenceDays = recurrenceDates
      .map(day => dayMap[day])
      .filter(dayNum => dayNum !== undefined); // filter out bad values

    const today = new Date();

    // Loop up to 7 days ahead to find the next valid day
    for (let i = 0; i < 7; i++) {
      const testDate = new Date(today);
      testDate.setDate(today.getDate() + i);
      if (recurrenceDays.includes(testDate.getDay())) {
        // Return a human-readable string (e.g. "Mon, Oct 21, 2025")
        return testDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }
    }

    return "--";
}
  

  return (
  <div className="shift-overview-entry">
  <div className="frame-289676">
    <div className="frame-2896762">
      <div className="frame-289948">
        <div className="frame-289947">
          <div className="frame-289687">
            <div className="route-name">{routeName}</div>
            <div className="div">-</div>
            <div className="areas">{locationDescription}</div>
          </div>
        </div>
      </div>
      <div className="frame-289688">
        <div className="days-of-repetion">{recurrenceDateStr}</div>
      </div>
    </div>
    <div>
       <button title="More options">
             <FontAwesomeIcon
              icon={faEllipsis}
               className="route-card-ellipsis-icon"
             />
        </button>
    </div>
  </div>
  <div className="frame-289680">
    <div className="frame-289677">
      <div className="volunteer-s">Volunteer(s)</div>
      <div className="time">Time</div>
      <div className="period">Period</div>
      <div className="next-shift">Next Shift</div>
    </div>
    <div className="frame-2896763">
      <div className="volunteer-1-volunteer-2">{volunteerDisplay}</div>
      <div className="xx-xx-xx-xx">{timeRange}</div>
      <div className="div2">{startDateObj.toLocaleDateString("en-US")} - {endDateObj.toLocaleDateString("en-US")}</div>
      <div className="_11-11-11">{getNextShiftDate(recurrenceDates)}</div>
    </div>
  </div>
</div>
  );
}








  //   <div classNameName="route-card"
  //     onClick={() => onOpenSidebar(route, shifts, volunteersPerShift)}>
  //     <div classNameName="route-card-header">
  //       <p classNameName="route-card-name">{route["routeName"]}</p>
  //       <div classNameName="route-card-header-right-section">
  //         <p classNameName="route-card-time">
  //           {getTimesHeader()} {getDaysHeader()}
  //         </p>
  //         <button title="More options">
  //           <FontAwesomeIcon
  //             icon={faEllipsis}
  //             classNameName="route-card-ellipsis-icon"
  //           />
  //         </button>
  //       </div>
  //     </div>
  //     <div classNameName="route-card-body">
  //       <div classNameName="route-card-section">
  //         <p classNameName="route-card-section-header">Volunteer</p>
  //         {getVolunteers().map((s, sInd) => (
  //           <p key={sInd} classNameName="route-card-section-body">
  //             {s}
  //           </p>
  //         ))}
  //       </div>
  //       <div classNameName="route-card-section">
  //         <p classNameName="route-card-section-header">Days</p>
  //         {getDays().map((s, sInd) => (
  //           <p key={sInd} classNameName="route-card-section-body">
  //             {s}
  //           </p>
  //         ))}
  //       </div>
  //       <div classNameName="route-card-section">
  //         <p classNameName="route-card-section-header">Area</p>
  //         {getAreas().map((s, sInd) => (
  //           <p key={sInd} classNameName="route-card-section-body">
  //             {s}
  //           </p>
  //         ))}
  //       </div>
  //       <div classNameName="route-card-section">
  //         <p classNameName="route-card-section-header">Next Shift</p>
  //         {getNextShifts().map((s, sInd) => (
  //           <p key={sInd} classNameName="route-card-section-body">
  //             {s}
  //           </p>
  //         ))}
  //       </div>
  //     </div>
  //   </div>
  // );