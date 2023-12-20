import express, { Request, Response } from "express";
import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from "@stantickets/common";
import { body } from "express-validator";
import mongoose from "mongoose";
import { Order } from "../model/Order";
import { Ticket } from "../model/Ticket";
import { OrderCreatedPublisher } from "../event/publisher/OrderCreatedPublisher";
import { natsWrapper } from "../NatsWrapper";

// minutes
const EXPIRATION_INTERVAL = 10 * 60;

const router = express.Router();

router.post(
  "/api/orders",
  requireAuth,
  [
    body("ticketId")
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage("TicketId must be provided"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;

    // find the ticket
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError();
    }

    // make sure ticket is not reserved
    const isReserved = await ticket.isReserved();
    if (isReserved) {
      throw new BadRequestError("Ticket is already reserved");
    }

    // calculate expiration date for the order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_INTERVAL);

    // build and save the order
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.CREATED,
      expiresAt: expiration,
      ticket,
    });
    await order.save();

    // emit an event
    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
    });

    res.status(201).send(order);
  }
);

export { router as newOrderRouter };
