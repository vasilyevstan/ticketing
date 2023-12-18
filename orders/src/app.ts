import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import { deleteOrderRouter } from "./route/delete";
import { indexOrderRouter } from "./route";
import { newOrderRouter } from "./route/new";
import { showOrderRouter } from "./route/show";

import cookieSession from "cookie-session";

import {
  logger,
  errorHandler,
  NotFoundError,
  currentUser,
} from "@stantickets/common";

const app = express();
app.set("trust proxy", true);
app.use(logger);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test",
  })
);
// after cookie session
app.use(currentUser);

app.use(deleteOrderRouter);
app.use(indexOrderRouter);
app.use(newOrderRouter);
app.use(showOrderRouter);

app.all("*", async (req, res, next) => {
  console.log("whooops");
  //next(new NotFoundError());
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
