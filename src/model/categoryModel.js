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
    // description: {
    //   type: String,
    //   default: "",
    // },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const categoryModel = mongoose.model("Category", categorySchema);

// Validation schema for creating/updating category
export const categoryValidation = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  //description: Joi.string().allow("").optional(),
  isActive: Joi.boolean().optional(),
});

// import mongoose from "mongoose";
// import Joi from "joi";

// const productSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       unique: true,
//       trim: true,
//     },
//     // description: {
//     //   type: String,
//     //   default: "",
//     // },
//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//   },
//   { timestamps: true }
// );

// export const productModel = mongoose.model("Product", productSchema);

// // Validation schema for creating/updating product
// export const productValidation = Joi.object({
//   name: Joi.string().min(2).max(50).required(),
//   // description: Joi.string().allow("").optional(),
//   isActive: Joi.boolean().optional(),
// });
