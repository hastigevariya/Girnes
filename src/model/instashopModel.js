import mongoose from "mongoose";

const instaShopSchema = new mongoose.Schema(
    {
        image: { type: String, required: true },
        url: { type: String, required: true },
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

export const instaModel = mongoose.model("InstaShop", instaShopSchema);

import Joi from "joi";

export const addInstaShopValidation = Joi.object({
    image: Joi.string().uri().required().messages({
        "string.base": "Image must be a string",
        "string.uri": "Image must be a valid URL",
        "any.required": "Image is required"
    }),
    url: Joi.string().uri().required().messages({
        "string.base": "URL must be a string",
        "string.uri": "URL must be a valid URL",
        "any.required": "URL is required"
    }),
    isActive: Joi.boolean().optional().messages({
        "boolean.base": "isActive must be a boolean value"
    })
});
