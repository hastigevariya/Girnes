import mongoose from "mongoose";
import Joi from "joi";

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subcategoryNum: {
      type: Number,
      require: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const subCategoryModel = mongoose.model(
  "SubCategory",
  subCategorySchema
);

export const subCategoryValidation = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  categoryId: Joi.string().required(),
  isActive: Joi.boolean().optional(),
});

const subCategoryIdValidation = Joi.object({
  id: Joi.string().min(3).max(100).required().messages({
    'string.base': 'Category ID must be a text value.',
    'string.empty': 'Category ID is required and cannot be empty.',
    'string.min': 'Category ID must be at least 3 characters long.',
    'string.max': 'Category ID cannot be longer than 100 characters.',
    'any.required': 'Category ID is required.',
  }),
});

const inActiveSubCategoryValidation = Joi.object({
  isActive: Joi.boolean().valid(true, false).default(true).messages({
    'boolean.base': 'isActive must be either true or false.',
    'any.only': 'isActive must be either true or false.'
  })
});

export default {
  subCategoryModel,
  subCategoryValidation,
  subCategoryIdValidation,
  inActiveSubCategoryValidation
};