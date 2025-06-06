import { orderModel, orderValidation, getOrderValidation, } from "../model/orderModel.js";
import response from "../utils/response.js";
import { resStatusCode, resMessage } from "../utils/constants.js";
import { productModel } from '../model/productModel.js';
import { Types } from 'mongoose';
import { cartModel } from '../model/cartModel.js';
import sendMail from '../../mailer/index.js';
import generateInvoicePDF from '../utils/generateInvoicePDF.js'

// placeOrder
export async function placeOrder(req, res) {
  const { fname, lname, cartItems, paymentMethod, streetAddress, country, state, pincode, shippingAddress, shippingCharge, mobile, email, orderNote, } = req.body;

  const { error } = orderValidation.validate(req.body);
  if (error) {
    return response.error(res, req.languageCode, resStatusCode.CLIENT_ERROR, error.details[0].message);
  };
  try {
    let totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    let lastOrder = await orderModel.findOne({}).sort({ orderId: -1 }).select("orderId");
    let orderId = lastOrder ? (parseInt(lastOrder.orderId) + 2).toString() : Math.floor(100000 + Math.random() * 900000).toString();

    if (!lastOrder) {
      orderId = Math.floor(100000 + Math.random() * 900000);
    };
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
    // const fullName = `${fname} ${lname}`;
    // const orderSummary = cartItems.slice(0, 2).map(i => `${i.quantity}x Item`).join(', ') + (cartItems.length > 2 ? '...' : '');
    const productIds = cartItems.map(item => new Types.ObjectId(item.productId));
    const orderedProducts = await productModel.find({
      _id: { $in: productIds }
    });
    // const productSkus = orderedProducts.map(product => product.sku).join(', ');
    await cartModel.updateOne(
      { userId: req.user.id },
      { $pull: { items: { productId: { $in: productIds } } } }
    );
    let subtotalArry = [];
    let gstChargeArry = [];
    cartItems.forEach(p => {
      p.taxableValue = p.qty * p.unitPrice;
      p.amount = p.taxableValue;
    });
    cartItems.forEach(cartItem => {
      const matchedProduct = orderedProducts.find(prod => prod._id.toString() === cartItem.productId.toString());
      if (matchedProduct) {
        cartItem.name = matchedProduct.title;
        cartItem.hsn = matchedProduct.hsnCode;
        const gstRate = parseInt(matchedProduct.gst.replace('%', ''));
        cartItem.gst = gstRate;

        const quantity = parseInt(cartItem.quantity);
        cartItem.quantity = quantity;

        const price = parseInt(cartItem.price);
        cartItem.price = price;

        const taxableValue = price * quantity + (price * gstRate * quantity) / 100;
        subtotalArry.push(taxableValue)

        cartItem.taxableValue = taxableValue;
        const gstCharge = price * quantity * gstRate / 100
        gstChargeArry.push(gstCharge)
      };
    });

    const csgst = gstChargeArry.reduce((sum, val) => sum + val, 0);
    const subTotal = subtotalArry.reduce((sum, val) => sum + val, 0);

    const pdfBuffer = await generateInvoicePDF({
      custName: req.body?.fname + " " + req.body?.lname,
      addressLine: streetAddress,
      imagePath: process.env.IMAGE_PATH,
      state,
      country,
      zip: pincode,
      phone: mobile,
      email: email,
      invoiceCount: 1,
      orderId,
      invoiceDate: new Date().toISOString().split("T")[0],
      csgst,
      subTotal,
      name: req?.user.fname,
      products: cartItems,
    });

    sendMail(
      "billingInvoice",
      "Molimor Purchase Invoice",
      req?.user?.email,
      {
        custName: req.body?.fname + req.body?.lname,
        addressLine: streetAddress,
        state,
        country,
        zip: pincode,
        phone: mobile,
        email,
        invoiceCount: 1,
        orderId,
        invoiceDate: new Date().toISOString().split('T')[0],
        csgst,
        subTotal,
        name: req?.user.fname,
        products: cartItems
      },

      process.env.FROM_MAIL,
      "attachment",
      pdfBuffer,
      `invoice-${orderId}.pdf`
    );
    return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.ORDER_PLACED, newOrder);
  } catch (err) {
    console.error(err);
    return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
  };
};

// getAllUserOrders
export async function getAllUserOrders(req, res) {
  try {
    const userId = req.user.id;
    let orders = await orderModel.find({ userId }).populate("items.productId").sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
      return response.error(res, req.languageCode, resStatusCode.FORBIDDEN, resMessage.NO_ORDERS_FOUND);
    };
    const updatedOrders = orders.map((order) => {
      const updatedItems = order.items.map((item) => {
        if (item.productId && Array.isArray(item.productId.image)) {
          item.productId.image = item.productId.image.map((img) =>
            img.startsWith("/productImages/") ? img : `/productImages/${img}`
          );
        };
        return item;
      });
      return { ...order._doc, items: updatedItems };
    });
    return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.ORDER_LIST_FETCHED, updatedOrders);
  } catch (err) {
    console.error("getAllUserOrders error =>", err);
    return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
  };
};

// getOrderById
export async function getOrderById(req, res) {
  const { error } = getOrderValidation.validate(req.params);
  if (error) {
    return response.error(res, req.languageCode, resStatusCode.CLIENT_ERROR, error.details[0].message);
  };
  const { id: orderId } = req.params;
  try {
    const order = await orderModel.findById(req.params.id).populate("items.productId");
    if (!order) {
      return response.error(res, req.languageCode, resStatusCode.FORBIDDEN, resMessage.ORDER_NOT_FOUND);
    };
    const updatedItems = order.items.map((item) => {
      if (item.productId && Array.isArray(item.productId.image)) {
        item.productId.image = item.productId.image.map((img) =>
          img.startsWith("/productImages/") ? img : `/productImages/${img}`
        );
      };
      return item;
    });
    const updatedOrder = { ...order._doc, items: updatedItems };
    return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.ORDER_FETCHED, updatedOrder);
  } catch (err) {
    console.error(err);
    return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
  };
};

// updateOrder
export async function updateOrder(req, res) {
  const { id: orderId } = req.params;
  const updatePayload = req.body;
  try {
    const { error } = getOrderValidation.validate(updatePayload);
    if (error) {
      return response.error(res, req.languageCode, resStatusCode.CLIENT_ERROR, error.details[0].message);
    }
    const updatedOrder = await orderModel.findByIdAndUpdate(orderId, updatePayload, { new: false });
    if (!updatedOrder) {
      return response.error(res, req.languageCode, resStatusCode.FORBIDDEN, resMessage.ORDER_NOT_FOUND);
    };
    return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.ORDER_UPDATED, updatedOrder);
  } catch (err) {
    console.error(err);
    return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
  };
};

// cancelOrder
export async function cancelOrder(req, res) {
  const { id } = req.params;
  try {
    const { error } = getOrderValidation.validate({ id });
    if (error) {
      return response.error(res, req.languageCode, resStatusCode.CLIENT_ERROR, error.details[0].message);
    };
    const order = await orderModel.findById(id);
    if (!order) {
      return response.error(res, req.languageCode, resStatusCode.FORBIDDEN, resMessage.ORDER_NOT_FOUND);
    };
    if (order.status === "Delivered") {
      return response.error(res, req.languageCode, resStatusCode.CLIENT_ERROR, resMessage.ORDER_ALREADY_DELIVERED);
    };
    if (order.status === "Cancelled") {
      return response.error(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.ORDER_CANCELLED,);
    };
    order.status = "Cancelled";
    await order.save();
    return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.ORDER_CANCELLED, order);
  } catch (error) {
    console.error("Cancel Order Error:", error);
    return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
  };
};
