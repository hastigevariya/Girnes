import mongoose from "mongoose";
import Joi from "joi";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const categoryModel = mongoose.model("Category", categorySchema);

export const categoryValidation = Joi.object({
  name: Joi.string().min(2).max(50).required(),

  isActive: Joi.boolean().optional(),
});

export const categoryInActiveValidation = Joi.object({
  id: Joi.string().min(3).max(100).required().messages({
    'string.base': 'Category ID must be a text value.',
    'string.empty': 'Category ID is required and cannot be empty.',
    'string.min': 'Category ID must be at least 3 characters long.',
    'string.max': 'Category ID cannot be longer than 100 characters.',
    'any.required': 'Category ID is required.',
  }),
  isActive: Joi.boolean().valid(true, false).default(true).messages({
    'boolean.base': 'isActive must be either true or false.',
    'any.only': 'isActive must be either true or false.'
  }),
});

export default {
  categoryModel,
  categoryValidation,
  // categoryIdValidation,
  categoryInActiveValidation
};
