import {
  cartModel,
  cartValidation,
  updateCartValidation,
} from "../model/cartModel.js";
import response from "../utils/response.js";
import { resStatusCode, resMessage } from "../utils/constants.js";

export async function addToCart(req, res) {
  const { productId, quantity, isActive } = req.body;

  // Validation
  const { error } = cartValidation.validate(req.body);
  if (error) {
    return response.error(res, req.languageCode, 400, error.details[0].message);
  }

  try {
    // Check if the product is already in the user's cart
    const existingCartItem = await cartModel.findOne({
      userId: req.user.id,
      productId: productId,
    });

    if (existingCartItem) {
      // Update quantity
      existingCartItem.quantity += quantity;
      existingCartItem.isDelete = false;
      existingCartItem.isActive = isActive ?? existingCartItem.isActive;

      await existingCartItem.save();

      return response.success(
        res,
        req.languageCode,
        200,
        "Cart item updated successfully.",
        existingCartItem
      );
    } else {
      // Create a new cart item
      const newCartItem = await cartModel.create({
        userId: req.user.id,
        productId,
        quantity,
        isDelete: false,
        isActive,
      });

      return response.success(
        res,
        req.languageCode,
        200,
        "Cart item added successfully.",
        newCartItem
      );
    }
  } catch (err) {
    console.error("addToCart error:", err);
    return response.error(
      res,
      req.languageCode,
      500,
      "Oops! Something went wrong. Our team is looking into it."
    );
  }
}

export async function getUserCart(req, res) {
  try {
    const getUserCart = await cartModel
      .find({ userId: req.user.id })
      .populate("productId");

    // const item = getUserCart?.items.filter((item) => item.isDelete === false);

    if (!getUserCart || getUserCart.length === 0) {
      return response.error(
        res,
        req.languageCode,
        resStatusCode.NOT_FOUND,
        resMessage.NO_CART_FOUND,
        {}
      );
    }

    return response.success(
      res,
      req.languageCode,
      resStatusCode.ACTION_COMPLETE,
      resMessage.CART_FETCHED,
      getUserCart
    );
  } catch (error) {
    console.error(error);
    return response.error(
      res,
      req.languageCode,
      resStatusCode.INTERNAL_SERVER_ERROR,
      resMessage.INTERNAL_SERVER_ERROR
    );
  }
}

export async function updateCart(req, res) {
  const { quantity } = req.body;
  const productId = req.params.productId;

  // Validate quantity only (productId is from params)
  const { error } = updateCartValidation.validate({ quantity });
  if (error) {
    return response.error(
      res,
      req.languageCode,
      resStatusCode.CLIENT_ERROR,
      error.details[0].message
    );
  }

  try {
    // Find the cart item by userId and productId from params
    const existingCart = await cartModel.findOne({
      userId: req.user.id,
      productId,
    });

    if (!existingCart) {
      return response.error(
        res,
        req.languageCode,
        resStatusCode.NOT_FOUND,
        resMessage.NO_CART_FOUND
      );
    }

    // Update quantity
    existingCart.quantity = quantity;
    const updatedCart = await existingCart.save();

    return response.success(
      res,
      req.languageCode,
      resStatusCode.ACTION_COMPLETE,
      resMessage.CART_UPDATED,
      updatedCart
    );
  } catch (error) {
    console.error("updateCart error:", error);
    return response.error(
      res,
      req.languageCode,
      resStatusCode.INTERNAL_SERVER_ERROR,
      resMessage.INTERNAL_SERVER_ERROR
    );
  }
}

export async function deleteCartByProductId(req, res) {
  const { productId } = req.params;

  try {
    const deleted = await cartModel.findOneAndDelete({
      userId: req.user.id,
      productId,
    });

    if (!deleted) {
      return response.error(
        res,
        req.languageCode,
        resStatusCode.NOT_FOUND,
        resMessage.NO_CART_FOUND
      );
    }

    return response.success(
      res,
      req.languageCode,
      resStatusCode.ACTION_COMPLETE,
      resMessage.CART_DELETED,
      deleted
    );
  } catch (error) {
    console.error(error);
    return response.error(
      res,
      req.languageCode,
      resStatusCode.INTERNAL_SERVER_ERROR,
      resMessage.INTERNAL_SERVER_ERROR
    );
  }
}

// export async function updateCartByProductId(req, res) {
//   const { productId } = req.params;
//   const { quantity } = req.body;
//   const { error } = updateCartValidation.validate(req.body);
//   if (error) {
//     return response.error(
//       res,
//       req.languageCode,
//       resStatusCode.CLIENT_ERROR,
//       error.details[0].message
//     );
//   }

//   //   try {
//   //     const cart = await cartModel.findOne({ userId: req.user.id });
//   //     if (!cart) {
//   //       return response.error(
//   //         res,
//   //         req.languageCode,
//   //         resStatusCode.NOT_FOUND,
//   //         resMessage.CART_NOT_FOUND
//   //       );
//   //     }

//   //     const item = cart.items.find(
//   //       (item) => item.productId.toString() === productId
//   //     );
//   //     if (!item) {
//   //       return response.error(
//   //         res,
//   //         req.languageCode,
//   //         resStatusCode.NOT_FOUND,
//   //         resMessage.PRODUCT_NOT_FOUND
//   //       );
//   //     }

//   try {
//     const cartItem = await cartModel.findOne({
//       userId: req.user.id,
//       productId,
//         isDelete: false,
//     });

//     if (!cartItem) {
//       return response.error(
//         res,
//         req.languageCode,
//         resStatusCode.NOT_FOUND,
//         resMessage.PRODUCT_NOT_FOUND
//       );
//     }

//     // if (quantity <= 0) {
//     //   item.isDelete = true;
//     //   item.quantity = 0;
//     // } else {
//     //   item.quantity = quantity;
//     //   item.isDelete = false;
//     // }

//     cartItem.quantity = quantity;
//     cartItem.isDelete = quantity <= 0;

//     await cartItem.save();

//     return response.success(
//       res,
//       req.languageCode,
//       resStatusCode.ACTION_COMPLETE,
//       resMessage.CART_ITEM_UPDATED,
//       cart
//     );
//   } catch (error) {
//     console.error(error);
//     return response.error(
//       res,
//       req.languageCode,
//       resStatusCode.INTERNAL_SERVER_ERROR,
//       resMessage.INTERNAL_SERVER_ERROR
//     );
//   }
// }

// export async function deleteCartByProductId(req, res) {
//   const { productId } = req.params;

//   //   try {
//   //     const userCart = await cartModel.findOne({ userId: req.user.id });

//   //     if (!userCart) {
//   //       return response.error(
//   //         res,
//   //         req.languageCode,
//   //         resStatusCode.NOT_FOUND,
//   //         resMessage.CART_NOT_FOUND
//   //       );
//   //     }

//   //     const isProductInCart = userCart.items.find(
//   //       (item) => item.productId == productId
//   //     );
//   //     if (!isProductInCart) {
//   //       return response.error(
//   //         res,
//   //         req.languageCode,
//   //         resStatusCode.NOT_FOUND,
//   //         resMessage.PRODUCT_NOT_FOUND
//   //       );
//   //     }

//   //     const updatedProduct = await cartModel.findOneAndUpdate(
//   //       { userId: req.user.id, "items.productId": productId },
//   //       { $set: { "items.$.isDelete": true } },
//   //       { new: true }
//   //     );
//   try {
//     const cartItem = await cartModel.findOne({
//       userId: req.user.id,
//       productId,
//     });

//     if (!cartItem) {
//       return response.error(
//         res,
//         req.languageCode,
//         resStatusCode.NOT_FOUND,
//         resMessage.PRODUCT_NOT_FOUND
//       );
//     }

//     cartItem.isDelete = true;

//     await cartItem.save();

//     return response.success(
//       res,
//       req.languageCode,
//       resStatusCode.ACTION_COMPLETE,
//       resMessage.CART_ITEM_DELETED,
//       updatedProduct
//     );
//   } catch (err) {
//     console.error(err);
//     return response.error(
//       res,
//       req.languageCode,
//       resStatusCode.INTERNAL_SERVER_ERROR,
//       resMessage.INTERNAL_SERVER_ERROR
//     );
//   }
// }
