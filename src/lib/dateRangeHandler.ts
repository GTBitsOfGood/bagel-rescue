import { dayToThree } from "./dayHandler";

const getWeekRange = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    startOfWeek.setDate(diff);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return { startOfWeek, endOfWeek };
};

const findDayInRange = (day: string, startDate: Date, endDate: Date) => {
    if (!day || !startDate || !endDate) {
        return null;
    }

    if (!dayToThree[day.toLowerCase()]) {
        return null;
    }

    const current = dayToThree[day.toLowerCase()];

    // Iterate through each day in the range
    const currentDate = new Date(startDate.getTime());
    const lastDate = new Date(endDate);

    while (currentDate <= lastDate) {
        const currentDay = currentDate.toUTCString().split(",")[0];

        if (currentDay === current) {
            return new Date(currentDate);
        }

        currentDate.setDate(currentDate.getDate() + 1);
    }

    return null;
};

export { getWeekRange, findDayInRange };
