import { categoryModel, categoryValidation } from "../model/categoryModel.js";
import response from "../utils/response.js";
import { resStatusCode, resMessage } from "../utils/constants.js";
import mongoose from "mongoose";

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
  };
};

// getCategoryList
export async function getCategoryList(req, res) {
  try {
    const { error } = categoryValidation.validate(req.query);
    if (error) {
      return response.error(res, req.languageCode, resStatusCode.CLIENT_ERROR, error.details[0].message);
    };
    const { categoryId } = req.query;
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
  };
};

// updateCategory
export async function updateCategory(req, res) {
  const { categoryId } = req.params;
  const { name } = req.body;
  try {
    const { error } = categoryValidation.validate({ categoryId, name });
    if (error) {
      return response.error(res, req.languageCode, resStatusCode.CLIENT_ERROR, error.details[0].message);
    };
    const existing = await categoryModel.findById(categoryId);
    if (!existing) {
      return response.error(res, req.languageCode, resStatusCode.FORBIDDEN, resMessage.CATEGORY_NOT_FOUND);
    };
    existing.name = name || existing.name;
    const updatedCategory = await existing.save();
    return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.CATEGORY_UPDATED, updatedCategory);
  } catch (err) {
    console.error(err);
    return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
  };
};

// inActiveCategory
export async function inActiveCategory(req, res) {
  const { categoryId } = req.params;
  const { isActive } = req.body;

  try {
    const { error } = categoryValidation.validate({ categoryId, isActive });
    if (error) {
      return response.error(res, req.languageCode, resStatusCode.CLIENT_ERROR, error.details[0].message);
    };

    const existing = await categoryModel.findById(categoryId);
    if (!existing) {
      return response.error(res, req.languageCode, resStatusCode.FORBIDDEN, resMessage.CATEGORY_NOT_FOUND);
    };
    existing.isActive = isActive;
    const updatedCategory = await existing.save();
    const statusMessage = isActive ? "activated" : "inactivated";

    return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, `Category ${statusMessage} successfully`, updatedCategory);
  } catch (err) {
    console.error(err);
    return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
  };
};
