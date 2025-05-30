import { contactModel, contactValidation, companyinfoModel, companyinfoValidation } from "../model/contactModel.js";
import response from "../utils/response.js";
import { resStatusCode, resMessage } from "../utils/constants.js";

export const addContactUs = async (req, res) => {
    try {
        const { name, email, message, inquiryType, moq } = req.body;

        const { error } = contactValidation.validate(req.body);
        if (error) {
            return response.error(res, req.languageCode, resStatusCode.CLIENT_ERROR, error.details[0].message);
        }

        const contact = new contactModel({
            userId: req.user._id,
            name,
            email,
            message,
            inquiryType,
            moq,
        });
        await contact.save();

        return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.CONTACT_SUBMITTED, contact);
    } catch (err) {
        console.error("Error in addContactUs:", err);
        return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
    }
};

export const getAllCustomerQuerysList = async (req, res) => {
    try {
        const contacts = await contactModel.find().sort({ createdAt: -1 });
        return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.CONTACT_FETCHED, contacts);
    } catch (err) {
        console.error("Error in getAllCustomerQuerysList:", err);
        return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
    }
};

export const addCompanyinfo = async (req, res) => {
    const { error } = companyinfoValidation.validate(req.body);
    if (error) {
        return response.error(res, req.languageCode, resStatusCode.CLIENT_ERROR, error.details[0].message);
    }

    try {
        const existing = await companyinfoModel.findOne();

        if (!existing) {
            const newCompany = await companyinfoModel.create(req.body);
            return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.COMPANY_CREATED, newCompany);
        } else {
            const updatedCompany = await companyinfoModel.findOneAndUpdate({}, req.body, { new: true });
            return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.COMPANY_UPDATED, updatedCompany);
        }
    } catch (err) {
        console.error("Error in addCompanyinfo:", err);
        return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
    }
};

export const getCompanyinfo = async (req, res) => {
    try {
        const companyInfo = await companyinfoModel.findOne();

        if (!companyInfo) {
            return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.NO_COMPANY_FOUND);
        }

        return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.COMPANY_FETCHED, companyInfo);
    } catch (err) {
        console.error("Error in getCompanyinfo:", err);
        return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
    }
};
