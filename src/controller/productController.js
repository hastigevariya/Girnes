import { productModel, productValidation, dailydealModel, updateProductValidation, productFileSchema } from "../model/productModel.js";
import response from "../utils/response.js";
import { orderModel } from "../model/orderModel.js";
import { resStatusCode, resMessage } from "../utils/constants.js";
import mongoose from "mongoose";
import { getAvailableFileName } from '../utils/multer.js';
import xlsx from 'xlsx';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';





// Create Product
export const createProduct = async (req, res) => {
  try {
    let { title, price, mrp, gst, hsnCode, bulletPoint, quantity, stock, subcategoryId, tag, description, sku, dailySalePrice, isSale, isActive, startSale, endSale } = req.body;
    if (typeof bulletPoint === "string") {
      bulletPoint = JSON.parse(bulletPoint);
    };
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
      return response.error(res, req.languageCode, resStatusCode.CONFLICT, resMessage.SKU_ALREADY_EXISTS);
    };

    const isSaleBool = isSale === "true" ? true : false;
    const newProduct = await productModel.create(formattedBody);

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
      };
    };
    const uploadedFiles = Array.isArray(req.files) ? req.files.map(file => file.filename) : [];
    if (uploadedFiles.length > 0) {
      newProduct.image = uploadedFiles; await newProduct.save();
    };
    response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.PRODUCT_CREATED, newProduct);
  } catch (err) {
    console.error("Error while creating product:", err);
    return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
  };
};

//getall
export const getAllProducts = async (req, res) => {
  try {
    const { error } = productValidation.validate(req.query);
    if (error) {
      return response.error(res, req.languageCode, resStatusCode.CLIENT_ERROR, error.details[0].message);
    };
    const { category, minPrice, maxPrice, page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const priceFilter = {};
    if (minPrice) priceFilter.$gte = Number(minPrice);
    if (maxPrice) priceFilter.$lte = Number(maxPrice);
    const pipeline = [];
    if (Object.keys(priceFilter).length > 0) {
      pipeline.push({ $match: { price: priceFilter } });
    };
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
    if (category) {
      products = products.filter((product) => product.category?.name == category);
    };

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
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return response.error(res, req.languageCode, resStatusCode.CLIENT_ERROR, resMessage.INVALID_PRODUCT_ID_FORMAT);
    };
    const product = await productModel.findById(req.params.id);
    if (!product) {
      return response.error(res, req.languageCode, resStatusCode.FORBIDDEN, resMessage.NOT_FOUND);
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
      };
    };
    delete req.body.sku;

    req.body.isActive = req.body.isActive === "true" || req.body.isActive === true;
    const isSale = req.body.isSale === "true" || req.body.isSale === true;
    const dailySalePrice = req.body.dailySalePrice;
    id = req.body.id;
    const { error } = updateProductValidation.validate(req.body);
    if (error) {
      return response.error(res, req.languageCode, resStatusCode.BAD_REQUEST, error.details[0].message);
    };

    const existingProduct = await productModel.findById(id);
    if (!existingProduct) {
      return response.error(res, req.languageCode, resStatusCode.FORBIDDEN, resMessage.NOT_FOUND);
    };
    const uploadedFiles = Array.isArray(req?.files?.image) ? req.files.image.map((file) => file.filename) : [];
    let updatedImages = existingProduct.image || [];
    if (uploadedFiles.length > 0) {
      updatedImages = uploadedFiles;
    };

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
      return response.error(res, req.languageCode, resStatusCode.FORBIDDEN, resMessage.NOT_FOUND);
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
    if (!searchProduct || searchProduct.trim() === "") {
      return response.error(res, req.languageCode, resStatusCode.CLIENT_ERROR, resMessage.SEARCH_TERM_REQUIRED);
    };
    const { searchProduct } = req.params;
    const products = await productModel.find({
      $or: [
        { title: { $regex: searchProduct, $options: "i" } },
        { description: { $regex: searchProduct, $options: "i" } },
      ],
    });
    if (!products.length) {
      return response.error(res, req.languageCode, resStatusCode.FORBIDDEN, resMessage.PRODUCT_NOT_FOUND);
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
    if (!orders || orders.length === 0) {
      return response.error(res, req.languageCode, resStatusCode.FORBIDDEN, resMessage.NO_ORDERS);
    };
    const orders = await orderModel.find({}, "items.productId");
    console.log("Orders11:", orders);
    if (!orders || orders.length === 0) {
      return response.error(res, req.languageCode, resStatusCode.FORBIDDEN, resMessage.NO_ORDERS);
    };
    const productIds = [
      ...new Set(
        orders.flatMap((order) =>
          order.items.map((item) => item.productId?.toString()).filter((id) => id))),];
    console.log("productIds21", productIds);
    if (productIds.length === 0) {
      return response.error(res, req.languageCode, resStatusCode.FORBIDDEN, resMessage.NO_PRODUCT_IDS);
    };
    const objectIds = productIds.map((id) => new mongoose.Types.ObjectId(id));
    console.log("ObjectIds for products:", objectIds);
    const products = await productModel.find({ _id: { $in: objectIds } });
    console.log("products", products);
    if (!products || products.length === 0) {
      return response.error(res, req.languageCode, resStatusCode.FORBIDDEN, resMessage.POPULAR_PRODUCTS_NOT_FOUND);
    };
    return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.POPULAR_PRODUCTS_FOUND, products);
  } catch (error) {
    console.error("Error fetching popular products:", error.message);
    return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
  };
};

// downloadAddBulkProductTemplate
export async function downloadAddBulkProductTemplate(req, res) {

  try {
    const data = [
      {
        title: "",
        // shortDescription: "",
        isFeatured1: "",
        isFeatured2: "",
        isFeatured3: "",
        isFeatured4: "",
        isFeatured5: "",
        isFeatured6: "",
        weight: "",
        price: 0,
        mrp: 0,
        description: "",
        benefits: "",
        subcategoryId: "",
        image1: "",
        image2: "",
        image3: "",
        image4: "",
        image5: "",
        sku: "",
        stock: 1,
        quantity: 1,
        isActive: true
      }
    ];

    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();

    xlsx.utils.book_append_sheet(wb, ws, 'Products');
    // xlsx.utils.sheet_add_aoa(wb, ws, { origin: ["N2"] });

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    //const filePath = path.join(__dirname, '../../templates/add_bulk_products.xlsx');


    const dir = path.join(__dirname, '../../public/file');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const filePath = getAvailableFileName(dir, 'product_template', 'xlsx');
    xlsx.writeFile(wb, filePath, {
      bookType: 'xlsx',
      cellStyles: true
    });

    const downloadUrl = `/file/${path.basename(filePath)}`;
    return response.success(res, req?.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.FILE_READY, { url: downloadUrl });
  } catch (error) {
    console.error(error);
    return response.error(res, req?.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR, {});
  };
};

// uploadBulkProductsFile
export async function uploadBulkProductsFile(req, res) {
  try {
    if (!req.file) {
      return response.error(res, req?.languageCode, resStatusCode.FORBIDDEN, resMessage.NO_FILE_UPLOADED, {});
    };
    const workbook = xlsx.readFile(req.file.path);
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

    const products = data.map((row, i) => {
      console.log("row", row.sku);

      row.sku = row.sku.toString();
      row.subcategoryId = parseInt(row.subcategoryId);
      console.log("row", row);
      console.log("i", i);
      const { error, value } = productFileSchema.validate(row);
      if (error) {
        return response.error(res, req.languageCode, resStatusCode.CLIENT_ERROR, error.details[0].message);
      };

      return {
        ...value,
        isActive: value.isActive === true || value.isActive === 'true',
        isFeatured: [
          value.isFeatured1 || '',
          value.isFeatured2,
          value.isFeatured3,
          value.isFeatured4,
          value.isFeatured5,
          value.isFeatured6,
        ],
        image: [
          value.image1 || '',
          value.image2,
          value.image3,
          value.image4,
          value.image5,
        ]
      };
    });

    await productModel.insertMany(products);
    fs.unlinkSync(req.file.path);
    response.success(res, req?.languageCode, resStatusCode.ACTION_COMPLETE, resMessagePRODUCTS_UPLOADED, {});
  } catch (error) {
    console.log('error', error);
    if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return response.error(res, req?.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR, {});
  };
};