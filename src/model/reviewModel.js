// reviewModel.js
import mongoose from "mongoose";
import Joi from "joi";

const { Schema } = mongoose;

const reviewSchema = new Schema(
    {
        rating: { type: Number, required: true },
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
        name: { type: String, required: true },
        email: { type: String, required: true },
        comment: { type: String, required: true },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export const reviewModel = mongoose.model("reviews", reviewSchema);

export const reviewValidation = Joi.object({
    rating: Joi.number().min(1).max(5).required().messages({
        "number.base": "Rating must be a number",
        "number.min": "Rating must be at least 1",
        "number.max": "Rating cannot be more than 5",
        "any.required": "Rating is required",
    }),
    userId: Joi.string().hex().length(24).optional().messages({
        "string.base": "User ID must be a string",
        "string.hex": "User ID must be a valid ObjectId",
        "string.length": "User ID must be 24 characters long",
        "any.required": "User ID is required",
    }),
    productId: Joi.string().hex().length(24).required().messages({
        "string.base": "Product ID must be a string",
        "string.hex": "Product ID must be a valid ObjectId",
        "string.length": "Product ID must be 24 characters long",
        "any.required": "Product ID is required",
    }),
    name: Joi.string().min(2).max(50).required().messages({
        "string.base": "Name must be a string.",
        "string.empty": "Name cannot be empty.",
        "string.min": "Name must be at least 2 characters.",
        "string.max": "Name must be at most 50 characters.",
        "any.required": "Name is required.",
    }),
    email: Joi.string().email().required().messages({
        "string.base": "Email must be a string.",
        "string.email": "Email must be a valid email address.",
        "any.required": "Email is required.",
    }),
    comment: Joi.string().min(3).max(1000).required().messages({
        "string.base": "Comment must be a string",
        "string.empty": "Comment cannot be empty",
        "string.min": "Comment must be at least 3 characters",
        "string.max": "Comment must be at most 1000 characters",
        "any.required": "Comment is required",
    }),
    isActive: Joi.boolean().optional().messages({
        "boolean.base": "isActive must be a boolean value",
    }),
});

export const inActiveValidation = Joi.object({
    productId: Joi.string().hex().length(24).required().messages({
        "string.base": "Product ID must be a string",
        "string.hex": "Product ID must be a valid ObjectId",
        "string.length": "Product ID must be 24 characters long",
        "any.required": "Product ID is required",
    }),
    isActive: Joi.boolean().optional().messages({
        "boolean.base": "isActive must be a boolean value",
        "boolean.required": "required isActive true and false value",
        "string.empty": "isActive cannot be empty",
    }),
});
export default {
    reviewModel,
    reviewValidation,
    inActiveValidation,
};