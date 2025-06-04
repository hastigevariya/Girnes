// import { userModel, userRegisterValidation, userLoginValidation, shopNowEmailButtonModel, subscribeUserValidation, subscribeUserModel } from "../model/userModel.js";
import {
  userModel,
  userRegisterValidation,
  userLoginValidation,
  shopNowEmailButtonModel,
  subscribeUserModel,
  subscribeUserValidation,
} from "../model/userModel.js";
import { generateToken } from "../middeleware/auth.js";
// import {
//   shopNowEmailButtonModel, // ✅ Add this
// } from "../model/userModel.js";
import response from "../utils/response.js";
import { hash, compare } from "bcrypt";
import { resStatusCode, resMessage } from "../utils/constants.js";
import sendMail from '../../mailer/index.js';

// register
export async function register(req, res) {
  console.log("REQ BODY:", req.body);
  const { fname, lname, email, password } = req.body;
  const { error } = userRegisterValidation.validate(req.body);
  if (error) {
    return response.error(res, req.languageCode, resStatusCode.CLIENT_ERROR, error.details[0].message);
  };
  try {
    const userExists = await userModel.findOne({ email });
    if (userExists?.email) {
      return response.error(res, req?.languageCode, resStatusCode.CONFLICT, resMessage.USER_FOUND, {});
    };
    const hashedPassword = await hash(password, 10);
    const createNewUser = await userModel.create({ fname, lname, email, password: hashedPassword, });

    const token = await generateToken({ _id: createNewUser._id });

    const getEmailShopNowButton = await shopNowEmailButtonModel.findOne({ isActive: true, for: 'welcomeEmail' });
    console.log('getEmailShopNowButton', getEmailShopNowButton);
    const resData = {
      image1: process.env.IMAGE_PATH + "/aboutusImage/" + getEmailShopNowButton.image[0],
      image2: process.env.IMAGE_PATH + "/aboutusImage/" + getEmailShopNowButton.image[1],
      shopNow: getEmailShopNowButton?.url,
      imagePath: process.env.IMAGE_PATH
    };
    console.log('resData', resData);
    const ckemail = await sendMail("welcome-mail", "Welcome to Molimor Store", email, resData);
    console.log('ckemail', ckemail);

    return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.USER_REGISTER, { _id: createNewUser._id, token: token });
  } catch (error) {
    console.error(error);
    return response.error(res, req?.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR, {});
  }
};

// login
export async function login(req, res) {
  const { email, password } = req.body;
  const { error } = userLoginValidation.validate(req.body);
  if (error) {
    return response.error(res, req.languageCode, resStatusCode.CLIENT_ERROR, error.details[0].message);
  };
  try {
    const user = await userModel.findOne({ email, isActive: true });
    if (!user) {
      return response.error(res, req.languageCode, resStatusCode.FORBIDDEN, resMessage.USER_ACCOUNT_NOT_FOUND, {});
    };
    const validPassword = await compare(password, user.password);
    if (!validPassword) {
      return response.error(res, req.languageCode, resStatusCode.UNAUTHORISED, resMessage.INVALID_PASSWORD, {});
    };
    const token = await generateToken({ _id: user._id });
    return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.LOGIN_SUCCESS, { _id: user._id, token: token });
  } catch (err) {
    console.error(err);
    return response.error(res, req?.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR, {});
  }
};

// profile
export async function profile(req, res) {
  try {
    console.log('dsfbhj');
    const user = await userModel.findById({ _id: req.user.id }).select("-password");
    if (!user) {
      return response.error(res, req.languageCode, resStatusCode.FORBIDDEN, resMessage.USER_NOT_FOUND, {});
    };
    const updatedUser = {
      ...user._doc,
      profilePhoto: user?.profilePhoto
        ? `/userProfile/${user?.profilePhoto}`
        : null,
    };
    return response.success(res, req?.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.RETRIEVE_PROFILE_SUCCESS, updatedUser);
  } catch (err) {
    console.error(err);
    return response.error(res, req?.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR, {});
  }
};

// getAllUsers
export async function getAllUsers(req, res) {
  try {
    const users = await userModel.find({}, "-password");
    return response.success(res, req?.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.FETCH_SUCCESS, users);
  } catch (err) {
    console.error(err);
    return response.error(res, req?.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR, {});
  }
};

// getUserById
export async function getUserById(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return response.error(res, req?.languageCode, resStatusCode.CLIENT_ERROR, resMessage.USER_ID_REQUIRED, {});
    }

    const user = await userModel.findById(id, "-password");

    if (!user) {
      return response.error(res, req?.languageCode, resStatusCode.NOT_FOUND, resMessage.NOT_FOUND, {});
    }

    return response.success(res, req?.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.FETCH_SUCCESS, user);
  } catch (err) {
    console.error("Error in getUserById:", err);
    return response.error(res, req?.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR, {});
  }
}

// updateUser
export async function updateUser(req, res) {
  const {
    fname,
    lname,
    mobile,
    gender,
    profilePhoto,
    address,
    country,
    state,
    pinCode,
  } = req.body;
  try {
    const user = await userModel.findById({ _id: req.user._id });
    if (!user) {
      return response.error(res, req.languageCode, resStatusCode.NOT_FOUND, resMessage.USER_NOT_FOUND, {});
    };

    const updatedUser = await userModel.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          fname: fname ?? req.user?.fname,
          lname: lname ?? req.user?.lname,
          mobile: mobile ?? req.user?.mobile,
          gender: gender ?? req.user?.gender,
          profilePhoto: req.file?.filename ?? user?.profilePhoto ?? "",
          address: address ?? req.user?.address,
          country: country ?? req.user?.country,
          state: state ?? req.user?.state,
          pinCode: pinCode ?? req.user?.pinCode,
        },
      },
      { new: true, runValidators: true }
    );

    return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.UPDATE_SUCCESS, updatedUser);
  } catch (err) {
    console.error(err);
    return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR, {});
  }
};

// addEmailShopNowButton
export async function addEmailShopNowButton(req, res) {
  const { url } = req.body;
  const images = req.files.image;
  try {
    let newSubscriber;
    const dataExist = await shopNowEmailButtonModel.findOne({ isActive: true, for: "welcomeEmail" });

    const newImageFilenames = images.map(img => img.filename);

    if (dataExist) {
      // const existingImages = dataExist[0].image || [];
      const existingImages = dataExist.image || [];
      let combinedImages = [...existingImages, ...newImageFilenames];

      combinedImages = combinedImages.slice(-2);

      newSubscriber = await shopNowEmailButtonModel.findOneAndUpdate({ isActive: true, for: "welcomeEmail" }, {
        url,
        image: combinedImages
      }, { new: true });
    } else {
      newSubscriber = await shopNowEmailButtonModel.create({
        url,
        image: newImageFilenames.slice(0, 2),
        for: "welcomeEmail",
        isActive: true
      });
    };

    return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.USER_SUBSCRIBE_SUCCESS, newSubscriber);
  } catch (err) {
    console.error(err);
    return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR, {});
  };
};

// getEmailShopNowButton
export async function getEmailShopNowButton(req, res) {
  try {
    const getEmailShopNowButton = await shopNowEmailButtonModel.findOne({ isActive: true });
    const resData = {
      image1: process.env.IMAGE_PATH + "/aboutusImage/" + getEmailShopNowButton.image[0],
      image2: process.env.IMAGE_PATH + "/aboutusImage/" + getEmailShopNowButton.image[1],
      url: getEmailShopNowButton.url
    };
    return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.USER_SUBSCRIBE_SUCCESS, resData);
  } catch (err) {
    console.error(err);
    return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR, {});
  };
};


export async function addSubscribeUser(req, res) {
  const { email } = req.body;

  const { error } = subscribeUserValidation.validate({ email });
  if (error) {
    return response.error(res, req.languageCode, resStatusCode.CLIENT_ERROR, error.details[0].message);
  };
  try {
    const existingUser = await userModel.findOne({ email });
    const isRegistered = !!existingUser;

    const userSubscribe = await subscribeUserModel.findOne({ email });
    const getEmailShopNowButton = await shopNowEmailButtonModel?.findOne({ isActive: true, for: "subscribeEmail" });

    sendMail("subscribeEmail", "Thanks for Joining Molimor - You're Officially In", email, {
      productImage1: process.env.IMAGE_PATH + "/aboutusImage/" + getEmailShopNowButton?.image[0],
      productImage2: process.env.IMAGE_PATH + "/aboutusImage/" + getEmailShopNowButton?.image[1],
      shopNow: getEmailShopNowButton?.url,
    });

    if (!userSubscribe) {
      const newSubscriber = new subscribeUserModel({
        email,
        isRegistered
      });
      await newSubscriber.save();
      return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.USER_SUBSCRIBE_SUCCESS, newSubscriber);
    } else {
      return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.USER_SUBSCRIBE_SUCCESS, userSubscribe);
    };
  } catch (err) {
    console.error(err);
    return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR, {});
  };
};

export async function getAllSubscribedUsers(req, res) {
  try {
    const filter = {};
    if (req.query.isRegistered !== undefined) {
      filter.isRegistered = req.query.isRegistered === 'true';
    };
    const subscribers = await subscribeUserModel.find(filter);
    return response.success(res, req.languageCode, resStatusCode.ACTION_COMPLETE, resMessage.FETCH_SUCCESS, subscribers);
  } catch (err) {
    console.error(err);
    return response.error(res, req.languageCode, resStatusCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR, {});
  };
};