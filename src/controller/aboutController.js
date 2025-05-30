import { aboutUsModel } from '../model/aboutModel.js';
import response from "../utils/response.js";
import { resStatusCode, resMessage } from "../utils/constants.js";

// addAbout
// export async function addAbout(req, res) {
//     try {
//         const { content } = req.body;

//         let existing = await aboutUsModel.findOne();
//         let aboutus;

//         if (!existing) {
//             aboutus = await aboutUsModel.create({ content });
//             return response.success(
//                 res,
//                 req.languageCode,
//                 resStatusCode.ACTION_COMPLETE,
//                 resMessage.ABOUT_CREATED,
//                 aboutus
//             );
//         } else {
//             aboutus = await aboutUsModel.findOneAndUpdate({}, { content }, { new: true });
//             return response.success(
//                 res,
//                 req.languageCode,
//                 resStatusCode.ACTION_COMPLETE,
//                 resMessage.ABOUT_UPDATED,
//                 aboutus
//             );
//         }
//     } catch (error) {
//         console.error(error);
//         return response.error(
//             res,
//             req.languageCode,
//             resStatusCode.INTERNAL_SERVER_ERROR,
//             resMessage.INTERNAL_SERVER_ERROR
//         );
//     }
// }

export const addAbout = async (req, res) => {
    try {
        const { p1, p2, p3, p4, m1, m2, m3, m4 } = req.body;
        const image = req.file?.filename;

        const payload = {
            p1, p2, p3, p4, m1, m2, m3, m4, image
        };

        let existing = await aboutUsModel.findOne();

        let aboutus;
        if (!existing) {
            aboutus = await aboutUsModel.create(payload);
        } else {
            aboutus = await aboutUsModel.findOneAndUpdate({}, payload, { new: true });
        }

        return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.ABOUT_CREATED, aboutus);
    } catch (error) {
        console.error("Error in addAbout:", error);
        return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
    }
};

// getAbout
export async function getAbout(req, res) {
    try {
        const aboutData = await aboutUsModel.find();
        return response.success(
            res,
            req.languageCode,
            resStatusCode.ACTION_COMPLETE,
            resMessage.ABOUT_FETCHED,
            aboutData
        );
    } catch (error) {
        console.error(error);
        return response.error(
            res,
            req.languageCode,
            resStatusCode.INTERNAL_SERVER_ERROR,
            resMessage.INTERNAL_SERVER_ERROR
        );
    }
}
