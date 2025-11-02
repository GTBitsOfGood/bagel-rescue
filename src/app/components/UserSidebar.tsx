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

        setUser(result);
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
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>At a glance</h3>
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
              <h3 className={styles.sectionTitle}>Contact</h3>
              <div className={styles.infoCard}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Email</span>
                  <span className={styles.infoValue}>
                    {user.email || "Not provided"}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Phone</span>
                  <span className={styles.infoValue}>
                    {formatPhone(user.phoneNumber)}
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
              <h3 className={styles.sectionTitle}>Route Preferences</h3>
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
              <h3 className={styles.sectionTitle}>Preferred Locations</h3>
              <div className={styles.infoCard}>
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
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Account Details</h3>
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
              </div>
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default UserSidebar;
