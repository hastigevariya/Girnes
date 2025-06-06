import { wishlistModel, wishlistActionValidation, } from "../model/wishlistModel.js";
import response from "../utils/response.js";
import { resStatusCode, resMessage } from "../utils/constants.js";
import { cartModel } from "../model/cartModel.js";

// addWishlist
export const addWishlist = async (req, res) => {
  const { productId } = req.body;
  const userId = req.user.id;
  const { error } = wishlistActionValidation.validate({ productId });
  if (error) {
    return response.error(res, req.languageCode, resStatusCode.CLIENT_ERROR, error.details[0].message);
  };
  try {
    let checkWishList = await wishlistModel.findOne({ userId, productId });
    if (
      checkWishList?.productId == productId &&
      checkWishList?.userId == userId
    ) {
      return response.error(res, req.languageCode, resStatusCode.FORBIDDEN, resMessage.ALREADY_EXISTS);
    } else {
      let checkCart = await cartModel.findOne({ userId, productId });
      const addWishlist = await wishlistModel.create({ userId, productId, isCart: !!checkCart, });
      return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.WISHLIST_ADDED, addWishlist);
    };
  } catch (err) {
    console.error("addWishlist error:", err);
    return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
  };
};

// getWishlist
export const getWishlist = async (req, res) => {
  const userId = req.user.id;
  try {
    const wishlist = await wishlistModel.findOne({ userId }).populate("productId");
    if (!wishlist || wishlist.length === 0) {
      return response.error(res, req.languageCode, resStatusCode.FORBIDDEN, resMessage.NO_WISHLIST_FOUND, []);
    };
    return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.WISHLIST_FETCHED, wishlist);
  } catch (err) {
    console.error("getWishlist error:", err);
    return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
  };
};

// removeFromWishlist
export const removeFromWishlist = async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;
  const { error } = wishlistActionValidation.validate({ productId });
  if (error) {
    return response.error(res, req.languageCode, resStatusCode.CLIENT_ERROR, error.details[0].message);
  };
  try {
    const item = await wishlistModel.findOne({ userId, productId, isDelete: false, });
    if (!item) {
      return response.error(res, req.languageCode, resStatusCode.FORBIDDEN, resMessage.PRODUCT_NOT_IN_WISHLIST);
    };
    item.isDelete = true;
    await item.save();
    return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.WISHLIST_ITEM_REMOVED, item);
  } catch (err) {
    console.error("removeFromWishlist error:", err);
    return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
  };
};
