import InstaShop from "../model/instashopModel.js";
import response from "../utils/response.js";
import { resStatusCode, resMessage } from "../utils/constants.js";

export const addInstaShop = async (req, res) => {
    try {
        const { image, url, isActive } = req.body;

        if (!image || !url) {
            return response.error(
                res,
                req.languageCode,
                resStatusCode.CLIENT_ERROR,
                resMessage.REQUIRED_FIELDS
            );
        }

        const newPost = new InstaShop({ image, url, isActive });
        const savedPost = await newPost.save();

        return response.success(
            res,
            req.languageCode,
            resStatusCode.ACTION_COMPLETE,
            resMessage.INSTA_POST_CREATED,
            savedPost
        );
    } catch (error) {
        console.error("Error in addInstaShop:", error);
        return response.error(
            res,
            req.languageCode,
            resStatusCode.INTERNAL_SERVER_ERROR,
            resMessage.INTERNAL_SERVER_ERROR
        );
    }
};

export const getAllInstaShops = async (req, res) => {
    try {
        const posts = await InstaShop.find().sort({ createdAt: -1 });

        return response.success(
            res,
            req.languageCode,
            resStatusCode.ACTION_COMPLETE,
            resMessage.INSTA_POST_FETCHED,
            posts
        );
    } catch (error) {
        console.error("Error in getAllInstaShops:", error);
        return response.error(
            res,
            req.languageCode,
            resStatusCode.INTERNAL_SERVER_ERROR,
            resMessage.INTERNAL_SERVER_ERROR
        );
    }
};

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

        const updatedPost = await InstaShop.findByIdAndUpdate(id, { isActive }, { new: true });

        if (!updatedPost) {
            return response.error(res, req.languageCode, resStatusCode.NOT_FOUND);
        }

        return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, updatedPost);
    } catch (error) {
        console.error("Error in updateInstaShopStatus:", error);
        return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
    }
};