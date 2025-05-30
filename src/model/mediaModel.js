import Joi from "joi";
import mongoose from "mongoose";

const { Schema } = mongoose;

// Media Schema
const mediaSchema = new Schema(
  {
    file: { type: String, required: true },
    type: { type: String, required: true },
    isDelete: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const mediaModel = mongoose.model("medias", mediaSchema);

// Media Validation
const mediaValidation = Joi.object({
  image: Joi.array()
    .items(
      Joi.string().required().messages({
        "string.base": "Each file must be a string.",
        "any.required": "File name is required.",
      })
    )
    .min(1)
    .required()
    .messages({
      "array.base": "Files must be an array.",
      "array.min": "At least one file is required.",
      "any.required": "Files are required.",
    }),
  type: Joi.string().optional().messages({
    "any.only": 'Type must be either "image" or "video".',
    "any.required": "Type is required.",
  }),
  isDelete: Joi.boolean().default(false),
  isActive: Joi.boolean().default(true),
});

// Video Validation
const videoValidation = Joi.object(
  {
    vdoUrl: Joi.string().uri().min(1).required().messages({
      "string.base": "Video URL must be a valid string.",
      "string.empty": "Video URL cannot be empty.",
      "string.min": "Video URL must be at least 1 character long.",
      "any.required": "Video URL is required.",
    }),
    type: Joi.string().optional().messages({
      "any.only": 'Type must be either "image" or "video".',
      "any.required": "Type is required when specified.",
    }),
    isDelete: Joi.boolean().default(false).messages({
      "boolean.base": "Delete flag must be a boolean value.",
    }),
    isActive: Joi.boolean().default(true).messages({
      "boolean.base": "Active flag must be a boolean value.",
    }),
  },
  { timestamps: true }
);

// Media ID Validation
const mediaIdValidation = Joi.object({
  id: Joi.string().required().messages({
    "string.base": "Banner ID must be a string",
    "any.required": "Banner ID is required",
  }),
});

// Media Active Validation
const mediaActiveValidation = Joi.object({
  id: Joi.string().required().messages({
    "string.base": "Banner ID must be a string",
    "any.required": "Banner ID is required",
  }),
  isActive: Joi.boolean().required().messages({
    "boolean.base": "isActive must be a boolean (true or false)",
    "any.required": "isActive is required",
  }),
});

// Social Account Schema
const socialAccountSchema = new mongoose.Schema({
  facebook: { type: String },
  instagram: { type: String },
  linkedin: { type: String },
  twitter: { type: String },
  isActive: { type: Boolean, default: true },
});

const socialAccountModel = mongoose.model(
  "social_accounts",
  socialAccountSchema
);

// Social Account Validation
const socialAccountValidation = Joi.object({
  facebook: Joi.string().optional().messages({
    "string.base": "Facebook link must be a valid string.",
    "string.empty": "Facebook link cannot be empty.",
    "any.required": "Facebook link is required.",
  }),
  instagram: Joi.string().optional().messages({
    "string.base": "Instagram handle must be a valid string.",
    "string.empty": "Instagram handle cannot be empty.",
    "any.required": "Instagram handle is required.",
  }),
  linkedin: Joi.string().optional().messages({
    "string.base": "LinkedIn profile must be a valid string.",
    "string.empty": "LinkedIn profile cannot be empty.",
    "any.required": "LinkedIn profile is required.",
  }),
  twitter: Joi.string().optional().messages({
    "string.base": "Twitter handle must be a valid string.",
    "string.empty": "Twitter handle cannot be empty.",
    "any.required": "Twitter handle is required.",
  }),
  isActive: Joi.boolean().default(true),
});

// Exporting (ES6)
export {
  mediaModel,
  mediaValidation,
  videoValidation,
  mediaIdValidation,
  mediaActiveValidation,
  socialAccountModel,
  socialAccountValidation,
};
