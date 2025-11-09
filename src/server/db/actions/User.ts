"use server";

import mongoose from "mongoose";
import { ClientSession, UpdateQuery } from "mongoose";
import User, { IUser } from "../models/User";
import dbConnect from "../dbConnect";
import { requireUser } from "../auth/auth";

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
  id: mongoose.Types.ObjectId,
  session?: ClientSession
): Promise<IUser | null> {
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
  return document;
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
    const doc = await User.findOne(
      { newEmail: email },
      { __v: 0 },
      {
        session: session,
      }
    ).lean();

    if (!doc) {
      throw new Error("User with that email " + email + " does not exist");
    }

    return JSON.parse(JSON.stringify(doc));
  }
  return JSON.parse(JSON.stringify(document));
}

async function updateUser(
  id: mongoose.Types.ObjectId,
  updated: UpdateQuery<IUser>,
  session?: ClientSession
): Promise<IUser | null> {
  await requireUser();
  await dbConnect();

  const document = await User.findByIdAndUpdate(id, { $set: updated }, {
    projection: { __v: 0 },
    session: session,
  });
  if (!document) {
    throw new Error("User with that id " + id.toString() + " does not exist");
  }
  return document;
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
  updateUser,
  getUserStats,
  getAllUserStats,
  getTotalBagelsDelivered,
  getAllUsers,
};
