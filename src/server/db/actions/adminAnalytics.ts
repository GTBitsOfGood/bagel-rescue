'use server'

import exp from "constants";
import dbConnect from "../dbConnect";
import { ShiftModel } from "../models/shift";
import Route from "../models/Route";
import User, { IUser } from "../models/User";
import adminAnalytics, { IAdminAnalytics } from "../models/adminAnalytics";
import { Types,  Error } from "mongoose";
import { act } from "react";
import { requireAdmin } from "../auth/auth";

export async function getNumberOfShiftsThisMonth(): Promise<number> {
    await requireAdmin();
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month+1, 0); 
    
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

export async function getNumberOfShiftsThisYear(): Promise<number> {
    await requireAdmin();
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
    await requireAdmin();
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
    await requireAdmin();
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
        
        const years = new Set<number>();
        let totalShifts = 0;
        
        shifts.forEach((shift) => {
            const shiftDate = new Date(shift.shiftDate);
            if (shiftDate >= twoYearsAgo) {
                years.add(shiftDate.getFullYear());
                totalShifts++; 
            }
            
            shift.recurrences.forEach((recurrence) => {
                const recurrenceDate = new Date(recurrence.date);
                if (recurrenceDate >= twoYearsAgo) {
                    years.add(recurrenceDate.getFullYear());
                    totalShifts++;
                }
            });
        });
        
        const numberOfYears = years.size;
        
        return numberOfYears > 0 ? totalShifts / numberOfYears : 0;
    } catch (error) {
        console.error("Failed to get average shifts per year:", error);
        throw new Error("Failed to get average shifts per year");
    }
}

export async function getTotalShiftDurationThisMonth(): Promise<number> {
    await requireAdmin();
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
    await requireAdmin();
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
    await requireAdmin();
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
    await requireAdmin();
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
    routeName: string; 
    shiftDate: Date;
    status: string;
    duration: number;
}
export async function getRecentShifts(): Promise<RecentShift[]> {
    await requireAdmin();
    try {
      await dbConnect();
      
      const shifts = await ShiftModel.find().lean();
      
      const routeIds = shifts.map(shift => shift.routeId);
      const routes = await Route.find({
        _id: { $in: routeIds }
      }).lean<{ _id: Types.ObjectId, routeName: string }[]>();
      
      const routeMap = new Map();
      routes.forEach(route => {
        routeMap.set(route._id.toString(), route.routeName);
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
        const routeName = routeMap.get(routeId) || "Broken Route";
        const duration = calculateDuration(shift.shiftDate, shift.shiftEndDate);
        
        const shiftDate = new Date(shift.shiftDate);
        
        allShifts.push({
            shiftId: shift._id.toString(),
            routeId: routeId.toString(), 
            date: shiftDate,
            duration,
            status: "complete",
            routeName: routeName
        });
        
        shift.recurrences.forEach(recurrence => {
        const recurrenceDate = new Date(recurrence.date);
          
          
          allShifts.push({
            shiftId: shift._id.toString(),
            routeId: routeId.toString(),
            routeName,
            date: recurrenceDate,
            duration,
            status: "complete"
          });
        });
      });
      
     
      const recentShifts = allShifts
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 10)
        .map(shift => ({
          _id: shift.shiftId,
          routeName: shift.routeName,
          status: shift.status,
          duration: shift.duration,
          shiftDate: shift.date 
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

export async function getNumberOfVolunteers(): Promise<number> {
    await requireAdmin();
    try {
        await dbConnect();

        const shiftCount = await User.countDocuments({isAdmin: false});
        return shiftCount;
    } catch (error) {
        console.error("Failed to get total number of volunteers:", error);
        throw new Error("Failed to get total number of volunteers");
    }
}

interface shiftCompleted {
    shiftId: string;
    timeTakenToComplete: number;
}

export async function getNumberOfActiveVolunteers(): Promise<number> {
    await requireAdmin();
    try {
        await dbConnect();
        const volunteers = await User.find().lean<IUser[]>();
        
        const activeChecks = volunteers.map(async (volunteer) => {
            if (!volunteer.shiftsCompleted || volunteer.shiftsCompleted.length === 0) {
                return false;
            }
            
            const idsOfShiftsCompleted = volunteer.shiftsCompleted
                .filter(shift => shift.shiftId)
                .map(shift => shift.shiftId);
                
            if (idsOfShiftsCompleted.length === 0) {
                return false;
            }
            
            const shiftsCompleted = await ShiftModel.find({
                _id: { $in: idsOfShiftsCompleted }
            }).lean();
            
            if (shiftsCompleted.length === 0) {
                return false;
            }
            
            const now = new Date();
            const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
            
            return shiftsCompleted.some(shift => {
                const shiftDate = new Date(shift.shiftEndDate);
                return shiftDate >= thirtyDaysAgo;
            });
        });
        
        const results = await Promise.all(activeChecks);
        
        const activeVolunteers = results.filter(isActive => isActive).length;
        
        console.log(`Found ${activeVolunteers} active volunteers out of ${volunteers.length} total.`);
        return activeVolunteers;
    } catch (error) {
        console.error("Failed to get number of active volunteers:", error);
        throw new Error("Failed to get number of active volunteers");
    }
}

export async function getNumberOfNewVolunteersThisMonth(): Promise<number> {
    await requireAdmin();
    try {
        await dbConnect();

        const date = new Date();
        const startDate = new Date(date.getFullYear(), date.getMonth(), 1); 
        const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0); 

        const newVolunteersCount = await User.countDocuments({
            isAdmin: false,
            createdAt: {
                $gte: startDate,
                $lte: endDate,
            },
        });

        return newVolunteersCount;
    } catch (error) {
        console.error("Failed to get number of new volunteers this month:", error);
        throw new Error("Failed to get number of new volunteers this month");
    }
}

export async function getNewVolunteersThisMonth(limit: number): Promise<any[]> {
    await requireAdmin();
    try {
        await dbConnect();

        const date = new Date();
        const startDate = new Date(date.getFullYear(), date.getMonth(), 1); 
        const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0); 

        const newVolunteers = await User.find({
            isAdmin: false,
            createdAt: {
                $gte: startDate,
                $lte: endDate,
            },
        })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        return newVolunteers;
    } catch (error) {
        console.error("Failed to get first 5 new volunteers this month:", error);
        throw new Error("Failed to get first 5 new volunteers this month");
    }
}

export async function getVolunteersWithMultipleShifts(limit: number): Promise<any[]> {
    await requireAdmin();
    try {
        await dbConnect();

        const volunteers = await User.aggregate([
            { $match: { isAdmin: false } },
            { $unwind: "$shiftsCompleted" },
            { $group: { _id: "$_id", count: { $sum: 1 } } },
            { $match: { count: { $gt: 1 } } },
            { $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "userDetails"
            }},
            { $project: { _id: 1, count: 1, userDetails: { $arrayElemAt: ["$userDetails", 0] } } }
        ]).limit(limit).exec();

        return volunteers.map(volunteer => ({
            ...volunteer.userDetails, 
            shiftsCount: volunteer.count 
        }));
    } catch (error) {
        console.error("Failed to get volunteers with multiple shifts:", error);
        throw new Error("Failed to get volunteers with multiple shifts");
    }
}

export async function updateAdminAnalytics(): Promise<void> {
    await requireAdmin();
    try {
        await dbConnect();
        

        const adminAnalyticsDoc = await adminAnalytics.findOne({});

        const [
            shiftsThisMonth,
            monthlyShiftAverage,
            shiftsThisYear,
            yearlyShiftsAverage,
            totalShiftDurationThisMonth,
            totalShiftDurationThisYear,
            averageShiftDurationThisMonth,
            averageShiftDurationThisYear,
            recentShifts,
            totalVolunteers,
            activeVolunteers,
            numberOfNewVolunteers,
            newVolunteersArray,
            volunteersWithMultipleShiftsArray
        ] = await Promise.all([
            getNumberOfShiftsThisMonth().catch(err => {
                console.error("Error fetching shifts this month:", err);
                return 0;
            }),
            getAverageNumberOfShiftsMonthly().catch(err => {
                console.error("Error fetching monthly shift average:", err);
                return 0;
            }),
            getNumberOfShiftsThisYear().catch(() => 0),
            getAverageNumberOfShiftsYearly().catch(() => 0),
            getTotalShiftDurationThisMonth().catch(() => 0),
            getTotalShiftDurationThisYear().catch(() => 0),
            getAverageShiftDurationMonthly().catch(() => 0),
            getAverageShiftDurationYearly().catch(() => 0),
            getRecentShifts().catch(() => []),
            getNumberOfVolunteers().catch(() => 0),
            getNumberOfActiveVolunteers().catch(() => 0),
            getNumberOfNewVolunteersThisMonth().catch(() => 0),
            getNewVolunteersThisMonth(5).catch(() => []),
            getVolunteersWithMultipleShifts(5).catch(() => [])
        ]);
        Object.assign(adminAnalyticsDoc, {
            shiftsThisMonth,
            monthlyShiftAverage,
            shiftsThisYear,
            yearlyShiftsAverage,
            totalShiftDurationThisMonth,
            totalShiftDurationThisYear,
            averageShiftDurationThisMonth,
            averageShiftDurationThisYear,
            recentShifts,
            totalVolunteers,
            activeVolunteers,
            numberOfNewVolunteers,
            newVolunteers: newVolunteersArray,
            volunteersWithMultipleShifts: volunteersWithMultipleShiftsArray,
            lastUpdatedAt: new Date()
        });
    
        console.log(activeVolunteers)
        await adminAnalyticsDoc.save();



        console.log("Admin analytics updated successfully.");
    } catch (error) {
        console.error("Failed to update admin analytics:", error);
        throw new Error("Failed to update admin analytics");
    }
}


export async function getAdminAnalytics(): Promise<string | null> {
    await requireAdmin();
    try {
        await dbConnect();

        const analytics = await adminAnalytics.findOne({}).lean<IAdminAnalytics>();

        return JSON.stringify(analytics);
    } catch (error) {
        console.error("Failed to get admin analytics:", error);
        throw new Error("Failed to get admin analytics");
    }
}