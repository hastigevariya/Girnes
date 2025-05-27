import mongoose from "mongoose";
import Joi from "joi";

const { Schema } = mongoose;

const orderSchema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    //userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
    orderId: { type: Number, required: true, unique: true },
    fname: { type: String, required: true },
    lname: { type: String, required: true },
    // items: [
    //   {
    //     productId: {
    //       type: Schema.Types.ObjectId,
    //       ref: "products",
    //       required: true,
    //     },
    //     quantity: { type: Number, required: true, min: 1 },
    //     price: { type: Number, required: true },
    //   },
    // ],
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: Number,
      },
    ],
    paymentMethod: { type: String, required: true },
    streetAddress: { type: [String], required: true },
    country: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: Number, required: true },
    shippingAddress: { type: [String] },
    mobile: { type: String, required: true },
    email: { type: String, required: true },
    shippingCharge: { type: String, required: true },
    totalAmount: { type: Number, required: true, min: 1 },
    orderNote: { type: String, required: true, min: 1 },
    status: { type: String, default: "Processing", required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const orderModel = mongoose.model("orders", orderSchema);

const itemValidation = Joi.object({
  productId: Joi.string().length(24).required().messages({
    "string.base": "Product ID must be a string",
    "string.length": "Product ID must be a valid 24-character ObjectId",
    "any.required": "Product ID is required",
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    "number.base": "Quantity must be a number",
    "number.integer": "Quantity must be an integer",
    "number.min": "Quantity must be at least 1",
    "any.required": "Quantity is required",
  }),
  price: Joi.number().min(0).required().messages({
    "number.base": "Price must be a number",
    "number.min": "Price cannot be negative",
    "any.required": "Price is required",
  }),
});

const orderValidation = Joi.object({
  orderId: Joi.number().optional(),
  fname: Joi.string().min(1).required(),
  lname: Joi.string().min(1).required(),
  cartItems: Joi.array().items(itemValidation).min(1).required(),
  paymentMethod: Joi.string().valid("cod").required(),
  streetAddress: Joi.array().items(Joi.string()).required(),
  country: Joi.string().min(1).required(),
  state: Joi.string().min(1).required(),
  pincode: Joi.number().min(1).required(),
  shippingAddress: Joi.array().items(Joi.string()).required(),
  mobile: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required(),
  email: Joi.string().email().required(),
  shippingCharge: Joi.string().required(),
  orderNote: Joi.string().optional(),
  status: Joi.string()
    .valid("Processing", "Shipped", "Delivered", "Cancelled")
    .default("Processing"),
  isActive: Joi.boolean().default(true),
});

const getOrderValidation = Joi.object({
  id: Joi.string().length(24).required().messages({
    "string.base": "Order ID must be a string",
    "string.empty": "Order ID is required",
    "string.length": "Order ID must be a valid 24-character ObjectId",
    "any.required": "Order ID is required",
  }),
});

export { orderModel, orderValidation, getOrderValidation };
