"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./UserSidebar.module.css";
import { getUserById } from "@/server/db/actions/User";
import type { IUser } from "@/server/db/models/User";

interface UserSidebarProps {
  userId: string;
  onClose: () => void;
}

type UserDetails = (Omit<IUser, "_id"> & { _id?: string }) | null;

type MonthlyShiftDatum = {
  dateKey: string;
  monthLabel: string;
  shiftTime: number;
  bagelsDelivered: number;
  bagelsReceived: number;
  totalShifts: number;
};

const statusLabels: Record<NonNullable<IUser["status"]>, string> = {
  SEND_INVITE: "Invite Not Sent",
  INVITE_SENT: "Invite Sent",
  ACTIVE: "Active",
};

const statusClassName: Record<NonNullable<IUser["status"]>, string> = {
  SEND_INVITE: "statusInvite",
  INVITE_SENT: "statusSent",
  ACTIVE: "statusActive",
};

const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short" });

const SAMPLE_MONTHLY_DATA: MonthlyShiftDatum[] = [
  {
    dateKey: "2023-08-01T00:00:00.000Z",
    monthLabel: "Aug",
    shiftTime: 18,
    bagelsDelivered: 120,
    bagelsReceived: 98,
    totalShifts: 9,
  },
  {
    dateKey: "2023-09-01T00:00:00.000Z",
    monthLabel: "Sep",
    shiftTime: 12,
    bagelsDelivered: 96,
    bagelsReceived: 80,
    totalShifts: 6,
  },
  {
    dateKey: "2023-10-01T00:00:00.000Z",
    monthLabel: "Oct",
    shiftTime: 22,
    bagelsDelivered: 144,
    bagelsReceived: 110,
    totalShifts: 11,
  },
  {
    dateKey: "2023-11-01T00:00:00.000Z",
    monthLabel: "Nov",
    shiftTime: 28,
    bagelsDelivered: 180,
    bagelsReceived: 140,
    totalShifts: 14,
  },
  {
    dateKey: "2023-12-01T00:00:00.000Z",
    monthLabel: "Dec",
    shiftTime: 16,
    bagelsDelivered: 110,
    bagelsReceived: 96,
    totalShifts: 8,
  },
  {
    dateKey: "2024-01-01T00:00:00.000Z",
    monthLabel: "Jan",
    shiftTime: 12,
    bagelsDelivered: 90,
    bagelsReceived: 70,
    totalShifts: 6,
  },
  {
    dateKey: "2024-02-01T00:00:00.000Z",
    monthLabel: "Feb",
    shiftTime: 20,
    bagelsDelivered: 150,
    bagelsReceived: 118,
    totalShifts: 10,
  },
  {
    dateKey: "2024-03-01T00:00:00.000Z",
    monthLabel: "Mar",
    shiftTime: 14,
    bagelsDelivered: 120,
    bagelsReceived: 98,
    totalShifts: 7,
  },
];

const mapMonthlyShifts = (
  monthlyShifts?: IUser["monthlyShifts"]
): MonthlyShiftDatum[] => {
  if (!monthlyShifts) {
    return [];
  }

  const entries =
    monthlyShifts instanceof Map
      ? Array.from(monthlyShifts.entries())
      : Object.entries(monthlyShifts);

  return entries
    .map(([key, value]) => {
      if (!value) {
        return null;
      }

      const parsedDate = new Date(key);
      const monthLabel = Number.isNaN(parsedDate.getTime())
        ? key.slice(0, 3)
        : monthFormatter.format(parsedDate);

      return {
        dateKey: key,
        monthLabel,
        shiftTime: value.shiftTime ?? 0,
        bagelsDelivered: value.bagelsDelivered ?? 0,
        bagelsReceived: value.bagelsReceived ?? 0,
        totalShifts: value.totalShifts ?? 0,
      };
    })
    .filter((datum): datum is MonthlyShiftDatum => Boolean(datum))
    .sort((a, b) => {
      const first = new Date(a.dateKey).getTime();
      const second = new Date(b.dateKey).getTime();
      return first - second;
    });
};

const formatDate = (value?: Date | string) => {
  if (!value) {
    return "Not available";
  }

  const dateValue = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(dateValue.getTime())) {
    return "Not available";
  }

  return dateValue.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatPhone = (phone?: string | null) => {
  if (!phone) {
    return "Not provided";
  }

  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(
      6,
      10
    )}`;
  }

  return phone;
};

const convertUserToDetails = (userData: IUser | null): UserDetails => {
  if (!userData) {
    return null;
  }

  const { _id, ...rest } = userData;
  const normalizedId =
    typeof _id === "string"
      ? _id
      : _id
      ? (_id as unknown as { toString(): string }).toString()
      : undefined;

  return { ...rest, _id: normalizedId };
};

const UserSidebar = ({ userId, onClose }: UserSidebarProps) => {
  const [user, setUser] = useState<UserDetails>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      if (!userId) {
        setUser(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await getUserById(userId);

        if (!isMounted) {
          return;
        }

        if (!result) {
          setError("Unable to find a volunteer with this id.");
          setUser(null);
          return;
        }

        setUser(convertUserToDetails(result));
      } catch (err) {
        if (!isMounted) {
          return;
        }

        console.error("Failed to load volunteer profile:", err);
        setError("We ran into a problem loading this volunteer.");
        setUser(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const fullName = useMemo(() => {
    if (!user) {
      return "Volunteer profile";
    }

    const pieces = [user.firstName, user.lastName].filter(Boolean);
    return pieces.length > 0 ? pieces.join(" ") : user.username || "Volunteer";
  }, [user]);

  const initials = useMemo(() => {
    if (!user) {
      return "BR";
    }

    const sources = [user.firstName, user.lastName].filter(Boolean);
    if (sources.length === 0 && user.username) {
      return user.username
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
    }

    return sources
      .map((part) => part.trim()[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [user]);

  const statusLabel = user?.status ? statusLabels[user.status] : null;
  const statusBadgeClass =
    user?.status && statusClassName[user.status]
      ? styles[statusClassName[user.status]]
      : "";

  const preferences = useMemo(
    () => [
      {
        label: "Normal Routes",
        active: Boolean(user?.prefersNormalRoutes),
      },
      {
        label: "Sub Only",
        active: Boolean(user?.prefersSubOnly),
      },
      {
        label: "Open To Any Route",
        active: Boolean(user?.openToAny),
      },
    ],
    [user]
  );

  const monthlyDataFromUser = useMemo(
    () => mapMonthlyShifts(user?.monthlyShifts),
    [user?.monthlyShifts]
  );

  const usingSampleData = monthlyDataFromUser.length === 0;
  const monthlyChartData = usingSampleData
    ? SAMPLE_MONTHLY_DATA
    : monthlyDataFromUser;

  const volunteerHoursTotal = useMemo(
    () => monthlyChartData.reduce((sum, datum) => sum + datum.shiftTime, 0),
    [monthlyChartData]
  );

  const maxVolunteerHours = Math.max(
    ...monthlyChartData.map((datum) => datum.shiftTime),
    1
  );
  const avgVolunteerHours =
    volunteerHoursTotal / (monthlyChartData.length || 1);

  const maxMonthlyShifts = Math.max(
    ...monthlyChartData.map((datum) => datum.totalShifts),
    1
  );

  const chartLinePoints = useMemo(() => {
    if (monthlyChartData.length === 0) {
      return "";
    }

    return monthlyChartData
      .map((datum, index) => {
        const x =
          monthlyChartData.length === 1
            ? 50
            : (index / (monthlyChartData.length - 1)) * 100;
        const y = 100 - (datum.totalShifts / maxMonthlyShifts) * 100;
        return `${x},${y}`;
      })
      .join(" ");
  }, [maxMonthlyShifts, monthlyChartData]);

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <button
          type="button"
          className={styles.closeButton}
          aria-label="Close volunteer sidebar"
          onClick={onClose}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="44"
            viewBox="0 0 32 44"
            fill="none"
          >
            <path
              d="M14.2925 21.2924L24.2925 11.2924C24.4801 11.1048 24.7346 10.9994 25 10.9994C25.2654 10.9994 25.5199 11.1048 25.7075 11.2924C25.8951 11.48 26.0005 11.7345 26.0005 11.9999C26.0005 12.2653 25.8951 12.5198 25.7075 12.7074L16.4137 22L25.7075 31.2924C25.8951 31.48 26.0005 31.7345 26.0005 31.9999C26.0005 32.2653 25.8951 32.5198 25.7075 32.7074C25.5199 32.895 25.2654 33.0004 25 33.0004C24.7346 33.0004 24.4801 32.895 24.2925 32.7074L14.2925 22.7074C14.1995 22.6146 14.1258 22.5043 14.0754 22.3829C14.0251 22.2615 13.9992 22.1313 13.9992 21.9999C13.9992 21.8685 14.0251 21.7384 14.0754 21.617C14.1258 21.4956 14.1995 21.3853 14.2925 21.2924ZM4.29251 22.7074L14.2925 32.7074C14.4801 32.895 14.7346 33.0004 15 33.0004C15.2654 33.0004 15.5199 32.895 15.7075 32.7074C15.8951 32.5198 16.0005 32.2653 16.0005 31.9999C16.0005 31.7345 15.8951 31.48 15.7075 31.2924L6.41374 22L15.7075 12.7074C15.8951 12.5198 16.0005 12.2653 16.0005 11.9999C16.0005 11.7345 15.8951 11.48 15.7075 11.2924C15.5199 11.1048 15.2654 10.9994 15 10.9994C14.7346 10.9994 14.4801 11.1048 14.2925 11.2924L4.29251 21.2924C4.19948 21.3852 4.12579 21.4955 4.07543 21.6169C4.02507 21.7383 3.99915 21.8685 3.99915 21.9999C3.99915 22.1313 4.02507 22.2614 4.07543 22.3828C4.12579 22.5042 4.19948 22.6145 4.29251 22.7074Z"
              fill="#072B68"
            />
          </svg>
        </button>

        <div className={styles.headerContent}>
          <span className={styles.pretitle}>Volunteer Profile</span>
          <div className={styles.headerLine}>
            <div className={styles.avatar}>{initials || "BR"}</div>
            <div className={styles.headline}>
              <span className={styles.userName}>{fullName}</span>
              {user?.email ? (
                <span className={styles.userEmail}>{user.email}</span>
              ) : null}
            </div>
          </div>
          {statusLabel ? (
            <span className={`${styles.statusChip} ${statusBadgeClass}`}>
              {statusLabel}
            </span>
          ) : null}
        </div>
      </div>

      <div className={styles.content}>
        {loading ? (
          <p className={styles.loadingState}>Loading volunteer details…</p>
        ) : null}

        {!loading && error ? (
          <p className={styles.errorState}>{error}</p>
        ) : null}

        {!loading && !error && user ? (
          <>
            <section className={`${styles.section} ${styles.overviewSection}`}>
              <div className={`${styles.infoCard} ${styles.overviewCard}`}>
                <div className={styles.overviewHeader}>
                  <div>
                    <span className={styles.infoLabel}>Locations</span>
                    {user.locations && user.locations.length > 0 ? (
                      <div className={styles.chipList}>
                        {user.locations.map((location) => (
                          <span className={styles.chip} key={location}>
                            {location}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className={styles.supportText}>
                        This volunteer has not selected preferred locations yet.
                      </p>
                    )}
                  </div>
                  <div>
                    <span className={styles.infoLabel}>Status</span>
                    {statusLabel ? (
                      <span
                        className={`${styles.statusChip} ${statusBadgeClass}`}
                      >
                        {statusLabel}
                      </span>
                    ) : (
                      <span className={styles.infoValue}>Not available</span>
                    )}
                  </div>
                </div>

                <div className={styles.metricsRow}>
                  <div className={styles.metricBlock}>
                    <span className={styles.metricLabel}>Shifts</span>
                    <span className={styles.metricValue}>
                      {user.totalShifts ?? 0}
                    </span>
                  </div>
                  <div className={styles.metricBlock}>
                    <span className={styles.metricLabel}>Volunteer time</span>
                    <span className={styles.metricValue}>
                      {Math.round(volunteerHoursTotal)} hrs
                    </span>
                  </div>
                  <div className={styles.metricBlock}>
                    <span className={styles.metricLabel}>Phone number</span>
                    <span className={styles.metricValue}>
                      {formatPhone(user.phoneNumber)}
                    </span>
                  </div>
                  <div className={styles.metricBlock}>
                    <span className={styles.metricLabel}>Email</span>
                    <span className={styles.metricValue}>
                      {user.email || "Not provided"}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Impact overview</h3>
              <div className={styles.statGrid}>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Bagels Delivered</span>
                  <span className={styles.statValue}>
                    {user.bagelsDelivered ?? 0}
                  </span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Bagels Received</span>
                  <span className={styles.statValue}>
                    {user.bagelsReceived ?? 0}
                  </span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Total Shifts</span>
                  <span className={styles.statValue}>
                    {user.totalShifts ?? 0}
                  </span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Deliveries</span>
                  <span className={styles.statValue}>
                    {user.totalDeliveries ?? 0}
                  </span>
                </div>
              </div>
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Route preferences</h3>
              <div className={styles.infoCard}>
                {preferences.some((item) => item.active) ? (
                  <div className={styles.chipList}>
                    {preferences
                      .filter((item) => item.active)
                      .map((item) => (
                        <span className={styles.chip} key={item.label}>
                          {item.label}
                        </span>
                      ))}
                  </div>
                ) : (
                  <p className={styles.supportText}>
                    No route preferences recorded yet.
                  </p>
                )}
              </div>
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Account details</h3>
              <div className={styles.infoCard}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Username</span>
                  <span className={styles.infoValue}>
                    {user.username || "Not provided"}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Role</span>
                  <span className={styles.infoValue}>
                    {user.isAdmin ? "Admin" : "Volunteer"}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Created</span>
                  <span className={styles.infoValue}>
                    {formatDate(user.createdAt)}
                  </span>
                </div>
              </div>
            </section>

            <section className={styles.section}>
              <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <div>
                    <h3 className={styles.sectionTitle}>
                      Monthly volunteer time
                    </h3>
                    <span className={styles.chartSubtitle}>Hours per month</span>
                  </div>
                  <div className={styles.chartLegend}>
                    <span className={styles.legendDot} /> Volunteer time
                    <span
                      className={`${styles.legendDot} ${styles.legendDashed}`}
                    />
                    Avg. {Math.round(avgVolunteerHours)} hrs
                  </div>
                </div>
                <div className={styles.barChart}>
                  <div
                    className={styles.averageLine}
                    style={{
                      bottom: `${(avgVolunteerHours / maxVolunteerHours) * 100}%`,
                    }}
                  />
                  {monthlyChartData.map((datum) => (
                    <div className={styles.barGroup} key={datum.dateKey}>
                      <div
                        className={styles.bar}
                        style={{
                          height: `${(datum.shiftTime / maxVolunteerHours) * 100}%`,
                        }}
                      />
                      <span className={styles.barLabel}>{datum.monthLabel}</span>
                    </div>
                  ))}
                </div>
                {usingSampleData ? (
                  <p className={styles.sampleDataNote}>
                    Showing sample data until this volunteer logs monthly shifts.
                  </p>
                ) : null}
              </div>
            </section>

            <section className={styles.section}>
              <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <div>
                    <h3 className={styles.sectionTitle}>Monthly shifts</h3>
                    <span className={styles.chartSubtitle}>Shifts per month</span>
                  </div>
                </div>
                <div className={styles.lineChart}>
                  <svg
                    className={styles.lineChartSvg}
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    <polyline
                      className={styles.lineChartPath}
                      points={chartLinePoints}
                      pathLength={100}
                    />
                    {monthlyChartData.map((datum, index) => {
                      const x =
                        monthlyChartData.length === 1
                          ? 50
                          : (index / (monthlyChartData.length - 1)) * 100;
                      const y =
                        100 - (datum.totalShifts / maxMonthlyShifts) * 100;
                      return (
                        <circle
                          key={`${datum.dateKey}-point`}
                          className={styles.lineChartDot}
                          cx={x}
                          cy={y}
                          r={1.4}
                        />
                      );
                    })}
                  </svg>
                  <div className={styles.lineChartLabels}>
                    {monthlyChartData.map((datum) => (
                      <span key={`${datum.dateKey}-label`}>
                        {datum.monthLabel}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default UserSidebar;
