'use server'

import exp from "constants";
import dbConnect from "../dbConnect";
import { ShiftModel } from "../models/shift";
import Route from "../models/Route";

export async function getNumberOfShiftsThisMonth(): Promise<number> {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); 
    
    try {
        await dbConnect();
        const count = await ShiftModel.countDocuments({
            startTime: {
                $gte: startDate,
                $lte: endDate,
            },
        });
        
        return count;
    } catch (error) {
        console.error("Failed to get shifts count:", error);
        throw new Error("Failed to get shifts count");
    }
    
}

export async function getNumberOfShiftsThisYear(): Promise<number> {
    const date = new Date();
    const year = date.getFullYear();
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 0); 


    try {
        await dbConnect();
        const count = await ShiftModel.countDocuments({
            shiftDate: {
                $gte: startDate,
                $lte: endDate,
            },
        });
        
        return count;
    } catch (error) {
        console.error("Failed to get shifts count:", error);
        throw new Error("Failed to get shifts count");
    }

}

export async function getAverageNumberOfShiftsMonthly(): Promise<number> {
    const today = new Date();
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setFullYear(today.getFullYear() - 1);
    
    try {
        await dbConnect();
        
        const shifts = await ShiftModel.find({
            $or: [
                { shiftDate: { $gte: twelveMonthsAgo } },
                { "recurrences.date": { $gte: twelveMonthsAgo } }
            ]
        });
        
        const monthlyShifts = new Map<string, number>();
        
        shifts.forEach((shift) => {
            const shiftDate = new Date(shift.shiftDate);
            if (shiftDate >= twelveMonthsAgo) {
                const key = `${shiftDate.getFullYear()}-${(shiftDate.getMonth() + 1).toString()}`;
                monthlyShifts.set(key, (monthlyShifts.get(key) || 0) + 1);
            }
            
            shift.recurrences.forEach((recurrence) => {
                const recurrenceDate = new Date(recurrence.date);
                if (recurrenceDate >= twelveMonthsAgo) {
                    const key = `${recurrenceDate.getFullYear()}-${(recurrenceDate.getMonth() + 1).toString()}`;
                    monthlyShifts.set(key, (monthlyShifts.get(key) || 0) + 1);
                }
            });
        });
        
        let totalShifts = 0;
        monthlyShifts.forEach((count) => {
            totalShifts += count;
        });
        
        const numberOfMonths = Math.min(monthlyShifts.size, 12);
        
        return numberOfMonths > 0 ? totalShifts / numberOfMonths : 0;
    } catch (error) {
        console.error("Failed to get average shifts per month:", error);
        throw new Error("Failed to get average shifts per month");
    }
}

export async function getAverageNumberOfShiftsYearly(): Promise<number> {
    const today = new Date();
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(today.getFullYear() - 2);
    
    try {
        await dbConnect();
        
        const shifts = await ShiftModel.find({
            $or: [
                { shiftDate: { $gte: twoYearsAgo } },
                { "recurrences.date": { $gte: twoYearsAgo } }
            ]
        });
        
        const yearlyShifts = new Map<string, number>();
        
        shifts.forEach((shift) => {
            const shiftDate = new Date(shift.shiftDate);
            if (shiftDate >= twoYearsAgo) {
                const key = `${shiftDate.getFullYear()}`;
                yearlyShifts.set(key, (yearlyShifts.get(key) || 0) + 1);
            }
            
            shift.recurrences.forEach((recurrence) => {
                const recurrenceDate = new Date(recurrence.date);
                if (recurrenceDate >= twoYearsAgo) {
                    const key = `${recurrenceDate.getFullYear()}`;
                    yearlyShifts.set(key, (yearlyShifts.get(key) || 0) + 1);
                }
            });
        });
        
        let totalShifts = 0;
        yearlyShifts.forEach((count) => {
            totalShifts += count;
        });
        
        const numberOfYears = Math.min(yearlyShifts.size, 5);
        
        return numberOfYears > 0 ? totalShifts / numberOfYears : 0;
    } catch (error) {
        console.error("Failed to get average shifts per year:", error);
        throw new Error("Failed to get average shifts per year");
    }
}

export async function getTotalShiftDurationThisMonth(): Promise<number> {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth(); 
    const startDate = new Date(year, month, 1); 
    const endDate = new Date(year, month + 1, 0);
    
    try {
        await dbConnect();
        
        const shifts = await ShiftModel.find({
            $or: [
                { 
                    shiftDate: {
                        $gte: startDate,
                        $lte: endDate
                    } 
                },
                { 
                    "recurrences.date": {
                        $gte: startDate,
                        $lte: endDate
                    } 
                }
            ]
        });
        
        let totalDurationMinutes = 0;
        
        shifts.forEach((shift) => {
            const startTime = new Date(shift.shiftDate);
            const endTime = new Date(shift.shiftEndDate);
            const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
            
            const shiftDate = new Date(shift.shiftDate);
            if (shiftDate >= startDate && shiftDate <= endDate) {
                totalDurationMinutes += durationMinutes;
            }
            
            shift.recurrences.forEach((recurrence) => {
                const recurrenceDate = new Date(recurrence.date);
                if (recurrenceDate >= startDate && recurrenceDate <= endDate) {
                    totalDurationMinutes += durationMinutes;
                }
            });
        });
        
        return totalDurationMinutes;
    } catch (error) {
        console.error("Failed to get total shift duration:", error);
        throw new Error("Failed to get total shift duration");
    }
}

export async function getTotalShiftDurationThisYear(): Promise<number> {
    const date = new Date();
    const year = date.getFullYear();
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 0); 
    
    try {
        await dbConnect();
        
        const shifts = await ShiftModel.find({
            $or: [
                { 
                    shiftDate: {
                        $gte: startDate,
                        $lte: endDate
                    } 
                },
                { 
                    "recurrences.date": {
                        $gte: startDate,
                        $lte: endDate
                    } 
                }
            ]
        });
        
        let totalDurationMinutes = 0;
        
        shifts.forEach((shift) => {
            const startTime = new Date(shift.shiftDate);
            const endTime = new Date(shift.shiftEndDate);
            const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
            
            const shiftDate = new Date(shift.shiftDate);
            if (shiftDate >= startDate && shiftDate <= endDate) {
                totalDurationMinutes += durationMinutes;
            }
            
            shift.recurrences.forEach((recurrence) => {
                const recurrenceDate = new Date(recurrence.date);
                if (recurrenceDate >= startDate && recurrenceDate <= endDate) {
                    totalDurationMinutes += durationMinutes;
                }
            });
        });
        
        return totalDurationMinutes;
    } catch (error) {
        console.error("Failed to get total shift duration:", error);
        throw new Error("Failed to get total shift duration");
    }
}

export async function getAverageShiftDurationMonthly(): Promise<number> {
    const today = new Date();
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setFullYear(today.getFullYear() - 1);
    
    try {
        await dbConnect();
        
        const shifts = await ShiftModel.find({
            $or: [
                { shiftDate: { $gte: twelveMonthsAgo } },
                { "recurrences.date": { $gte: twelveMonthsAgo } }
            ]
        });
        
        const monthlyDurations = new Map<string, number>();
        
        shifts.forEach((shift) => {
            const startTime = new Date(shift.shiftDate);
            const endTime = new Date(shift.shiftEndDate);
            const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
            
            const shiftDate = new Date(shift.shiftDate);
            if (shiftDate >= twelveMonthsAgo) {
                const key = `${shiftDate.getFullYear()}-${(shiftDate.getMonth() + 1).toString()}`;
                monthlyDurations.set(key, (monthlyDurations.get(key) || 0) + durationMinutes);
            }
            
            shift.recurrences.forEach((recurrence) => {
                const recurrenceDate = new Date(recurrence.date);
                if (recurrenceDate >= twelveMonthsAgo) {
                    const key = `${recurrenceDate.getFullYear()}-${(recurrenceDate.getMonth() + 1).toString()}`;
                    monthlyDurations.set(key, (monthlyDurations.get(key) || 0) + durationMinutes);
                }
            });
        });
        
        let totalDuration = 0;
        monthlyDurations.forEach((duration) => {
            totalDuration += duration;
        });
        
        const numberOfMonths = Math.min(monthlyDurations.size, 12);
        
        return numberOfMonths > 0 ? totalDuration / numberOfMonths : 0;
    } catch (error) {
        console.error("Failed to get average shift duration per month:", error);
        throw new Error("Failed to get average shift duration per month");
    }
}

export async function getAverageShiftDurationYearly(): Promise<number> {
    const today = new Date();
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(today.getFullYear() - 2);
    
    try {
        await dbConnect();
        
        const shifts = await ShiftModel.find({
            $or: [
                { shiftDate: { $gte: twoYearsAgo } },
                { "recurrences.date": { $gte: twoYearsAgo } }
            ]
        });
        
        const yearlyDurations = new Map<string, number>();
        
        shifts.forEach((shift) => {
            const startTime = new Date(shift.shiftDate);
            const endTime = new Date(shift.shiftEndDate);
            const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
            
            const shiftDate = new Date(shift.shiftDate);
            if (shiftDate >= twoYearsAgo) {
                const key = `${shiftDate.getFullYear()}`;
                yearlyDurations.set(key, (yearlyDurations.get(key) || 0) + durationMinutes);
            }
            
            shift.recurrences.forEach((recurrence) => {
                const recurrenceDate = new Date(recurrence.date);
                if (recurrenceDate >= twoYearsAgo) {
                    const key = `${recurrenceDate.getFullYear()}`;
                    yearlyDurations.set(key, (yearlyDurations.get(key) || 0) + durationMinutes);
                }
            });
        });
        
        let totalDuration = 0;
        yearlyDurations.forEach((duration) => {
            totalDuration += duration;
        });
        
        const numberOfYears = Math.min(yearlyDurations.size, 5);
        
        return numberOfYears > 0 ? totalDuration / numberOfYears : 0;
    } catch (error) {
        console.error("Failed to get average shift duration per year:", error);
        throw new Error("Failed to get average shift duration per year");
    }
}

export interface RecentShift {
    _id: string;
    name: string;       
    status: string;    
    time: number;       
    date: Date;       
}
export async function getRecentShifts(): Promise<RecentShift[]> {
    try {
      await dbConnect();
      
      const shifts = await ShiftModel.find().lean();
      
      const routeIds = shifts.map(shift => shift.routeId);
      const routes = await Route.find({
        _id: { $in: routeIds }
      }).lean();
      
      const routeMap = new Map();
      routes.forEach(route => {
        routeMap.set(route.id.toString(), route.routeName || "Unknown Route");
      });
      
      const allShifts: {
        shiftId: string;
        routeId: string;
        routeName: string;
        date: Date;
        duration: number;
        status: string;
      }[] = [];
      
      shifts.forEach(shift => {
        const routeId = shift.routeId.toString();
        const routeName = routeMap.get(routeId) || "Unknown Route";
        const duration = calculateDuration(shift.shiftDate, shift.shiftEndDate);
        
        const shiftDate = new Date(shift.shiftDate);
        
        allShifts.push({
          shiftId: shift._id.toString(),
          routeId,
          routeName,
          date: shiftDate,
          duration,
          status: shift.status
        });
        
        shift.recurrences.forEach(recurrence => {
        const recurrenceDate = new Date(recurrence.date);
          
          
          allShifts.push({
            shiftId: shift._id.toString(),
            routeId,
            routeName,
            date: recurrenceDate,
            duration,
            status: recurrence.status
          });
        });
      });
      
     
      const recentShifts = allShifts
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 10)
        .map(shift => ({
          _id: shift.shiftId,
          name: shift.routeName,
          status: shift.status,
          time: shift.duration,
          date: shift.date 
        }));
      
      return recentShifts;
    } catch (error) {
      console.error("Failed to get recent shifts:", error);
      throw new Error("Failed to get recent shifts");
    }
}
  
  
function calculateDuration(startDate: Date, endDate: Date): number {
    return (endDate.getTime() - startDate.getTime()) / (1000 * 60);
}

