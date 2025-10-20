import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { Shift } from "@/server/db/models/shift";
import { IRoute } from "@/server/db/models/Route";
import { WeeklyShiftSidebarInfo } from "../AdminNavView/WeeklyShiftDashboard/page";
import "./shiftCardStyle.css"
import { useEffect, useState } from "react";
import { start } from "repl";

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
  routeName: String;
  locationDescription: String;
  recurrenceDates: String[]
}


export default function ShiftCard({ volunteers, startDate, endDate, startTime, endTime, routeName, locationDescription, recurrenceDates }: ShiftCardProps2) {
  const [volunteerDisplay, setVolunteerDisplay] = useState("");
  const [timeRange, setTimeRange] = useState("");


  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);

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
        console.log(startTime, endTime);
        setTimeRange(
          `${new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        );
      }
    }, [startTime, endTime]);

  // const getTimesHeader = () => {
  //   const dates = getDatesHelper()
  //     .flat()
  //     .sort((a: Date, b: Date) => {
  //       return a.toTimeString().localeCompare(b.toTimeString());
  //     });
  //   if (dates.length == 0) return "";
  //   const minTime = dates.at(0);
  //   const maxTime = dates.at(dates.length - 1);
  //   const options: Intl.DateTimeFormatOptions = {
  //     hour: "numeric",
  //     minute: "2-digit",
  //     hour12: true,
  //   };
  //   return (
  //     minTime?.toLocaleTimeString("en-US", options) +
  //     " - " +
  //     maxTime?.toLocaleTimeString("en-US", options)
  //   );
  // };

  // const getShiftsForRoute = (
  //   shiftsPerRoute: Map<string, Shift[]>,
  //   r: IRoute
  // ): Shift[] => {
  //   const routeId = r["_id"].toString(); // make sure it's a string
  //   return shiftsPerRoute.get(routeId) ?? [];
  // };

  // const getDaysHeader = () => {
  //   return getDatesHelper()
  //     .flat()
  //     .sort((a: Date, b: Date) => a.getDay() - b.getDay())
  //     .map((d: Date) => {
  //       return d.toLocaleDateString("en-US", {
  //         weekday: "short",
  //       });
  //     })
  //     .join(", ");
  // };

  const getVolunteers = () => {
    return (
      volunteers
        ?.map((s) => "Volunteer") || []
    );
  };

  // const getDays = () => {
  //   return getDatesHelper().map((s: Date[]) => {
  //     return (
  //       s
  //         .sort((a, b) => a.getDay() - b.getDay())
  //         .map((d) => {
  //           return d.toLocaleDateString("en-US", {
  //             weekday: "short",
  //           });
  //         })
  //         .join(", ") || "-"
  //     );
  //   });
  // };

  // const getDatesHelper = () => {
  //   return (
  //     shifts.map((s) => {
  //       const today = new Date();
  //       today.setHours(0, 0, 0, 0);
  //       const nextWeek = new Date(today);
  //       nextWeek.setDate(today.getDate() + 7);
  //       return s["recurrences"]
  //         .filter((r) => {
  //           const recurrenceDate = new Date(r["date"]);
  //           return recurrenceDate >= today && recurrenceDate < nextWeek;
  //         })
  //         .map((r) => {
  //           return new Date(r["date"]);
  //         });
  //     }) || []
  //   );
  // };

  // const getAreas = () => {
  //   return (
  //     shifts?.map((s) => "Area") || []
  //   );
  // };

  // const getNextShifts = () => {
  //   return (
  //     shifts?.map((s) => {
  //       const firstShift = s["recurrences"]
  //         .sort(
  //           (a, b) =>
  //             new Date(a["date"]).getTime() -
  //             new Date(b["date"]).getTime()
  //         )
  //         .at(0);
  //       const options: Intl.DateTimeFormatOptions = {
  //         year: "numeric",
  //         month: "2-digit",
  //         day: "2-digit",
  //       };
  //       return firstShift
  //         ? new Intl.DateTimeFormat("en-US", options).format(
  //             new Date(firstShift["date"])
  //           )
  //         : "-";
  //     }) || []
  //   );
  // };

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
        <div className="days-of-repetion">{recurrenceDates.join(", ")}</div>
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
      <div className="_11-11-11">--</div>
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