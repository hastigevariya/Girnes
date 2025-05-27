import Joi from "joi";
import mongoose from "mongoose";

const { Schema, model } = mongoose;

const bannerSchema = new Schema(
  {
    image: { type: String, required: true },
    isDelete: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const bannerModel = model("banners", bannerSchema);

const bannerValidation = Joi.object({
  image: Joi.string().required().messages({
    "string.base": "Image must be a string",
    "any.required": "Image is required",
  }),
  isDelete: Joi.boolean().default(false),
  isActive: Joi.boolean().default(true),
});

const bannerIdValidation = Joi.object({
  id: Joi.string().required().messages({
    "string.base": "Banner ID must be a string",
    "any.required": "Banner ID is required",
  }),
});

const bannerActiveValidation = Joi.object({
  id: Joi.string().required().messages({
    "string.base": "Banner ID must be a string",
    "any.required": "Banner ID is required",
  }),
  isActive: Joi.boolean().required().messages({
    "boolean.base": "isActive must be a boolean (true or false)",
    "any.required": "isActive is required",
  }),
});

export {
  bannerModel,
  bannerValidation,
  bannerIdValidation,
  bannerActiveValidation,
};
