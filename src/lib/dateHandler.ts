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

export const normalizeDate = (date: Date) => {
    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);
    return normalizedDate;
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