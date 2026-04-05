export const dateToString = (date: Date) => {
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
    const day = date.getUTCDate().toString().padStart(2, "0");

    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
};

export const stringToDate = (dateString: string) => {
    return new Date(dateString);
};

export const getTodayDate = () => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
};

export const combineDateAndTime = (date: Date, time: Date) => {
    const combinedDate = new Date(date);
    combinedDate.setHours(time.getHours(), time.getMinutes(), time.getSeconds(), time.getMilliseconds());
    return combinedDate;
};

/**
 * Normalize a Date to UTC midnight WITHOUT changing its calendar day.
 * Use for:
 * - Dates coming from the database (UTC timestamps)
 * Do NOT use for:
 * - User-selected dates (will not convert from local time)
 */

export const normalizeDate = (date: Date) => {
    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);
    return normalizedDate;
};

/**
 * Convert a local date (user/browser) to UTC midnight.
 * Use for:
 * - Dates selected via date pickers or user input
* Do NOT use for:
 * - Dates already in UTC (e.g., from DB) — will cause off-by-one-day bugs
 */
export const toUTCStartOfDay = (date: Date) => {
  return new Date(Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ));
};

export const formattedDateMDY = (date: Date) => {
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
    const day = date.getUTCDate().toString().padStart(2, "0");
    return `${month}/${day}/${year}`;
};

export const formattedDateFull = (date: Date) => {
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1)
    const day = date.getUTCDate().toString().padStart(2, "0");
    const monthName = new Date(year, month - 1).toLocaleString("en-US", { month: "long" });
    return `${monthName} ${day}, ${year}`;
}