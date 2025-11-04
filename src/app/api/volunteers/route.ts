import { NextResponse } from "next/server";
import { getVolunteerManagementData } from "@/server/db/actions/User";

export async function GET() {
  try {
    const response = await getVolunteerManagementData();
    const data = JSON.parse(response);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch volunteer data"},
      { status: 500 }
    )
  }
}