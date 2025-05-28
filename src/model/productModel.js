import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true },
    mrp: { type: Number, required: true },
    bulletPoint: { type: [String], required: true },
    quantity: { type: Number, required: true },
    stock: { type: Number, required: true },
    // category: { type: String, required: true },
    tag: { type: String, required: true },
    description: { type: String, required: true },
    subcategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    image: { type: String, required: false },
    sku: { type: String, required: false },
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const productModel = mongoose.model("products", productSchema);

const dailydealSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "products", required: true, },
    salePrice: { type: Number },
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true }
);
export const dailydealModels = mongoose.model("dailydeals", dailydealSchema);

import Joi from "joi";

export const productValidation = Joi.object({
  title: Joi.string().min(3).max(200).required().messages({
    "string.empty": "Title is required",
    "any.required": "Title is required",
  }),

  price: Joi.number().positive().required().messages({
    "number.base": "Price must be a number",
    "number.positive": "Price must be greater than 0",
    "any.required": "Price is required",
  }),

  mrp: Joi.number().positive().required().messages({
    "number.base": "MRP must be a number",
    "number.positive": "MRP must be greater than 0",
    "any.required": "MRP is required",
  }),

  bulletPoint: Joi.array()
    .items(Joi.string().trim().min(1).required())
    .required()
    .messages({
      "array.base": "Bullet points must be an array",
      "array.includes": "Each bullet point must be a non-empty string",
      "any.required": "Bullet points are required",
    }),

  quantity: Joi.number().integer().min(0).required().messages({
    "number.base": "Quantity must be a number",
    "number.integer": "Quantity must be an integer",
    "any.required": "Quantity is required",
  }),

  stock: Joi.number().integer().min(0).required().messages({
    "number.base": "Stock must be a number",
    "number.integer": "Stock must be an integer",
    "any.required": "Stock is required",
  }),

  subcategoryId: Joi.string().length(24).hex().required().messages({
    "string.base": "Category ID must be a string",
    "string.length": "Category ID must be exactly 24 characters",
    "string.hex": "Category ID must be a valid hex string",
    "any.required": "Category ID is required",
    "string.empty": "Category ID cannot be empty",
  }),

  tag: Joi.string().required().messages({
    "array.base": "Tags must be an array of strings",
    "any.required": "Tags are required",
  }),

  description: Joi.string().required().messages({
    "string.empty": "Description is required",
    "any.required": "Description is required",
  }),

  image: Joi.string()
    .pattern(/\.(jpg|jpeg|png|gif|webp)$/i)
    .optional()
    .messages({
      "string.pattern.base":
        "Image must be a valid image file (jpg, jpeg, png, gif, webp)",
    }),

  sku: Joi.string().optional(),

  isActive: Joi.boolean().default(true),

  isDelete: Joi.boolean().default(false),
});



export const dailyDealValidation = Joi.object({
  productId: Joi.string().required().messages({
    "string.base": "Product ID must be a string",
    "string.empty": "Product ID is required",
    "any.required": "Product ID is required",
  }),
  salePrice: Joi.number().min(0).required().messages({
    "number.base": "Sale price must be a number",
    "number.min": "Sale price must be at least 0",
    "any.required": "Sale price is required",
  }),
  isActive: Joi.boolean().optional(),
});

export const updateProductValidation = Joi.object({
  title: Joi.string().min(3).max(200).optional(),
  price: Joi.number().positive().optional(),
  mrp: Joi.number().positive().optional(),
  // bulletPoint: Joi.array().items(Joi.string().trim().min(1)).optional(),
  bulletPoint: Joi.array()
    .items(Joi.string().trim().min(1).required())
    .required()
    .messages({
      "array.base": "Bullet points must be an array",
      "array.includes": "Each bullet point must be a non-empty string",
      "any.required": "Bullet points are required",
    }),
  quantity: Joi.number().integer().min(0).optional(),
  stock: Joi.number().integer().min(0).optional(),
  subcategoryId: Joi.string().length(24).hex().optional(),
  tag: Joi.string().optional(),
  description: Joi.string().optional(),
  image: Joi.string().pattern(/\.(jpg|jpeg|png|gif|webp)$/i).optional(),
  sku: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
  isDelete: Joi.boolean().optional(),
  isSale: Joi.boolean().optional(),
  dailySalePrice: Joi.number().optional(),
});

// import mongoose from "mongoose";

// const subcategorySchema = new mongoose.Schema(
//   {
//     title: { type: String, required: true },
//     price: { type: Number, required: true },
//     mrp: { type: Number, required: true },
//     bulletPoint: { type: [String], required: true },
//     quantity: { type: Number, required: true },
//     stock: { type: Number, required: true },
//     tag: { type: String, required: true },
//     description: { type: String, required: true },
//     categoryId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Category", // ensure Category model exists
//       required: true,
//     },
//     image: { type: String, required: false },
//     sku: { type: String, required: false },
//     isActive: { type: Boolean, default: true },
//     isDelete: { type: Boolean, default: false },
//   },
//   { timestamps: true }
// );

// export const subcategoryModel = mongoose.model(
//   "subcategories",
//   subcategorySchema
// );
// import Joi from "joi";

// export const subcategoryValidation = Joi.object({
//   title: Joi.string().min(3).max(200).required().messages({
//     "string.empty": "Title is required",
//     "any.required": "Title is required",
//   }),

//   price: Joi.number().positive().required().messages({
//     "number.base": "Price must be a number",
//     "number.positive": "Price must be greater than 0",
//     "any.required": "Price is required",
//   }),

//   mrp: Joi.number().positive().required().messages({
//     "number.base": "MRP must be a number",
//     "number.positive": "MRP must be greater than 0",
//     "any.required": "MRP is required",
//   }),

//   bulletPoint: Joi.array()
//     .items(Joi.string().trim().min(1).required())
//     .required()
//     .messages({
//       "array.base": "Bullet points must be an array",
//       "array.includes": "Each bullet point must be a non-empty string",
//       "any.required": "Bullet points are required",
//     }),

//   quantity: Joi.number().integer().min(0).required().messages({
//     "number.base": "Quantity must be a number",
//     "number.integer": "Quantity must be an integer",
//     "any.required": "Quantity is required",
//   }),

//   stock: Joi.number().integer().min(0).required().messages({
//     "number.base": "Stock must be a number",
//     "number.integer": "Stock must be an integer",
//     "any.required": "Stock is required",
//   }),

//   categoryId: Joi.string().length(24).hex().required().messages({
//     "string.base": "Category ID must be a string",
//     "string.length": "Category ID must be exactly 24 characters",
//     "string.hex": "Category ID must be a valid hex string",
//     "any.required": "Category ID is required",
//     "string.empty": "Category ID cannot be empty",
//   }),

//   tag: Joi.string().required().messages({
//     "string.base": "Tag must be a string",
//     "any.required": "Tag is required",
//   }),

//   description: Joi.string().required().messages({
//     "string.empty": "Description is required",
//     "any.required": "Description is required",
//   }),

//   image: Joi.string()
//     .pattern(/\.(jpg|jpeg|png|gif|webp)$/i)
//     .optional()
//     .messages({
//       "string.pattern.base":
//         "Image must be a valid image file (jpg, jpeg, png, gif, webp)",
//     }),

//   sku: Joi.string().optional(),

//   isActive: Joi.boolean().default(true),

//   isDelete: Joi.boolean().default(false),
// });
