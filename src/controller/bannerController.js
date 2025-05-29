import { bannerModel, bannerValidation, bannerIdValidation, bannerActiveValidation, } from "../model/bannerModel.js";
import response from "../utils/response.js";
import { resStatusCode, resMessage } from "../utils/constants.js";

// addBanner
export async function addBanner(req, res) {
  const { error } = bannerValidation.validate({ image: req?.file?.filename });
  if (error) {
    return response.error(res, req.languageCode, resStatusCode.CLIENT_ERROR, error.details[0].message);
  };
  try {
    const newBanner = await bannerModel.create({
      image: req?.file?.filename,
    });

    return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.BANNER_CREATED, newBanner);
  } catch (err) {
    console.error(err);
    return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
  };
};

// getAllBanner
export async function getAllBanner(req, res) {
  try {
    const bannerList = await bannerModel.find({ isActive: true, isDelete: false }).sort({ createdAt: -1 });

    if (!bannerList?.length) {
      return response.error(res, req.languageCode, resStatusCode.NOT_FOUND, resMessage.BANNER_LIST_EMPTY, []);
    };

    const updatedBannerList = bannerList.map((banner) => ({
      ...banner._doc,
      image: banner.image.startsWith("/banner/")
        ? banner.image
        : `/banner/${banner.image}`,
    }));

    return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.BANNER_LIST_FETCHED, updatedBannerList);
  } catch (err) {
    console.error(err);
    return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
  }
};

//adminGetAllBanner
export async function adminGetAllBanner(req, res) {
  try {
    const bannerList = await bannerModel.find({ isDelete: false }).sort({ createdAt: -1 });

    if (!bannerList?.length) {
      return response.error(res, req.languageCode, resStatusCode.NOT_FOUND, resMessage.BANNER_LIST_EMPTY, []);
    };

    const updatedBannerList = bannerList.map((banner) => ({
      ...banner._doc,
      image: banner.image.startsWith("/banner/")
        ? banner.image
        : `/banner/${banner.image}`,
    }));

    return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.BANNER_LIST_FETCHED, updatedBannerList);
  } catch (err) {
    console.error(err);
    return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
  }
};

// deleteBannerById
export async function deleteBannerById(req, res) {
  const { id } = req.params;
  const { error } = bannerIdValidation.validate({ id });
  if (error) {
    return response.error(res, req.languageCode, resStatusCode.CLIENT_ERROR, error.details[0].message);
  };
  try {
    const deletedBanner = await bannerModel.findByIdAndUpdate(id, { isDelete: true, isActive: false }, { new: true });
    return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.BANNER_DELETED, deletedBanner);
  } catch (err) {
    console.error(err);
    return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
  }
};

// inActiveBannerById
export async function inActiveBannerById(req, res) {
  const { id } = req.params;
  const { isActive } = req.body;
  const data = { id, isActive };

  const { error } = bannerActiveValidation.validate(data);
  if (error) {
    return response.error(res, req.languageCode, resStatusCode.CLIENT_ERROR, error.details[0].message);
  };
  try {
    const updatedBanner = await bannerModel.findByIdAndUpdate(id, { isActive }, { new: true });
    return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.BANNER_STATUS_UPDATED, updatedBanner);
  } catch (err) {
    console.error(err);
    return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR);
  }
};
