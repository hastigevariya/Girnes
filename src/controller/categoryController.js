import { categoryModel, categoryValidation } from "../model/categoryModel.js";
import response from "../utils/response.js";
import { resStatusCode, resMessage } from "../utils/constants.js";
import mongoose from "mongoose";
import { productModel } from "../model/productModel.js";

export async function addCategory(req, res) {
  const { name } = req.body;
  const { error } = categoryValidation.validate(req.body);
  if (error) {
    return response.error(
      res,
      req.languageCode,
      resStatusCode.CLIENT_ERROR,
      error.details[0].message
    );
  }

  try {
    const existing = await categoryModel.findOne({
      name,
    });
    if (existing?.name) {
      return response.error(
        res,
        req.languageCode,
        resStatusCode.CONFLICT,
        resMessage.ALREADY_EXISTS,
        {}
      );
    }

    const newCategory = await categoryModel.create({
      name,
    });

    return response.success(
      res,
      req.languageCode,
      resStatusCode.ACTION_COMPLETE,
      resMessage.CATEGORY_CREATED,
      newCategory
    );
  } catch (error) {
    console.error(error);
    return response.error(
      res,
      req?.languageCode,
      resStatusCode.INTERNAL_SERVER_ERROR,
      resMessage.INTERNAL_SERVER_ERROR
    );
  }
}
export const getPopularProducts = async (req, res) => {
  try {
    const orders = await orderModel.find({}, "items.productId");

    if (!orders || orders.length === 0) {
      return response.error(
        res,
        req.languageCode,
        resStatusCode.NOT_FOUND,
        "No orders found"
      );
    }

    const productIds = [
      ...new Set(
        orders
          .flatMap((order) =>
            order.items.map((item) => item.productId?.toString())
          )
          .filter((id) => id)
      ),
    ];

    if (productIds.length === 0) {
      return response.error(
        res,
        req.languageCode,
        resStatusCode.NOT_FOUND,
        "No product IDs found in orders"
      );
    }

    const objectIds = productIds.map((id) => new mongoose.Types.ObjectId(id));

    const products = await productModel.find({ _id: { $in: objectIds } });

    if (!products || products.length === 0) {
      return response.error(
        res,
        req.languageCode,
        resStatusCode.NOT_FOUND,
        "No matching products found"
      );
    }

    return response.success(
      res,
      req.languageCode,
      resStatusCode.ACTION_COMPLETE,
      "Popular products fetched successfully",
      products
    );
  } catch (error) {
    console.error("Error fetching popular products:", error.message);
    return response.error(
      res,
      req.languageCode,
      resStatusCode.INTERNAL_SERVER_ERROR,
      resMessage.INTERNAL_SERVER_ERROR
    );
  }
};

// export async function getCategoryList(req, res) {
//   try {
//     const categories = await categoryModel.find();
//     // const { categoryId } = req.query.params;
//     return response.success(
//       res,
//       req.languageCode,
//       resStatusCode.ACTION_COMPLETE,
//       resMessage.CATEGORY_LIST_FETCHED,
//       categories
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

export async function getCategoryList(req, res) {
  try {
    const { categoryId } = req.query;

    // Aggregate with $lookup to get subcategories
    const categories = await categoryModel.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(categoryId) },
      },
      {
        $lookup: {
          from: "subcategories", // <-- collection name (MongoDB auto uses lowercase + plural)
          localField: "_id",
          foreignField: "categoryId",
          as: "subcategories",
        },
      },
    ]);

    return response.success(
      res,
      req.languageCode,
      resStatusCode.ACTION_COMPLETE,
      resMessage.CATEGORY_LIST_FETCHED,
      categories
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

// import { productModel, productValidation } from "../model/productModel.js";
// import response from "../utils/response.js";
// import { resStatusCode, resMessage } from "../utils/constants.js";

// export async function addProduct(req, res) {
//   const { name } = req.body;
//   const { error } = productValidation.validate(req.body);
//   if (error) {
//     return response.error(
//       res,
//       req.languageCode,
//       resStatusCode.CLIENT_ERROR,
//       error.details[0].message
//     );
//   }

//   try {
//     const existing = await productModel.findOne({ name });
//     if (existing?.name) {
//       return response.error(
//         res,
//         req.languageCode,
//         resStatusCode.CONFLICT,
//         resMessage.ALREADY_EXISTS,
//         {}
//       );
//     }

//     const newProduct = await productModel.create({ name });

//     return response.success(
//       res,
//       req.languageCode,
//       resStatusCode.ACTION_COMPLETE,
//       resMessage.PRODUCT_CREATED,
//       newProduct
//     );
//   } catch (error) {
//     console.error(error);
//     return response.error(
//       res,
//       req?.languageCode,
//       resStatusCode.INTERNAL_SERVER_ERROR,
//       resMessage.INTERNAL_SERVER_ERROR
//     );
//   }
// }

// export async function getProductList(req, res) {
//   try {
//     const products = await productModel.find();
//     return response.success(
//       res,
//       req.languageCode,
//       resStatusCode.ACTION_COMPLETE,
//       resMessage.PRODUCT_LIST_FETCHED,
//       products
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

// const orders = await OrderModel.find({}, "items.productId");
// const productIds = [
//   ...new Set(
//     orders
//       .flatMap(order => order.items.map(item => item.productId?.toString()))
//       .filter(id => id) // remove undefined/null
//   )
// ];
// const products = await Product.find({ _id: { $in: productIds } });
// return products
