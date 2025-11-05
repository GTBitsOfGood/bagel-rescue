"use server";

import mongoose from "mongoose";
import { ClientSession, UpdateQuery } from "mongoose";
import User, { IUser } from "../models/User";
import dbConnect from "../dbConnect";
import { requireUser } from "../auth/auth";
import { UserShiftModel } from "../models/userShift";

export type UserStats = {
  bagelsDelivered: number;
  totalDeliveries: number;
};

async function createUser(
  newUser: IUser,
  session?: ClientSession
): Promise<IUser> {
  // if (!newUser.bagelsDelivered) {
  //   newUser.bagelsDelivered = 0;
  // }
  if (!newUser.totalDeliveries) {
    newUser.totalDeliveries = 0;
  }

  await dbConnect();

  const document = new User(newUser);
  const {
    _doc: { _id, __v, ...userDocument },
  } = await document.save({ session });
  userDocument._id = _id;
  return userDocument;
}

async function getUser(
  id: string,
  session?: ClientSession
): Promise<IUser | null> {
  await requireUser();
  await dbConnect();

  const userId = new mongoose.Types.ObjectId(id);

  const document = await User.findById(
    userId,
    { __v: 0 },
    {
      session: session,
    }
  ).lean<IUser>();
  if (!document) {
    throw new Error("User with that id " + id + " does not exist");
  }
  return JSON.parse(JSON.stringify(document));
}

async function getUserByEmail(
  email: string,
  session?: ClientSession
): Promise<IUser | null> {
  // await requireUser();
  await dbConnect();

  const document = await User.findOne(
    { email: email },
    { __v: 0 },
    {
      session: session,
    }
  ).lean();
  if (!document) {
    throw new Error("User with that email " + email + " does not exist");
  }
  return JSON.parse(JSON.stringify(document));
}

async function getUserByActivationToken(
  token: string,
  session?: ClientSession
): Promise<IUser | null> {
  // await requireUser();
  await dbConnect();

  const document = await User.findOne(
    { activationToken: token },
    { __v: 0 },
    {
      session: session,
    }
  ).lean<IUser>();
  if (!document) {
    throw new Error(
      "User with that activation token " + token + " does not exist"
    );
  }
  return JSON.parse(JSON.stringify(document));
}

async function updateUser(
  id: string,
  updated: UpdateQuery<IUser>,
  session?: ClientSession
): Promise<IUser | null> {
  // await requireUser();
  await dbConnect();

  const userId = new mongoose.Types.ObjectId(id);

  const document = await User.findByIdAndUpdate(userId, updated, {
    projection: { __v: 0 },
    session: session,
  });
  if (!document) {
    throw new Error("User with that id " + id + " does not exist");
  }
  return document;
}

async function getUsersPerShift(
  shiftId: string,
  session?: ClientSession
): Promise<IUser[]> {
  await requireUser();
  await dbConnect();
  try {
    const documents = await UserShiftModel.aggregate([
      {
        $match: { shiftId: new mongoose.Types.ObjectId(shiftId) }, // filter by the specific shift
      },
      {
        $lookup: {
          from: "users", // collection to join
          localField: "userId", // field from usershifts
          foreignField: "_id", // field from users
          as: "userInfo", // output field
        },
      },
      {
        $unwind: "$userInfo", // flatten the user array
      },
      {
        $replaceRoot: { newRoot: "$userInfo" }, // return just user objects
      },
    ]);
    return documents;
  } catch (error) {
    console.error("Error fetching users per shift:", error);
    throw new Error("Failed to fetch users per shift");
  }
}

async function getUserStats(
  id: mongoose.Types.ObjectId,
  session?: ClientSession
): Promise<UserStats | null> {
  await requireUser();
  await dbConnect();

  const document = await User.findById(
    id,
    { __v: 0 },
    {
      session: session,
    }
  );
  if (!document) {
    throw new Error("User with that id " + id.toString() + " does not exist");
  }
  return {
    bagelsDelivered: document.bagelsDelivered,
    totalDeliveries: document.totalDeliveries,
  };
}

async function getAllUserStats(): Promise<string | null> {
  await requireUser();
  await dbConnect();

  const documents = await User.find(
    {},
    { firstName: 1, lastName: 1, bagelsDelivered: 1, totalDeliveries: 1 }
  );
  return JSON.stringify(documents);
}

async function getTotalBagelsDelivered(): Promise<number | null> {
  await requireUser();
  await dbConnect();

  const totalBagelsDelivered = await User.aggregate([
    { $group: { _id: null, total: { $sum: "$bagelsDelivered" } } },
  ]);
  return totalBagelsDelivered[0]?.total || 0;
}

async function getAllUsers(): Promise<string> {
  try {
    await dbConnect();
    const users = await User.find({}).select("firstName lastName email");
    return JSON.stringify(users);
  } catch (error) {
    console.error("Error fetching all users:", error);
    return JSON.stringify([]);
  }
}

export {
  createUser,
  getUser,
  getUserByEmail,
  getUserByActivationToken,
  updateUser,
  getUserStats,
  getAllUserStats,
  getTotalBagelsDelivered,
  getAllUsers,
  getUsersPerShift,
};
