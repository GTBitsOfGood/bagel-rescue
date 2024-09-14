import mongoose from "mongoose";
import { ClientSession, UpdateQuery } from "mongoose";
import User, { IUser } from "../models/User";

export type UserStats = {
  bagelsDelivered: number;
  totalDeliveries: number;
};

async function createUser(
  newUser: IUser,
  session?: ClientSession
): Promise<IUser> {
  if (!newUser.bagelsDelivered) {
    newUser.bagelsDelivered = 0;
  }
  if (!newUser.totalDeliveries) {
    newUser.totalDeliveries = 0;
  }

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

async function updateUser(
  id: mongoose.Types.ObjectId,
  updated: UpdateQuery<IUser>,
  session?: ClientSession
): Promise<IUser | null> {
  const document = await User.findByIdAndUpdate(id, updated, {
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

export { createUser, getUser, updateUser, getUserStats };
