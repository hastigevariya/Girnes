import mongoose from "mongoose";
import Joi from 'joi';

const aboutSchema = new mongoose.Schema({
    p1: String,
    p2: String,
    p3: String,
    p4: String,
    m1: String,
    m2: String,
    m3: String,
    m4: String,
    image: String,
}, { timestamps: true });
export const aboutUsModel = mongoose.model("aboutus", aboutSchema);


export const aboutUsValidation = Joi.object({
    p1: Joi.string().allow('').optional(),
    p2: Joi.string().allow('').optional(),
    p3: Joi.string().allow('').optional(),
    p4: Joi.string().allow('').optional(),
    m1: Joi.string().allow('').optional(),
    m2: Joi.string().allow('').optional(),
    m3: Joi.string().allow('').optional(),
    m4: Joi.string().allow('').optional(),
    image: Joi.string().uri().allow('').optional(), // ensure it's a URL string
});


export default {
    aboutUsModel,
    aboutUsValidation
};