import Joi from "joi";
import mongoose from "mongoose";

// Contact Schema
const contactSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        name: { type: String, required: true },
        email: { type: String, required: true },
        message: { type: String, required: true },
        inquiryType: { type: String, required: true },
        moq: { type: String },
    },
    { timestamps: true }
);

export const contactModel = mongoose.model("Contact", contactSchema);

// Contact Validation
export const contactValidation = Joi.object({
    // userId: Joi.string()
    //     .pattern(/^[0-9a-fA-F]{24}$/)
    //     .required()
    //     .messages({
    //         'string.pattern.base': 'Invalid userId: must be a valid MongoDB ObjectId',
    //         'any.required': 'User ID is required',
    //         'string.base': 'User ID must be a string'
    //     }),

    name: Joi.string().min(2).max(100).required().messages({
        'string.base': 'Name must be a string',
        'string.min': 'Name must be at least 2 characters long',
        'string.max': 'Name cannot exceed 100 characters',
        'any.required': 'Name is required'
    }),

    email: Joi.string().email().required().messages({
        'string.email': 'Email must be a valid email address',
        'any.required': 'Email is required'
    }),

    message: Joi.string().min(5).max(1000).required().messages({
        'string.min': 'Message must be at least 5 characters long',
        'string.max': 'Message cannot exceed 1000 characters',
        'any.required': 'Message is required'
    }),

    inquiryType: Joi.string().required().messages({
        'any.required': 'Inquiry type is required',
        'string.base': 'Inquiry type must be a string'
    }),

    moq: Joi.string().optional()
});
// Company Info Schema
const companyInfoSchema = new mongoose.Schema(
    {
        content: { type: String, required: true },
        address: { type: String, required: true },
        mobile: { type: String, required: true },
        email: { type: String, required: true, trim: true, lowercase: true },
    },
    { timestamps: true }
);

export const companyinfoModel = mongoose.model("company_info", companyInfoSchema);

// Company Info Validation
export const companyinfoValidation = Joi.object({
    content: Joi.string().max(200).required().messages({
        "string.base": "Content must be a string",
        "string.empty": "Content is required",
        "any.required": "Content is required",
    }),
    address: Joi.string().required().messages({
        "string.base": "Address must be a string",
        "string.empty": "Address is required",
        "any.required": "Address is required",
    }),
    mobile: Joi.string().required().messages({
        "string.empty": "Mobile/Phone Number is required",
        "any.required": "Mobile/Phone Number is required",
    }),
    email: Joi.string().email().required().messages({
        "string.email": "Invalid email format",
        "string.empty": "Email is required",
        "any.required": "Email is required",
    }),
});
