import express, { Request, Response } from "express";
import { Order, OrderStatus } from "../model/Order";
import {
  NotAuthorisedError,
  NotFoundError,
  requireAuth,
} from "@stantickets/common";
import { OrderCancelledPublisher } from "../event/publisher/OrderCancelledPublisher";
import { natsWrapper } from "../NatsWrapper";

const router = express.Router();

router.delete(
  "/api/orders/:orderId",
  requireAuth,
  async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate("ticket");

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorisedError();
    }

    order.status = OrderStatus.CANCELLED;

    await order.save();

    // TODO: pulish an event the order was cancelled
    new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    res.status(204).send(order);
  }
);

export { router as deleteOrderRouter };
