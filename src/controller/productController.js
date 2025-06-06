import { productModel, productValidation, dailydealModel } from "../model/productModel.js";

import response from "../utils/response.js";
import { orderModel } from "../model/orderModel.js";
import { resStatusCode, resMessage } from "../utils/constants.js";
import mongoose from "mongoose";
import { updateProductValidation } from "../model/productModel.js";


// Create Product
export const createProduct = async (req, res) => {
  try {
    let { title, price, mrp, gst, hsnCode, bulletPoint, quantity, stock, subcategoryId, tag, description, sku, dailySalePrice, isSale, isActive, startSale, endSale } = req.body;

    if (typeof bulletPoint === "string") {
      bulletPoint = JSON.parse(bulletPoint);
    }
    isActive = isActive === "true" || isActive === true;

    const formattedBody = {
      title,
      price,
      mrp,
      bulletPoint,
      quantity,
      stock,
      subcategoryId,
      tag,
      description,
      sku,
      gst: gst + '%',
      hsnCode: hsnCode,
      isActive,
      startSale,
      endSale
    };

    const { error } = productValidation.validate(formattedBody);
    if (error) {
      return response.error(res, req.languageCode, resStatusCode.CLIENT_ERROR, error.details[0].message);
    };

    const existingProduct = await productModel.findOne({ sku });
    if (existingProduct) {
      return response.error(res, req.languageCode, resStatusCode.CONFLICT, "SKU already exists. Please use a unique SKU.");
    };
    const isSaleBool = isSale === "true" ? true : false;
    const newProduct = await productModel.create(formattedBody);
    console.log('isSale', typeof (isSale));
    // if (isSale === true || isSale === 'true') {
    // if(startDate == endDate) {

    if (isSaleBool) {

      const start = new Date(startSale);
      const end = new Date(endSale);

      const diffMs = end - start;

      const is24Hours = diffMs === 24 * 60 * 60 * 1000;

      if (is24Hours) {
        await dailydealModel.create({
          productId: newProduct?._id,
          salePrice: dailySalePrice,
          isDailySale: 1,
          isActive: isSaleBool,
          isActive: true,
          startSale: start,
          endSale: end,

        });
      } else {
        await dailydealModel.create({
          productId: newProduct?._id,
          salePrice: dailySalePrice,
          isDailySale: 2, // Hot deal
          isActive: isSaleBool,
          startSale: start,
          endSale: end,
        });
      }
    };
    const uploadedFiles = Array.isArray(req.files) ? req.files.map(file => file.filename) : [];

    if (uploadedFiles.length > 0) { newProduct.image = uploadedFiles; await newProduct.save(); };
    response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.PRODUCT_CREATED, newProduct);
  } catch (err) {
    console.error("Error while creating product:", err);
    return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
  };
};

//getall
export const getAllProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));

    const priceFilter = {};
    if (minPrice) priceFilter.$gte = Number(minPrice);
    if (maxPrice) priceFilter.$lte = Number(maxPrice);

    const pipeline = [];

    if (Object.keys(priceFilter).length > 0) {
      pipeline.push({ $match: { price: priceFilter } });
    }

    pipeline.push(
      {
        $lookup: {
          from: "subcategories",
          localField: "subcategoryId",
          foreignField: "_id",
          as: "subCategory",
        },
      },
      { $unwind: "$subCategory" },
      {
        $lookup: {
          from: "categories",
          localField: "subCategory.categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" }
    );

    let products = await productModel.aggregate(pipeline);
    console.log("products21", products);

    if (category) {
      products = products.filter((product) => product.category?.name == category);
    }
    console.log("products", products);
    products.sort((a, b) => a.tag.trim().toLowerCase().localeCompare(b.tag.trim().toLowerCase()));

    const totalCount = products.length;
    const totalPages = Math.ceil(totalCount / limitNum);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;

    const updatedProducts = await Promise.all(
      products.map(async (product) => {
        const dailyDeal = await dailydealModel.findOne({ productId: product._id.toString(), isActive: true, });

        const salePrice = dailyDeal?.salePrice ?? null;
        const price = salePrice ?? product?.price;

        return {
          ...product, price
        };
      }));

    const paginatedProducts = updatedProducts.slice(startIndex, endIndex);

    return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.PRODUCT_LIST_FETCHED,
      {
        totalCount,
        totalPages,
        currentPage: pageNum,
        limit: limitNum,
        products: paginatedProducts,
      }
    );
  } catch (err) {
    console.error("getAllProducts error:", err);
    return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
  };
};

// Get One
export const getProductById = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.id);
    if (!product) {
      return response.error(res, req.languageCode, resStatusCode.NOT_FOUND, resMessage.NOT_FOUND);
    };
    const dailyData = await dailydealModel.findOne({ productId: req.params.id, isActive: true, });

    const finalProduct = { ...product._doc, price: dailyData ? dailyData.salePrice : product.price, };

    return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.PRODUCT_FETCHED, finalProduct);
  } catch (err) {
    console.error(err);
    return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
  };
};


// updateProduct
export const updateProduct = async (req, res) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return response.error(res, req.languageCode, resStatusCode.BAD_REQUEST, "Invalid product id");
    }

    let isFeaturedConvertArry = [];
    if (req.body.isFeatured && typeof req.body.isFeatured === "string") {
      isFeaturedConvertArry = req.body.isFeatured
        .replace(/[\[\]\s]+/g, "")
        .split(",")
        .map((item) => item.trim());
      req.body.isFeatured = isFeaturedConvertArry;
    };

    if (typeof req.body.bulletPoint === "string") {
      try {
        req.body.bulletPoint = JSON.parse(req.body.bulletPoint);
      } catch (e) {
        req.body.bulletPoint = req.body.bulletPoint.split(",").map((item) => item.trim()).filter(Boolean);
      }
    };

    delete req.body.sku;
    req.body.isActive = req.body.isActive === "true" || req.body.isActive === true;
    const isSale = req.body.isSale === "true" || req.body.isSale === true;
    const dailySalePrice = req.body.dailySalePrice;

    const { error } = updateProductValidation.validate(req.body);
    if (error) {
      return response.error(res, req.languageCode, resStatusCode.BAD_REQUEST, error.details[0].message);
    }

    const existingProduct = await productModel.findById(id);
    if (!existingProduct) {
      return response.error(res, req.languageCode, resStatusCode.NOT_FOUND, resMessage.NOT_FOUND);
    }

    const uploadedFiles = Array.isArray(req?.files?.image) ? req.files.image.map((file) => file.filename) : [];

    let updatedImages = existingProduct.image || [];

    if (uploadedFiles.length > 0) { updatedImages = uploadedFiles; }

    // Apply to update
    const updatedData = { ...req.body, image: updatedImages, gst: req.body.gst, hsnCode: req.body.hsnCode, };

    const updatedProduct = await productModel.findByIdAndUpdate(id, updatedData, { new: true });
    if (isSale || dailySalePrice) {
      await dailydealModel.findOneAndUpdate(
        { productId: id },
        { salePrice: dailySalePrice, isActive: isSale },
        { upsert: true, new: true }
      );
    };

    if (isSale) {
      const start = new Date(req.body.startSale);
      const end = new Date(req.body.endSale);
      const diffMs = end - start;
      const is24Hours = diffMs === 24 * 60 * 60 * 1000;

      const dailyDealData = {
        productId: id,
        salePrice: dailySalePrice,
        isActive: true,
        startSale: start,
        endSale: end,
        isDailySale: is24Hours ? 1 : 2, // 1 for Daily, 2 for Hot Deal
      };

      await dailydealModel.findOneAndUpdate({ productId: id }, dailyDealData, { upsert: true, new: true });
    } else {
      await dailydealModel.deleteOne({ productId: id });
    };
    return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.PRODUCT_UPDATED, updatedProduct);
  } catch (error) {
    console.error(error);
    return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
  };
};


// Delete
export const deleteProduct = async (req, res) => {
  try {
    const deleted = await productModel.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return response.error(res, req.languageCode, resStatusCode.NOT_FOUND, resMessage.NOT_FOUND);
    };

    return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.PRODUCT_DELETED);
  } catch (err) {
    console.error(err);
    return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
  };
};


// searchProduct
export const searchProduct = async (req, res) => {
  try {
    const { searchProduct } = req.params;

    const products = await productModel.find({
      $or: [
        { title: { $regex: searchProduct, $options: "i" } },
        { description: { $regex: searchProduct, $options: "i" } },
      ],
    });

    if (!products.length) {
      return response.error(res, req.languageCode, resStatusCode.NOT_FOUND, resMessage.PRODUCT_NOT_FOUND);
    };

    return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.PRODUCT_FOUND, products);
  } catch (err) {
    console.error(err);
    return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
  };
};


// getPopularProducts
export const getPopularProducts = async (req, res) => {
  try {
    const orders = await orderModel.find({}, "items.productId");
    console.log("Orders11:", orders);

    if (!orders || orders.length === 0) {
      return response.error(res, req.languageCode, resStatusCode.NOT_FOUND, resMessage.NO_ORDERS);
    };

    const productIds = [
      ...new Set(
        orders.flatMap((order) =>
          order.items.map((item) => item.productId?.toString()).filter((id) => id))),];

    console.log("productIds21", productIds);
    if (productIds.length === 0) {
      return response.error(res, req.languageCode, resStatusCode.NOT_FOUND, resMessage.NO_PRODUCT_IDS);
    };

    const objectIds = productIds.map((id) => new mongoose.Types.ObjectId(id));
    console.log("ObjectIds for products:", objectIds);

    const products = await productModel.find({ _id: { $in: objectIds } });
    console.log("products", products);

    if (!products || products.length === 0) {
      return response.error(res, req.languageCode, resStatusCode.NOT_FOUND, resMessage.POPULAR_PRODUCTS_NOT_FOUND);
    };

    return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.POPULAR_PRODUCTS_FOUND, products);
  } catch (error) {
    console.error("Error fetching popular products:", error.message);
    return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
  };
};
