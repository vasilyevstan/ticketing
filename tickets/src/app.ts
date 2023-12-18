import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import { createTicketRouter } from "./route/new";
import { showTicketRouter } from "./route/show";
import { indexTicketRouter } from "./route/index";
import { updateTicketRouter } from "./route/update";

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

app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(indexTicketRouter);
app.use(updateTicketRouter);

app.all("*", async (req, res, next) => {
  console.log("whooops");
  //next(new NotFoundError());
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
