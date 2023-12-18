import mongoose from "mongoose";
import { app } from "./app";
import { DatabaseConnectionError } from "@stantickets/common";

const startUp = async () => {
  console.log("Starting up...");

  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be defined");
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be defined");
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
  } catch (err) {
    throw new DatabaseConnectionError();
  }
  console.log("Connected to database");

  app.listen(3000, () => {
    console.log("Listening on 3000");
  });
};

startUp();
