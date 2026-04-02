import { dayToThree } from "./dayHandler";
import { toUTCStartOfDay } from "./dateHandler";

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
    // Note: startDate and endDate are local time

    if (!day || !startDate || !endDate) {
        return null;
    }

    if (!dayToThree[day.toLowerCase()]) {
        return null;
    }

    const current = dayToThree[day.toLowerCase()];

    // Iterate through each day in the range
    // const currentDate = new Date(startDate);
    // const lastDate = new Date(endDate);
    const currentDate = toUTCStartOfDay(startDate)
    const lastDate = toUTCStartOfDay(endDate)

    while (currentDate <= lastDate) {
        const currentDay = currentDate.toUTCString().split(",")[0];

        if (currentDay === current) {
            return new Date(currentDate); // this is UTC
        }

        currentDate.setDate(currentDate.getDate() + 1);
    }

    return null;
};

export { getWeekRange, findDayInRange };
