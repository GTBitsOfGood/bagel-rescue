import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { Shift } from "@/server/db/models/shift";
import { IRoute } from "@/server/db/models/Route";
import { WeeklyShiftSidebarInfo } from "../AdminNavView/WeeklyShiftDashboard/page";

interface RouteCardProps {
  route: IRoute;
  shiftsPerRoute: Map<string, Shift[]>;
  onOpenSidebar: (route: IRoute, shifts: Shift[]) => void;
}

export default function RouteCard({ route, shiftsPerRoute, onOpenSidebar }: RouteCardProps) {
  const getTimesHeader = (r: IRoute) => {
    const dates = getDatesHelper(r)
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

  const getShiftsForRoute = (
    shiftsPerRoute: Map<string, Shift[]>,
    r: IRoute
  ): Shift[] => {
    const routeId = r["_id"].toString(); // make sure it's a string
    return shiftsPerRoute.get(routeId) ?? [];
  };

  const getDaysHeader = (r: IRoute) => {
    return getDatesHelper(r)
      .flat()
      .sort((a: Date, b: Date) => a.getDay() - b.getDay())
      .map((d: Date) => {
        return d.toLocaleDateString("en-US", {
          weekday: "short",
        });
      })
      .join(", ");
  };

  const getVolunteers = (r: IRoute) => {
    return (
      shiftsPerRoute
        .get(r["_id"].toString())
        ?.map((s) => "Volunteer") || []
    );
  };

  const getDays = (r: IRoute) => {
    return getDatesHelper(r).map((s: Date[]) => {
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

  const getDatesHelper = (r: IRoute) => {
    return (
      shiftsPerRoute.get(r["_id"].toString())?.map((s) => {
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

  const getAreas = (r: IRoute) => {
    return (
      shiftsPerRoute.get(r["_id"].toString())?.map((s) => "Area") || []
    );
  };

  const getNextShifts = (r: IRoute) => {
    return (
      shiftsPerRoute.get(r["_id"].toString())?.map((s) => {
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
      onClick={() => onOpenSidebar(route, getShiftsForRoute(shiftsPerRoute, route))}>
      <div className="route-card-header">
        <p className="route-card-name">{route["routeName"]}</p>
        <div className="route-card-header-right-section">
          <p className="route-card-time">
            {getTimesHeader(route)} {getDaysHeader(route)}
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
          {getVolunteers(route).map((s, sInd) => (
            <p key={sInd} className="route-card-section-body">
              {s}
            </p>
          ))}
        </div>
        <div className="route-card-section">
          <p className="route-card-section-header">Days</p>
          {getDays(route).map((s, sInd) => (
            <p key={sInd} className="route-card-section-body">
              {s}
            </p>
          ))}
        </div>
        <div className="route-card-section">
          <p className="route-card-section-header">Area</p>
          {getAreas(route).map((s, sInd) => (
            <p key={sInd} className="route-card-section-body">
              {s}
            </p>
          ))}
        </div>
        <div className="route-card-section">
          <p className="route-card-section-header">Next Shift</p>
          {getNextShifts(route).map((s, sInd) => (
            <p key={sInd} className="route-card-section-body">
              {s}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
