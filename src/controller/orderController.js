import {
  orderModel,
  orderValidation,
  getOrderValidation,
} from "../model/orderModel.js";
import response from "../utils/response.js";
import { resStatusCode, resMessage } from "../utils/constants.js";

export async function placeOrder(req, res) {
  const {
    fname,
    lname,
    cartItems,
    paymentMethod,
    streetAddress,
    country,
    state,
    pincode,
    shippingAddress,
    shippingCharge,
    mobile,
    email,
    orderNote,
  } = req.body;

  const { error } = orderValidation.validate(req.body);
  if (error) {
    return response.error(
      res,
      req.languageCode,
      resStatusCode.CLIENT_ERROR,
      error.details[0].message
    );
  }

  try {
    let totalAmount = cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    let lastOrder = await orderModel
      .findOne({})
      .sort({ orderId: -1 })
      .select("orderId");
    let orderId = lastOrder
      ? (parseInt(lastOrder.orderId) + 2).toString()
      : Math.floor(100000 + Math.random() * 900000).toString();

    const newOrder = await orderModel.create({
      orderId,
      userId: req.user.id,
      fname,
      lname,
      items: cartItems,
      paymentMethod,
      streetAddress,
      country,
      state,
      pincode,
      shippingAddress,
      shippingCharge,
      mobile,
      email,
      totalAmount,
      orderNote,
    });

    return response.success(
      res,
      req.languageCode,
      resStatusCode.ACTION_COMPLETE,
      resMessage.ORDER_PLACED,
      newOrder
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

export async function getAllUserOrders(req, res) {
  try {
    const userId = req.user.id;
    console.log("userId =>", userId);
    let orders = await orderModel
      .find({ userId })
      .populate("items.productId")
      .sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
      return response.error(
        res,
        req.languageCode,
        resStatusCode.NOT_FOUND,
        resMessage.NO_ORDERS_FOUND
      );
    }

    const updatedOrders = orders.map((order) => {
      const updatedItems = order.items.map((item) => {
        if (item.productId && Array.isArray(item.productId.image)) {
          item.productId.image = item.productId.image.map((img) =>
            img.startsWith("/productImages/") ? img : `/productImages/${img}`
          );
        }
        return item;
      });
      return { ...order._doc, items: updatedItems };
    });

    return response.success(
      res,
      req.languageCode,
      resStatusCode.ACTION_COMPLETE,
      resMessage.ORDER_LIST_FETCHED,
      updatedOrders
    );
  } catch (err) {
    //console.error(err);
    console.error("getAllUserOrders error =>", err);
    return response.error(
      res,
      req.languageCode,
      resStatusCode.INTERNAL_SERVER_ERROR,
      resMessage.INTERNAL_SERVER_ERROR
    );
  }
}

export async function getOrderById(req, res) {
  const { error } = getOrderValidation.validate(req.params);
  if (error) {
    return response.error(
      res,
      req.languageCode,
      resStatusCode.CLIENT_ERROR,
      error.details[0].message
    );
  }

  const { id: orderId } = req.params;

  try {
    const order = await orderModel
      .findById(req.params.id)
      .populate("items.productId");

    if (!order) {
      return response.error(
        res,
        req.languageCode,
        resStatusCode.NOT_FOUND,
        resMessage.ORDER_NOT_FOUND
      );
    }

    const updatedItems = order.items.map((item) => {
      if (item.productId && Array.isArray(item.productId.image)) {
        item.productId.image = item.productId.image.map((img) =>
          img.startsWith("/productImages/") ? img : `/productImages/${img}`
        );
      }
      return item;
    });

    const updatedOrder = { ...order._doc, items: updatedItems };

    return response.success(
      res,
      req.languageCode,
      resStatusCode.ACTION_COMPLETE,
      resMessage.ORDER_FETCHED,
      updatedOrder
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

export async function updateOrder(req, res) {
  const { id: orderId } = req.params;

  const updatePayload = req.body;

  try {
    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      updatePayload,
      { new: true } // return updated document
    );

    if (!updatedOrder) {
      return response.error(
        res,
        req.languageCode,
        resStatusCode.NOT_FOUND,
        resMessage.ORDER_NOT_FOUND
      );
    }

    return response.success(
      res,
      req.languageCode,
      resStatusCode.ACTION_COMPLETE,
      resMessage.ORDER_UPDATED,
      updatedOrder
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

export async function cancelOrder(req, res) {
  const { id } = req.params;

  try {
    const order = await orderModel.findById(id);

    if (!order) {
      return response.error(
        res,
        req.languageCode,
        resStatusCode.NOT_FOUND,
        "Order not found"
      );
    }

    // Already delivered or cancelled check
    if (order.status === "Delivered") {
      return response.error(
        res,
        req.languageCode,
        resStatusCode.CLIENT_ERROR,
        "Delivered orders cannot be cancelled."
      );
    }

    if (order.status === "Cancelled") {
      return response.error(
        res,
        req.languageCode,
        resStatusCode.CLIENT_ERROR,
        "Order is already cancelled."
      );
    }

    // Cancel the order
    order.status = "Cancelled";
    await order.save();

    return response.success(
      res,
      req.languageCode,
      resStatusCode.ACTION_COMPLETE,
      "Order cancelled successfully.",
      order
    );
  } catch (error) {
    console.error("Cancel Order Error:", error);
    return response.error(
      res,
      req.languageCode,
      resStatusCode.INTERNAL_SERVER_ERROR,
      "Something went wrong while cancelling the order"
    );
  }
}
