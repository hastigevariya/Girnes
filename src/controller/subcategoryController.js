import { subCategoryModel, subCategoryValidation, } from "../model/subcategoryModel.js";
import response from "../utils/response.js";
import { resStatusCode, resMessage } from "../utils/constants.js";

// Add SubCategory
export async function addSubCategory(req, res) {
  const { error } = subCategoryValidation.validate(req.body);
  if (error) {
    return response.error(res, req.languageCode, resStatusCode.CLIENT_ERROR, error.details[0].message);
  };
  try {
    const { name, categoryId } = req.body;
    const existing = await subCategoryModel.findOne({ name, categoryId });
    if (existing) {
      return response.error(res, req.languageCode, resStatusCode.CONFLICT, resMessage.ALREADY_EXISTS);
    };
    const lastCategory = await subCategoryModel.findOne().sort({ subcategoryNum: -1 });
    const newCategoryId = typeof lastCategory?.subcategoryNum === 'number' ? lastCategory.subcategoryNum + 1 : 101;

    const newSubCategory = await subCategoryModel.create({ name, categoryId, subcategoryNum: newCategoryId });
    return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.SUBCATEGORY_CREATED || resMessage.ACTION_COMPLETE, newSubCategory);
  } catch (err) {
    console.error(err);
    return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
  };
};

// Get SubCategory List
export async function getSubCategoryList(req, res) {
  try {
    const { error } = subCategoryValidation.validate(req.query);
    if (error) {
      return response.error(res, req.languageCode, resStatusCode.CLIENT_ERROR, error.details[0].message);
    };
    const subCategories = await subCategoryModel.find().populate("categoryId", "name") // Show category name instead of just id.select("name categoryId isActive createdAt updatedAt");

    return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.SUBCATEGORY_LIST_FETCHED || resMessage.ACTION_COMPLETE, subCategories);
  } catch (err) {
    console.error(err);
    return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
  };
};

// Update SubCategory
export async function updateSubCategory(req, res) {
  const { subCategoryId } = req.params;
  const { name, categoryId } = req.body;
  if (!subCategoryId || !name || !categoryId) {
    return response.error(res, req.languageCode, resStatusCode.CLIENT_ERROR,);
  };
  try {
    const updatedSubCategory = await subCategoryModel.findByIdAndUpdate(
      subCategoryId,
      { name, categoryId },
      { new: true }
    );
    if (!updatedSubCategory) {
      return response.error(res, req.languageCode, resStatusCode.FORBIDDEN, resMessage.NOT_FOUND);
    };
    return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.SUBCATEGORY_UPDATED, updatedSubCategory);
  } catch (err) {
    console.error(err);
    return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
  };
};

// inActiveSubCategory
export const inActiveSubCategory = async (req, res) => {
  const { subCategoryId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(subCategoryId)) {
    return response.error(res, req.languageCode, resStatusCode.CLIENT_ERROR, resMessage.INVALID_SUBCATEGORY_ID || resMessage.INVALID_SUBCATEGORY_ID);
  };
  try {
    const updated = await subCategoryModel.findByIdAndUpdate(subCategoryId, { isActive: true }, { new: true });
    if (!updated) {
      return response.error(res, req.languageCode, resStatusCode.FORBIDDEN, resMessage.NOT_FOUND);
    };
    return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.SUBCATEGORY_ACTIVATED, updated);
  } catch (err) {
    console.error(err);
    return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
  };
};
