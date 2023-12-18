import Queue from "bull";
import { ExpirationCompletePublisher } from "../event/publisher/ExpirationCompletePublisher";
import { natsWrapper } from "../NatsWrapper";

interface Payload {
  orderId: string;
}

const expirationQueue = new Queue<Payload>("order:expiration", {
  redis: {
    host: process.env.REDIS_HOST,
  },
});

expirationQueue.process(async (job) => {
  const publisher = new ExpirationCompletePublisher(natsWrapper.client).publish(
    {
      orderId: job.data.orderId,
    }
  );
});

export { expirationQueue };
