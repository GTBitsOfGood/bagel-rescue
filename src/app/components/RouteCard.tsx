import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { Shift } from "@/server/db/models/shift";
import { IRoute } from "@/server/db/models/Route";
import { WeeklyShiftSidebarInfo } from "../AdminNavView/WeeklyShiftDashboard/page";

interface RouteCardProps {
  route: IRoute;
  shifts: Shift[]
  volunteersPerShift: Map<string, string>;
  onOpenSidebar: (route: IRoute, shifts: Shift[], volunteersPerShift: Map<string, string>) => void;
}

export default function RouteCard({ route, shifts, volunteersPerShift, onOpenSidebar }: RouteCardProps) {
  const getTimesHeader = () => {
    const dates = getDatesHelper()
      .flat()
      .sort((a: Date, b: Date) => {
        return a.toTimeString().localeCompare(b.toTimeString());
      });
    if (dates.length == 0) return "";
    const minTime = dates.at(0);
    const maxTime = dates.at(dates.length - 1);
    const options: Intl.DateTimeFormatOptions = {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };
    return (
      minTime?.toLocaleTimeString("en-US", options) +
      " - " +
      maxTime?.toLocaleTimeString("en-US", options)
    );
  };

  // const getShiftsForRoute = (
  //   shiftsPerRoute: Map<string, Shift[]>,
  //   r: IRoute
  // ): Shift[] => {
  //   const routeId = r["_id"].toString(); // make sure it's a string
  //   return shiftsPerRoute.get(routeId) ?? [];
  // };

  const getDaysHeader = () => {
    return getDatesHelper()
      .flat()
      .sort((a: Date, b: Date) => a.getDay() - b.getDay())
      .map((d: Date) => {
        return d.toLocaleDateString("en-US", {
          weekday: "short",
        });
      })
      .join(", ");
  };

  const getVolunteers = () => {
    return (
      shifts
        ?.map((s) => "Volunteer") || []
    );
  };

  const getDays = () => {
    return getDatesHelper().map((s: Date[]) => {
      return (
        s
          .sort((a, b) => a.getDay() - b.getDay())
          .map((d) => {
            return d.toLocaleDateString("en-US", {
              weekday: "short",
            });
          })
          .join(", ") || "-"
      );
    });
  };

  const getDatesHelper = () => {
    return (
      shifts.map((s) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        return s["recurrences"]
          .filter((r) => {
            const recurrenceDate = new Date(r["date"]);
            return recurrenceDate >= today && recurrenceDate < nextWeek;
          })
          .map((r) => {
            return new Date(r["date"]);
          });
      }) || []
    );
  };

  const getAreas = () => {
    return (
      shifts?.map((s) => "Area") || []
    );
  };

  const getNextShifts = () => {
    return (
      shifts?.map((s) => {
        const firstShift = s["recurrences"]
          .sort(
            (a, b) =>
              new Date(a["date"]).getTime() -
              new Date(b["date"]).getTime()
          )
          .at(0);
        const options: Intl.DateTimeFormatOptions = {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        };
        return firstShift
          ? new Intl.DateTimeFormat("en-US", options).format(
              new Date(firstShift["date"])
            )
          : "-";
      }) || []
    );
  };

  return (
    <div className="route-card"
      onClick={() => onOpenSidebar(route, shifts, volunteersPerShift)}>
      <div className="route-card-header">
        <p className="route-card-name">{route["routeName"]}</p>
        <div className="route-card-header-right-section">
          <p className="route-card-time">
            {getTimesHeader()} {getDaysHeader()}
          </p>
          <button title="More options">
            <FontAwesomeIcon
              icon={faEllipsis}
              className="route-card-ellipsis-icon"
            />
          </button>
        </div>
      </div>
      <div className="route-card-body">
        <div className="route-card-section">
          <p className="route-card-section-header">Volunteer</p>
          {getVolunteers().map((s, sInd) => (
            <p key={sInd} className="route-card-section-body">
              {s}
            </p>
          ))}
        </div>
        <div className="route-card-section">
          <p className="route-card-section-header">Days</p>
          {getDays().map((s, sInd) => (
            <p key={sInd} className="route-card-section-body">
              {s}
            </p>
          ))}
        </div>
        <div className="route-card-section">
          <p className="route-card-section-header">Area</p>
          {getAreas().map((s, sInd) => (
            <p key={sInd} className="route-card-section-body">
              {s}
            </p>
          ))}
        </div>
        <div className="route-card-section">
          <p className="route-card-section-header">Next Shift</p>
          {getNextShifts().map((s, sInd) => (
            <p key={sInd} className="route-card-section-body">
              {s}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
