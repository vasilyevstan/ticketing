import { Document, Model, Schema, model } from "mongoose";

// interface that describes the properties of an Payment
interface IPayment {
  orderId: string;
  stripeId: string;
}

// interface to describe properties ofa Payment model
interface IPaymentModel extends Model<IPaymentDocument> {
  build(attributes: IPayment): IPaymentDocument;
}

// interface describes the properties of the document Orderodel has
interface IPaymentDocument extends Document {
  orderId: string;
  stripeId: string;
}

const paymentSchema = new Schema(
  {
    orderId: {
      type: String,
      required: true,
    },
    stripeId: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      // view logic in model - not good approach
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        // delete ret.__v;
      },
      versionKey: false,
    },
  }
);

paymentSchema.statics.build = (attributes: IPayment) => {
  return new Payment({
    orderId: attributes.orderId,
    stripeId: attributes.stripeId,
  });
};

const Payment = model<IPaymentDocument, IPaymentModel>(
  "Payment",
  paymentSchema
);

export { Payment };
