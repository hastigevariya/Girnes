import { mediaModel, mediaValidation, videoValidation, mediaIdValidation, mediaActiveValidation, socialAccountModel, socialAccountValidation, } from "../model/mediaModel.js";
import response from "../utils/response.js";
import { resStatusCode, resMessage } from "../utils/constants.js";

// addMedia
export const addMedia = async (req, res) => {
  try {
    let image = [];

    if (req.files) {
      image = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
    } else if (req.file) {
      image = [req.file];
    };

    const savedMedia = await Promise.all(
      image.map(async (file) => {
        const { error } = mediaValidation.validate({ image: [file?.filename] });
        if (error) {
          return response.error(res, req.languageCode, resStatusCode.CLIENT_ERROR, error.details[0].message);
        }
        return mediaModel.create({ file: file.filename, type: "img", });
      }));

    return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.MEDIA_UPLOADED, savedMedia);
  } catch (err) {
    console.error(err);
    return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
  }
};


// adminGetAllMedia
export const adminGetAllMedia = async (req, res) => {
  const { type } = req.params;
  try {
    const media = await mediaModel.find({ type, isDelete: false }).sort({ createdAt: -1 });
    return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, media.length ? resMessage.MEDIA_RETRIEVED : resMessage.NO_MEDIA_FOUND, media);
  } catch (err) {
    console.error(err);
    return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
  }
};


// getAllMedia
export const getAllMedia = async (req, res) => {
  const { type } = req.params;
  try {
    const media = await mediaModel.find({ type, isActive: true, isDelete: false }).sort({ createdAt: -1 });
    return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, media.length ? resMessage.MEDIA_RETRIEVED : resMessage.NO_MEDIA_FOUND, media);
  } catch (err) {
    console.error(err);
    return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
  }
};


// addVideoUrl
export const addVideoUrl = async (req, res) => {
  const { vdoUrl } = req.body;
  const { error } = videoValidation.validate(req.body);
  if (error) {
    return response.error(res, req.languageCode, resStatusCode.CLIENT_ERROR, error.details[0].message);
  };
  try {
    const video = await mediaModel.create({ file: vdoUrl, type: "vdo", });
    return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.VIDEO_ADDED, video);
  } catch (err) {
    console.error(err);
    return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
  }
};


// deleteMediaById
export const deleteMediaById = async (req, res) => {
  const { id } = req.params;
  const { error } = mediaIdValidation.validate(req.params);
  if (error) {
    return response.error(res, req.languageCode, resStatusCode.CLIENT_ERROR, error.details[0].message);
  };
  try {
    const result = await mediaModel.findByIdAndUpdate(id, { isDelete: true, isActive: false }, { new: true });
    return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.MEDIA_DELETED, result);
  } catch (err) {
    console.error(err);
    return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
  }
};


// inActiveMediaById
export const inActiveMediaById = async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;
  req.body.id = id;

  const { error } = mediaActiveValidation.validate(req.body);
  if (error) {
    return response.error(res, req.languageCode, resStatusCode.CLIENT_ERROR, error.details[0].message);
  };
  try {
    const result = await mediaModel.findByIdAndUpdate(id, { isActive }, { new: true });

    return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.MEDIA_UPDATED, result);
  } catch (err) {
    console.error(err);
    return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
  }
};


// addSocialAccountURL
export const addSocialAccountURL = async (req, res) => {
  const { error } = socialAccountValidation.validate(req.body);
  if (error) {
    return response.error(res, req.languageCode, resStatusCode.CLIENT_ERROR, error.details[0].message);
  };
  try {
    const existing = await socialAccountModel.findOne().lean();

    let result;
    if (!existing) {
      result = await socialAccountModel.create(req.body);
      return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.SOCIAL_LINKS_CREATED, result);
    } else {
      result = await socialAccountModel.findOneAndUpdate({}, req.body, { new: true, upsert: true, });
      return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.SOCIAL_LINKS_UPDATED, result);
    };
  } catch (err) {
    console.error("Error adding/updating social account:", err);
    return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
  }
};


// getSocialAccountURL
export const getSocialAccountURL = async (req, res) => {
  try {
    const link = await socialAccountModel.findOne().lean();
    return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, link ? resMessage.SOCIAL_LINKS_RETRIEVED : resMessage.NO_SOCIAL_LINKS_FOUND, link || {});
  } catch (err) {
    console.error("Error fetching social links:", err);
    return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
  }
};
