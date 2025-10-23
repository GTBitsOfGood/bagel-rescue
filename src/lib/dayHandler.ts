const dayToNumber: Record<string, number> = {
    su: 0,
    mo: 1,
    tu: 2,
    we: 3,
    th: 4,
    fr: 5,
    sa: 6,
};

export default dayToNumber;

export const numberToDay: Record<number, string> = {
        0: 'su', 1: 'mo', 2: 'tu', 3: 'we', 4: 'th', 5: 'fr', 6: 'sa'
};

export function getDaysInRange(startDate: Date, endDate: Date): string[] {
    const daysSet = new Set<number>();
    const current = new Date(startDate);
    
    while (current <= endDate) {
        daysSet.add(current.getDay());
        current.setDate(current.getDate() + 1);
    }
    
    return Array.from(daysSet).map(num => numberToDay[num]);
}
