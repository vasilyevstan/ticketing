import express, { Request, Response } from "express";
import { body } from "express-validator";
import {
  requireAuth,
  validateRequest,
  BadRequestError,
  NotFoundError,
  NotAuthorisedError,
  OrderStatus,
} from "@stantickets/common";
import { Order } from "../model/Order";
import { stripe } from "../stripe";
import { Payment } from "../model/Payment";
import { PaymentCreatedPublisher } from "../event/publisher/PaymentCreatedPublisher";
import { natsWrapper } from "../NatsWrapper";

const router = express.Router();

router.post(
  "/api/payments",
  requireAuth,
  [body("token").not().isEmpty(), body("orderId").not().isEmpty()],
  validateRequest,
  async (req: Request, res: Response) => {
    const { orderId, token } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorisedError();
    }
    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestError("Order is already cancelled");
    }

    const charge = await stripe.charges.create({
      currency: "eur",
      amount: order.price * 100,
      source: token,
    });

    const payment = Payment.build({
      orderId: order.id,
      stripeId: charge.id,
    });

    await payment.save();

    await new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId,
    });

    res.status(201).send({ id: payment.id });
  }
);

export { router as createChargeRouter };
