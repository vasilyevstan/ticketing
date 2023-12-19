import express from "express";
import "express-async-errors";
import { json } from "body-parser";

import cookieSession from "cookie-session";

import {
  logger,
  errorHandler,
  NotFoundError,
  currentUser,
} from "@stantickets/common";
import { createChargeRouter } from "./route/new";

const app = express();
app.set("trust proxy", true);
app.use(logger);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: false,
    // secure: process.env.NODE_ENV !== "test",
  })
);
// after cookie session
app.use(currentUser);

//routes
app.use(createChargeRouter);

app.all("*", async (req, res, next) => {
  console.log("whooops");
  //next(new NotFoundError());
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
