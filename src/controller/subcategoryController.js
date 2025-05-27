import {
  subCategoryModel,
  subCategoryValidation,
} from "../model/subcategoryModel.js";
import response from "../utils/response.js";
import { resStatusCode, resMessage } from "../utils/constants.js";

// Add SubCategory
export async function addSubCategory(req, res) {
  const { error } = subCategoryValidation.validate(req.body);
  if (error) {
    return response.error(
      res,
      req.languageCode,
      resStatusCode.CLIENT_ERROR,
      error.details[0].message
    );
  }

  try {
    const { name, categoryId } = req.body;

    const existing = await subCategoryModel.findOne({ name, categoryId });
    if (existing) {
      return response.error(
        res,
        req.languageCode,
        resStatusCode.CONFLICT,
        resMessage.ALREADY_EXISTS
      );
    }

    const newSubCategory = await subCategoryModel.create({
      name,
      categoryId,
    });

    return response.success(
      res,
      req.languageCode,
      resStatusCode.ACTION_COMPLETE,
      resMessage.SUBCATEGORY_CREATED || resMessage.ACTION_COMPLETE,
      newSubCategory
    );
  } catch (err) {
    console.error(err);
    return response.error(
      res,
      req.languageCode,
      resStatusCode.INTERNAL_SERVER_ERROR,
      resMessage.INTERNAL_SERVER_ERROR
    );
  }
}

// Get SubCategory List
export async function getSubCategoryList(req, res) {
  try {
    const subCategories = await subCategoryModel
      .find()
      .populate("categoryId", "name") // Show category name instead of just id
      .select("name categoryId isActive createdAt updatedAt");

    return response.success(
      res,
      req.languageCode,
      resStatusCode.ACTION_COMPLETE,
      resMessage.SUBCATEGORY_LIST_FETCHED || resMessage.ACTION_COMPLETE,
      subCategories
    );
  } catch (err) {
    console.error(err);
    return response.error(
      res,
      req.languageCode,
      resStatusCode.INTERNAL_SERVER_ERROR,
      resMessage.INTERNAL_SERVER_ERROR
    );
  }
}
