import Joi from "joi";
import mongoose from "mongoose";

const { Schema } = mongoose;

const wishlistItemSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products",
      required: true,
    },
    isCart: { type: Boolean },
    isDelete: { type: Boolean, default: false },
  },
  { _id: true }
);

// const wishlistSchema = new Schema(
//   {
//     userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
//     items: [wishlistItemSchema],
//     isActive: { type: Boolean, default: true },
//   },
//   { timestamps: true }
// );

export const wishlistModel = mongoose.model("wishlist", wishlistItemSchema);

export const wishlistActionValidation = Joi.object({
  productId: Joi.string().length(24).required().messages({
    "string.base": "Product ID must be a string",
    "string.length": "Product ID must be a valid 24-character ObjectId",
    "any.required": "Product ID is required",
  }),
});
