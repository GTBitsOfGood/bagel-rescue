'use server'

import { ObjectId } from 'mongoose';
import dbConnect from '../dbConnect';
import { Shift, ShiftModel } from '../models/shift';
import { Route } from '../models/route';

export async function getShift(shiftId: ObjectId): Promise<Shift | null> {
    try {
        await dbConnect();

        const data = await ShiftModel.findById(shiftId);
        return data;
    } catch (error) {
        const err = error as Error;
        console.error(`Error has occurred obtaining shift: ${err.message}`);
        return null;
    }
    
}

export async function updateRoute(shiftId: ObjectId, routeObject: Route): Promise<Shift | null> {
    try {
        await dbConnect();

        const data = await ShiftModel.findByIdAndUpdate(shiftId, {routeId: routeObject._id}, {new: true});
        return data;
    }
    catch (error) {
        const err = error as Error;
        console.error(`Error has occurred when updating routeId: ${err.message}`);
        return null;
    }

}

export async function updateDate(shiftId: ObjectId, newDate: Date): Promise<Shift | null> {
    try {
        await dbConnect();

        const data = await ShiftModel.findByIdAndUpdate(shiftId, {shiftDate: newDate}, {new: true});
        return data;
    } catch (error) {
        const err = error as Error;
        console.error(`Error has occurred when updating shiftDate: ${err.message}`);
        return null;
    }

}

export async function updateCapacity(shiftId: ObjectId, newCapacity: number): Promise<Shift | null> {
        
    try {
        await dbConnect();

        if (newCapacity < 0) {
            throw new Error('Capacity cannot be negative');
        }

        const data = await ShiftModel.findByIdAndUpdate(shiftId, {capacity: newCapacity}, {new: true});
        return data;
    } catch (error) {
        const err = error as Error;
        console.error(`Error has occurred when updating capacity: ${err.message}`);
        return null;
    }
}

export async function newSignUp(shiftId: ObjectId): Promise<boolean> {

    try {
        await dbConnect();

        const data = await getShift(shiftId);

        if (data && data.capacity !== data.currSignedUp) {
            data.currSignedUp += 1;
            await ShiftModel.findByIdAndUpdate(shiftId, data);
            return true;
        }

        return false;

    } catch (error) {
        const err = error as Error;
        console.error(`Error has occurred for newSignUp: ${err.message}`);
        return false;
    }
}