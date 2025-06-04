import { reviewModel, reviewValidation, inActiveValidation } from '../model/reviewModel.js';
import response from "../utils/response.js";
import { resStatusCode, resMessage } from "../utils/constants.js";

// Add Review
export const addReview = async (req, res) => {
    const { rating, productId, name, email, comment } = req.body;
    const userId = req.user.id;

    const { error } = reviewValidation.validate(req.body);
    if (error) {
        return response.error(res, req.languageCode, resStatusCode.CLIENT_ERROR, error.details[0].message);
    };
    try {
        const existsReview = await reviewModel.findOne({ productId, userId });

        if (existsReview) {
            return response.error(res, req.languageCode, resStatusCode.FORBIDDEN, resMessage.REVIEW_ALREADY_SUBMITTED);
        };

        const addReview = await reviewModel.create({
            rating,
            userId,
            productId,
            name,
            email,
            comment
        });

        return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.REVIEW_SUBMITTED, addReview);
    } catch (err) {
        console.error("Error in addReview:", err);
        return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
    };
};

// Inactivate Review
export const inActiveReview = async (req, res) => {
    const { productId, isActive } = req.body;
    const userId = req.params.id;

    const { error } = inActiveValidation.validate(req.body);
    if (error) {
        return response.error(res, req.languageCode, resStatusCode.CLIENT_ERROR, error.details[0].message);
    };

    try {
        const updatedReview = await reviewModel.findOneAndUpdate({ productId, userId }, { isActive }, { new: true });

        return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.REVIEW_UPDATED, updatedReview);
    } catch (err) {
        console.error("Error in inActiveReview:", err);
        return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
    };
};
