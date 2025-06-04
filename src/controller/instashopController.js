import InstaShop from "../model/instashopModel.js";
import response from "../utils/response.js";
import { resStatusCode, resMessage } from "../utils/constants.js";

// addInstaShop
export const addInstaShop = async (req, res) => {
    try {
        const { image, url, isActive } = req.body;

        if (!image || !url) {
            return response.error(res, req.languageCode, resStatusCode.CLIENT_ERROR, resMessage.REQUIRED_FIELDS);
        };

        const newShop = new InstaShop({ image, url, isActive });
        const savedShop = await newShop.save();

        return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.INSTA_SHOP_CREATED, savedShop);
    } catch (error) {
        console.error("Error in addInstaShop:", error);
        return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
    };
};

// getAllInstaShops
export const getAllInstaShops = async (req, res) => {
    try {
        const Shops = await InstaShop.find().sort({ createdAt: -1 });

        return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.INSTA_SHOP_FETCHED, Shops);
    } catch (error) {
        console.error("Error in getAllInstaShops:", error);
        return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
    };
};

// updateInstaShopStatus
export const updateInstaShopStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        if (!id) {
            return response.error(res, req.languageCode, resStatusCode.CLIENT_ERROR);
        }

        if (typeof isActive !== "boolean") {
            return response.error(res, req.languageCode, resStatusCode.CLIENT_ERROR);
        }

        const updatedShop = await InstaShop.findByIdAndUpdate(id, { isActive }, { new: true });

        if (!updatedShop) {
            return response.error(res, req.languageCode, resStatusCode.NOT_FOUND);
        }

        return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, updatedShop, {});
    } catch (error) {
        console.error("Error in updateInstaShopStatus:", error);
        return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
    };
};

