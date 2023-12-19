import express from "express";
import "express-async-errors";
import { json } from "body-parser";

import cookieSession from "cookie-session";

import { logger, errorHandler, NotFoundError } from "@stantickets/common";

import { currentUserRouter } from "./route/current-user";
import { signinRouter } from "./route/signin";
import { signoutRouter } from "./route/signout";
import { signupRouter } from "./route/signup";

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

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

app.all("*", async (req, res, next) => {
  //next(new NotFoundError());
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
