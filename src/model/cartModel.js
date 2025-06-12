import mongoose from "mongoose";
import Joi from "joi";

const { Schema } = mongoose;

const cartSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "products",
    required: true,
  },
  quantity: { type: Number, required: true, default: 1 },
  isDelete: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
});
const cartModel = mongoose.model("cart", cartSchema);

const cartValidation = Joi.object({
  productId: Joi.string().length(24).required().messages({
    "string.base": "Product ID must be a string",
    "string.length": "Product ID must be a valid 24-character ObjectId",
    "any.required": "Product ID is required",
  }),
  quantity: Joi.number().integer().messages({
    "number.base": "Quantity must be a number",
    "number.min": "Quantity must be at least 1",
  }),
  isDelete: Joi.boolean().default(false),
  isActive: Joi.boolean().default(true),
});

const updateCartValidation = Joi.object({
  quantity: Joi.number().integer().min(1).required().messages({
    "number.base": "Quantity must be a number",
    "number.min": "Quantity must be at least 1",
    "any.required": "Quantity is required",
  }),

  isActive: Joi.boolean().default(true),
});

export { cartModel, cartValidation, updateCartValidation };
