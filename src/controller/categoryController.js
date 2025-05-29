import { categoryModel, categoryValidation } from "../model/categoryModel.js";
import response from "../utils/response.js";
import { resStatusCode, resMessage } from "../utils/constants.js";
import mongoose from "mongoose";
import { productModel } from "../model/productModel.js";

// addCategory
export async function addCategory(req, res) {
  const { name } = req.body;
  const { error } = categoryValidation.validate(req.body);
  if (error) {
    return response.error(res, req.languageCode, resStatusCode.CLIENT_ERROR, error.details[0].message);
  };

  try {
    const existing = await categoryModel.findOne({ name });
    if (existing?.name) {
      return response.error(res, req.languageCode, resStatusCode.CONFLICT, resMessage.ALREADY_EXISTS, {});
    };

    const newCategory = await categoryModel.create({
      name,
    });

    return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.CATEGORY_CREATED, newCategory);
  } catch (error) {
    console.error(error);
    return response.error(res, req?.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
  }
};

// getCategoryList
export async function getCategoryList(req, res) {
  try {
    const { categoryId } = req.query;

    // Aggregate with $lookup to get subcategories
    const categories = await categoryModel.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(categoryId) },
      },
      {
        $lookup: {
          from: "subcategories",
          localField: "_id",
          foreignField: "categoryId",
          as: "subcategories",
        },
      },
    ]);

    return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.CATEGORY_LIST_FETCHED, categories);
  } catch (err) {
    console.error(err);
    return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
  }
};

// updateCategory
export async function updateCategory(req, res) {
  const { categoryId } = req.params;
  const { name } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return response.error(res, req.languageCode, resStatusCode.BAD_REQUEST, "Invalid category ID");
    }

    const existing = await categoryModel.findById(categoryId);
    if (!existing) {
      return response.error(res, req.languageCode, resStatusCode.NOT_FOUND, resMessage.CATEGORY_NOT_FOUND);
    }

    existing.name = name || existing.name;
    const updatedCategory = await existing.save();

    return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.CATEGORY_UPDATED, updatedCategory);
  } catch (err) {
    console.error(err);
    return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
  }
};
export async function inActiveCategory(req, res) {
  const { categoryId } = req.params;
  const { isActive } = req.body;

  // Optional: Validate isActive is boolean
  if (typeof isActive !== 'boolean') {
    return response.error(res, req.languageCode, resStatusCode.BAD_REQUEST, "`isActive` must be true or false");
  }

  try {
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return response.error(res, req.languageCode, resStatusCode.BAD_REQUEST, "Invalid category ID");
    }

    const existing = await categoryModel.findById(categoryId);
    if (!existing) {
      return response.error(res, req.languageCode, resStatusCode.NOT_FOUND, resMessage.CATEGORY_NOT_FOUND);
    }

    existing.isActive = isActive;
    const updatedCategory = await existing.save();

    const statusMessage = isActive ? "activated" : "inactivated";

    return response.success(
      res,
      req.languageCode,
      resStatusCode.ACTION_COMPLETE,
      `Category ${statusMessage} successfully`,
      updatedCategory
    );
  } catch (err) {
    console.error(err);
    return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
  }
}
