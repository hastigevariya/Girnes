import Joi from "joi";
import mongoose, { model } from "mongoose";
const { Schema } = mongoose;

const userRegisterSchema = new Schema(
  {
    fname: { type: String, required: true },
    lname: { type: String, default: "" },
    email: { type: String, required: true },
    mobile: { type: String, default: "" },
    password: { type: String, default: "" },
    gender: { type: String, default: "" },
    profilePhoto: { type: String, default: "" },
    address: { type: String, default: "" },
    country: { type: String, default: "" },
    state: { type: String, default: "" },
    pinCode: { type: String },
    fcm: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    role: { type: String, required: true, default: "user" },
  },
  { timestamps: true }
);

export const userModel = model("users", userRegisterSchema);

// register
export const userRegisterValidation = Joi.object({
  fname: Joi.string().required().messages({
    "string.base": "First name must be a string",
    "string.empty": "First name is required",
    "any.required": "First name is required",
  }),
  lname: Joi.string().optional().messages({
    "string.base": "Last name must be a string",
  }),
  email: Joi.string().email().trim().lowercase().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(6).max(30).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters",
    "any.required": "Password is required",
  }),
  isActive: Joi.boolean().default(true),
});

// login
export const userLoginValidation = Joi.object({
  email: Joi.string().email().trim().lowercase().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(6).max(30).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters",
    "any.required": "Password is required",
  }),
});

const emailShopNowButtonSchema = new Schema({
  url: { type: String, required: true },
  image: { type: [String], default: [] },
  for: { type: String, default: "" },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const shopNowEmailButtonModel = mongoose.model('email_sends', emailShopNowButtonSchema);

export default {
  userModel,
  userRegisterValidation,
  userLoginValidation,
  shopNowEmailButtonModel,
};
