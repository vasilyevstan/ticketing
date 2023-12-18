import { Document, Model, Schema, model } from "mongoose";
import { OrderStatus } from "@stantickets/common";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

export { OrderStatus };

// interface that describes the properties of an Order
interface IOrder {
  id: string;
  version: number;
  userId: string;
  status: OrderStatus;
  price: number;
}

// interface to describe properties ofa Order model
interface IOrderModel extends Model<IOrderDocument> {
  build(attributes: IOrder): IOrderDocument;
}

// interface describes the properties of the document Orderodel has
interface IOrderDocument extends Document {
  version: number;
  userId: string;
  status: OrderStatus;
  price: number;
}

const orderSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.CREATED,
    },
    price: {
      type: Number,
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

orderSchema.set("versionKey", "version");
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attributes: IOrder) => {
  return new Order({
    _id: attributes.id,
    version: attributes.version,
    price: attributes.price,
    userId: attributes.userId,
    status: attributes.status,
  });
};

const Order = model<IOrderDocument, IOrderModel>("Order", orderSchema);

export { Order };
