export const dateToString = (date: Date) => {
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
    const day = date.getUTCDate().toString().padStart(2, "0");

    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
};

export const stringZToDate = (dateString: string) => {
    return new Date(dateString);
}

export const stringToDate = (dateString: string) => {
    return new Date(dateString);
}