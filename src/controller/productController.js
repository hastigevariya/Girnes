import { productModel, productValidation, dailydealModel, updateProductValidation, productFileSchema } from "../model/productModel.js";
import response from "../utils/response.js";
import { orderModel } from "../model/orderModel.js";
import { resStatusCode, resMessage } from "../utils/constants.js";
import mongoose from "mongoose";
import { getAvailableFileName } from '../utils/multer.js';
import xlsx from 'xlsx';
import path from 'path';
import fs from 'fs';
import { subCategoryModel } from "../model/subcategoryModel.js";
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
import { dirname } from 'path';
const __dirname = dirname(__filename);
import axios from 'axios';

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
        bulletPoint1: "",
        bulletPoint2: "",
        bulletPoint3: "",
        bulletPoint4: "",
        bulletPoint5: "",
        weight: "",
        tag: "",
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
        gst: "",
        hsncode: "",
        stock: 1,
        quantity: 1,
        isActive: true
      }
    ];

    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();

    xlsx.utils.book_append_sheet(wb, ws, 'Products');

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);


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

// generateUniqueFilename
function generateUniqueFilename(extension = 'jpg') {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
};
function getFileExtensionFromUrl(url) {
  if (!url) return 'jpg';
  const match = url.match(/\.(jpg|jpeg|png|gif|bmp|webp)(\?|$)/i);
  return match ? match[1] : 'jpg';
};

function convertGoogleDriveToDirectLink(url) {
  const match = url.match(/\/d\/(.+?)\//);
  if (!match) return url;
  const fileId = match[1];
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
};

async function downloadImageFromUrl(imageUrl, filename) {
  const uploadDir = path.join(__dirname, '../../public/productImages');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  if (!imageUrl || !filename) {
    console.log('Invalid imageUrl or filename, skipping download');
    return null;
  };

  const filePath = path.join(uploadDir, filename);
  const directUrl = convertGoogleDriveToDirectLink(imageUrl);

  const response = await axios.get(directUrl, { responseType: 'stream' });
  const writer = fs.createWriteStream(filePath);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', () => resolve(filename));
    writer.on('error', (err) => {
      console.error('Error writing file:', err);
      reject(err);
    });
  });
};

// uploadBulkProductsFile
export async function uploadBulkProductsFile(req, res) {
  try {
    if (!req.file) {
      return response.error(res, req?.languageCode, resStatusCode.FORBIDDEN, resMessage.NO_FILE_UPLOADED, {});
    };
    const fileMimeType = req.file.mimetype;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();

    if (
      fileMimeType !== 'text/csv' &&
      fileMimeType !== 'application/vnd.ms-excel' &&
      fileExtension !== '.csv'
    ) {
      fs.unlinkSync(req.file.path);
      return response.error(res, req.languageCode, resStatusCode.UNSUPPORTED_MEDIA_TYPE, resMessage.FILE_TYPE_NOT_ACCEPTED, {});
    };
    const workbook = xlsx.readFile(req.file.path, { type: 'file' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    const finalProducts = [];
    const subCategoryCache = {};

    for (let i = 0; i < rows.length; i++) {

      const row = rows[i];
      if (typeof row.gst === 'number') {
        row.gst = row.gst.toString();
      };
      if (typeof row.sku === 'number') {
        row.sku = row.sku.toString();
      };
      const { error, value } = productFileSchema.validate(row);

      if (error) {
        fs.unlinkSync(req.file.path);
        return response.error(res, req.languageCode, resStatusCode.CLIENT_ERROR, `Row ${i + 2} error: ${error.details[0].message}. Please fix the error and upload the file again.`);
      };

      let subCategory = subCategoryCache[value.subCategoryId];
      console.log('subCategory', value);
      if (!subCategory) {
        subCategory = await subCategoryModel.findOne({ subcategoryNum: value.subcategoryId });
        if (!subCategory) {
          fs.unlinkSync(req.file.path);
          return response.error(res, req.languageCode, resStatusCode.CLIENT_ERROR, `Row ${i + 2}: Subcategory ID ${value.subCategoryId} is invalid or does not exist.`);
        }
        subCategoryCache[value.subCategoryId] = subCategory;
      };

      const imageUrls = [value.image1, value.image2, value.image3, value.image4, value.image5].filter(Boolean);
      const downloadedImages = [];

      for (const url of imageUrls) {
        const ext = getFileExtensionFromUrl(url);
        const filename = generateUniqueFilename(ext);
        const downloadedFilename = await downloadImageFromUrl(url, filename);
        if (downloadedFilename) downloadedImages.push(downloadedFilename);
      };

      let gstValue = '';
      if (value.gst !== '' && value.gst !== null && value.gst !== undefined) {
        const gstNum = Number(value.gst);
        gstValue = !isNaN(gstNum) ? gstNum + '%' : String(value.gst);
      };
      console.log(' parseInt(value.hsncode)', value.isActive);
      const formattedProduct = {
        title: value.title,
        sku: value.sku,
        bulletPoint: [
          value.bulletPoint1 || '',
          value.bulletPoint2 || '',
          value.bulletPoint3 || '',
          value.bulletPoint4 || '',
          value.bulletPoint5 || '',
        ].filter(Boolean),
        hsnCode: parseInt(value.hsncode),
        price: value.price,
        mrp: value.mrp,
        tag: value.tag,
        description: value.description,
        benefits: value.benefits,
        subcategoryId: subCategory._id,
        gst: gstValue,
        hsnCode: value.hsncode,
        image: downloadedImages,
        stock: value.stock,
        quantity: value.quantity,
        isDelete: false,
        isActive: value.isActive === true || value.isActive === 'true',
      };
      finalProducts.push(formattedProduct);
    };
    await productModel.insertMany(finalProducts);
    fs.unlinkSync(req.file.path);
    return response.success(res, req?.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.PRODUCTS_UPLOADED, {});
  } catch (error) {
    console.error('Error uploading file:', error);
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    };
    if (error.code === 11000 && error.errorResponse) {
      return response.error(res, req?.languageCode, resStatusCode.CLIENT_ERROR, `Duplicate key error: ${error.errorResponse?.message}`, error?.result || null);
    };
    return response.error(res, req?.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR, {});
  };
};
