import express, { Request, Response } from "express";
import { Ticket } from "../model/Ticket";
import { body } from "express-validator";
import { natsWrapper } from "../NatsWrapper";
import {
  requireAuth,
  validateRequest,
  NotFoundError,
  NotAuthorisedError,
  BadRequestError,
} from "@stantickets/common";
import { TicketUpdatedPublisher } from "../event/publisher/TicketUpdatedPublisher";

const router = express.Router();

router.put(
  "/api/tickets/:id",
  requireAuth,
  [
    body("title").not().isEmpty().withMessage("Title is required"),
    body("price")
      .isFloat({ gt: 0 })
      .withMessage("Price must be provided and greater than zero"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      throw new NotFoundError();
    }

    if (ticket.userId !== req.currentUser!.id) {
      throw new NotAuthorisedError();
    }

    if (ticket.orderId) {
      throw new BadRequestError("Ticket is already locked");
    }

    ticket.set({
      title: req.body.title,
      price: req.body.price,
    });

    await ticket.save();

    new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
    });

    res.send(ticket);
  }
);

export { router as updateTicketRouter };
