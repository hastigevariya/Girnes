import { cartModel, cartValidation, updateCartValidation, } from "../model/cartModel.js";
import response from "../utils/response.js";
import { resStatusCode, resMessage } from "../utils/constants.js";


// addToCart
export async function addToCart(req, res) {
  const { productId, quantity, isActive } = req.body;

  // Validation
  const { error } = cartValidation.validate(req.body);
  if (error) {
    return response.error(res, req.languageCode, resStatusCode.CLIENT_ERROR, error.details[0].message);
  };
  try {
    const existingCartItem = await cartModel.findOne({ userId: req.user.id, productId: productId, });
    if (existingCartItem) {

      existingCartItem.quantity += quantity;
      existingCartItem.isDelete = false;
      existingCartItem.isActive = isActive ?? existingCartItem.isActive;

      await existingCartItem.save();

      return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.CART_ITEM_UPDATED, existingCartItem);
    } else {
      const newCartItem = await cartModel.create({ userId: req.user.id, productId, quantity, isDelete: false, isActive, });

      return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.CART_CREATED, newCartItem);
    }
  } catch (err) {
    console.error("addToCart error:", err);
    return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
  }
}


//  getUserCart
export async function getUserCart(req, res) {
  try {
    const getUserCart = await cartModel.find({ userId: req.user.id }).populate("productId");

    if (!getUserCart || getUserCart.length === 0) {
      return response.error(res, req.languageCode, resStatusCode.NOT_FOUND, resMessage.NO_CART_FOUND, {});
    }
    return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.CART_FETCHED, getUserCart);
  } catch (error) {
    console.error(error);
    return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
  }
}

// updateCart
export async function updateCart(req, res) {
  const { quantity } = req.body;
  const productId = req.params.productId;

  const { error } = updateCartValidation.validate({ quantity });
  if (error) {
    return response.error(res, req.languageCode, resStatusCode.CLIENT_ERROR, error.details[0].message);
  }

  try {
    const existingCart = await cartModel.findOne({ userId: req.user.id, productId, });
    if (!existingCart) {
      return response.error(res, req.languageCode, resStatusCode.NOT_FOUND, resMessage.NO_CART_FOUND);
    }

    existingCart.quantity = quantity;
    const updatedCart = await existingCart.save();

    return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.CART_UPDATED, updatedCart);
  } catch (error) {
    console.error("updateCart error:", error);
    return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
  };
};


// deleteCartByProductId
export async function deleteCartByProductId(req, res) {
  const { productId } = req.params;

  try {
    const deleted = await cartModel.findOneAndDelete({ userId: req.user.id, productId, });
    if (!deleted) {
      return response.error(res, req.languageCode, resStatusCode.NOT_FOUND, resMessage.NO_CART_FOUND);
    }
    return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.CART_DELETED, deleted);
  } catch (error) {
    console.error(error);
    return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
  };
};
