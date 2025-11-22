"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./UserSidebar.module.css";
import { getUserById } from "@/server/db/actions/User";
import type { IUser } from "@/server/db/models/User";
import { BarChart } from "./BarChart";
import { LineChart } from "./LineChart";
import { stringToDate } from "@/lib/dateHandler";

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
    SEND_INVITE: "Send Invite",
    INVITE_SENT: "Invite Sent",
    ACTIVE: "Active",
};

const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short" });

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

            console.log(stringToDate(key).getUTCMonth());

            const parsedDate = stringToDate(key);
            const monthLabel = parsedDate.toUTCString().slice(8, 11);

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
        return pieces.length > 0
            ? pieces.join(" ")
            : user.username || "Volunteer";
    }, [user]);

    const statusLabel = user?.status ? statusLabels[user.status] : null;

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

    const hasData = monthlyDataFromUser.length !== 0;
    let monthlyChartData = monthlyDataFromUser;

    if (monthlyChartData.length > 8) {
        monthlyChartData = monthlyChartData
            .sort((a, b) => {
                const first = stringToDate(a.dateKey).getTime();
                const second = stringToDate(b.dateKey).getTime();
                return first - second;
            });

        monthlyChartData = monthlyChartData.slice(monthlyChartData.length - 8);
    }

    const volunteerHoursTotal = useMemo(
        () => monthlyChartData.reduce((sum, datum) => sum + datum.shiftTime, 0),
        [monthlyChartData]
    );

    return (
        <div className={styles.sidebar}>
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
                        d="M17.7075 22.7076L7.70751 32.7076C7.51987 32.8952 7.26537 33.0006 7.00001 33.0006C6.73464 33.0006 6.48015 32.8952 6.29251 32.7076C6.10487 32.5199 5.99945 32.2654 5.99945 32.0001C5.99945 31.7347 6.10487 31.4802 6.29251 31.2926L15.5863 22.0001L6.29251 12.7076C6.10487 12.5199 5.99945 12.2654 5.99945 12.0001C5.99945 11.7347 6.10487 11.4802 6.29251 11.2926C6.48015 11.1049 6.73464 10.9995 7.00001 10.9995C7.26537 10.9995 7.51987 11.1049 7.70751 11.2926L17.7075 21.2926C17.8005 21.3854 17.8742 21.4957 17.9246 21.6171C17.9749 21.7385 18.0008 21.8687 18.0008 22.0001C18.0008 22.1315 17.9749 22.2616 17.9246 22.383C17.8742 22.5044 17.8005 22.6147 17.7075 22.7076ZM27.7075 21.2926L17.7075 11.2926C17.5199 11.1049 17.2654 10.9995 17 10.9995C16.7346 10.9995 16.4801 11.1049 16.2925 11.2926C16.1049 11.4802 15.9995 11.7347 15.9995 12.0001C15.9995 12.2654 16.1049 12.5199 16.2925 12.7076L25.5863 22.0001L16.2925 31.2926C16.1049 31.4802 15.9995 31.7347 15.9995 32.0001C15.9995 32.2654 16.1049 32.5199 16.2925 32.7076C16.4801 32.8952 16.7346 33.0006 17 33.0006C17.2654 33.0006 17.5199 32.8952 17.7075 32.7076L27.7075 22.7076C27.8005 22.6147 27.8742 22.5044 27.9246 22.383C27.9749 22.2616 28.0008 22.1315 28.0008 22.0001C28.0008 21.8687 27.9749 21.7385 27.9246 21.6171C27.8742 21.4957 27.8005 21.3854 27.7075 21.2926Z"
                        fill="#072B68"
                    />
                </svg>
            </button>

            <div className={styles.content}>
                {loading ? (
                    <p className={styles.loadingState}>
                        Loading volunteer details…
                    </p>
                ) : null}

                {!loading && error ? (
                    <p className={styles.errorState}>{error}</p>
                ) : null}

                {!loading && !error && user ? (
                    <>
                        <span className={styles.userName}>{fullName}</span>

                        <section className={styles.section}>
                            <h3 className={styles.sectionTitle}>Location</h3>
                            {user.locations && user.locations.length > 0 ? (
                                <div className={styles.chipList}>
                                    {user.locations.map((location) => (
                                        <span
                                            className={styles.chip}
                                            key={location}
                                        >
                                            {location}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className={styles.supportText}>
                                    This volunteer has not selected preferred
                                    locations yet.
                                </p>
                            )}
                        </section>

                        {user.status && (
                            <section className={styles.section}>
                                <h3 className={styles.sectionTitle}>Status</h3>
                                {statusLabel ? (
                                    <div
                                        className={styles.statusChip}
                                        data-status={user.status
                                            .toLowerCase()
                                            .replace(/\s+/g, "-")}
                                    >
                                        {statusLabel}
                                    </div>
                                ) : (
                                    <span className={styles.infoValue}>
                                        Not available
                                    </span>
                                )}
                            </section>
                        )}

                        <div className={styles.metrics}>
                            <div>
                                <section className={styles.section}>
                                    <h3 className={styles.sectionTitle}>
                                        Shifts
                                    </h3>
                                    <span className={styles.metricValue}>
                                        {/* {Sum of all shifts} */}
                                        {monthlyChartData.reduce(
                                            (total, data) =>
                                                total + data.totalShifts,
                                            0
                                        )}
                                    </span>
                                </section>

                                <section className={styles.section}>
                                    <h3 className={styles.sectionTitle}>
                                        Phone number
                                    </h3>
                                    <span className={styles.metricValue}>
                                        {formatPhone(user.phoneNumber)}
                                    </span>
                                </section>
                            </div>

                            <div>
                                <section className={styles.section}>
                                    <h3 className={styles.sectionTitle}>
                                        Volunteer Time
                                    </h3>
                                    <span className={styles.metricValue}>
                                        {Math.round(volunteerHoursTotal / 60)} hours
                                    </span>
                                </section>

                                <section className={styles.section}>
                                    <h3 className={styles.sectionTitle}>
                                        Email
                                    </h3>
                                    <span className={styles.metricValue}>
                                        {user.email || "Not provided"}
                                    </span>
                                </section>
                            </div>
                        </div>

                        <section className={styles.section}>
                            <h3 className={styles.sectionTitle}>
                                Route preferences
                            </h3>
                            {preferences.some((item) => item.active) ? (
                                <div className={styles.chipList}>
                                    {preferences
                                        .filter((item) => item.active)
                                        .map((item) => (
                                            <span
                                                className={styles.chip}
                                                key={item.label}
                                            >
                                                {item.label}
                                            </span>
                                        ))}
                                </div>
                            ) : (
                                <p className={styles.supportText}>
                                    No route preferences recorded yet.
                                </p>
                            )}
                        </section>

                        {hasData && (
                            <>
                                <section className={styles.section}>
                                    <BarChart
                                        title="Monthly Volunteer Time"
                                        legend="Volunteer time"
                                        units="hours"
                                        monthlyData={monthlyChartData.map(
                                            (datum) => ({
                                                key: datum.monthLabel,
                                                value: datum.shiftTime / 60,
                                            })
                                        )}
                                    />
                                </section>

                                <section className={styles.section}>
                                    <LineChart
                                        title="Monthly Shifts"
                                        legend="Shift"
                                        units="shifts"
                                        monthlyData={monthlyChartData.map(
                                            (datum) => ({
                                                key: datum.monthLabel,
                                                value:
                                                    datum.totalShifts ?? 0,
                                            })
                                        )}
                                    />
                                </section>

                                <section className={styles.section}>
                                    <BarChart
                                        title="Monthly Bagels Rescued"
                                        legend="Bagels rescued"
                                        units="bagels"
                                        monthlyData={monthlyChartData.map(
                                            (datum) => ({
                                                key: datum.monthLabel,
                                                value:
                                                    datum.bagelsDelivered +
                                                    datum.bagelsReceived,
                                            })
                                        )}
                                    />
                                </section>
                            </>
                        )}
                    </>
                ) : null}
            </div>
        </div>
    );
};

export default UserSidebar;
