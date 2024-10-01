import { createShift, newSignUp, updateCapacity, updateDate } from "@/server/db/actions/shift";
import { ShiftModel } from "@/server/db/models/shift";

export async function POST(req: Request, res: Response) {
    try {
        const params = await req.json();
        const date = new Date(params.shiftDate);
        // const data = await updateDate(params.shiftId, new Date(date.getTime() - date.getTimezoneOffset() * 60000));
        // const data = await updateCapacity(params.shiftId, params.capacity);
        // const data = await newSignUp(params.shiftId, new Date(date.getTime() - date.getTimezoneOffset() * 60000));
        const data = await createShift(new ShiftModel(params));
        return Response.json({ data });
    } catch (error) {
        const err = error as Error;
        return Response.json({ error: err.message });
    }

}