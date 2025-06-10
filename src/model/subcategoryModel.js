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
