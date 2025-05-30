"use strict";
import pkg from "jsonwebtoken";
const { sign, verify } = pkg;
import { userModel } from "../model/userModel.js";

export const generateToken = async (userPayload) => {
  try {
    const secretKey = process.env.JWT_SECRET;
    const options = {
      issuer: "tracking",
      expiresIn: "30d",
    };
    userPayload.creationDateTime = Date.now();
    return sign(userPayload, secretKey, options);
  } catch (err) {
    console.error("Token generation failed:", err.message);
    throw new Error("Failed to generate token");
  }
};

// Validate token
// export const authenticateUser = async (req, res, next) => {
//   try {
//     let token = req.headers.authorization || req.headers.Authorization;

//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         status: 401,
//         message: "Access token not provided",
//       });
//     }

//     const secretKey = process.env.JWT_SECRET;
//     const decoded = verify(token, secretKey, {
//       issuer: "tracking",
//       expiresIn: "30d",
//     });
//     console.log('decoded', decoded);
//     const _id = decoded?._id || decoded?.id;
//     const user = await userModel.findById(_id);
//     console.log('user', user);
//     req.user = user;
//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         status: 401,
//         message: "User not found or unauthorized",
//       });
//     }

//     req.user = user;
//     console.log("Authenticated user ID:", req.user.id);
//     next();
//   } catch (err) {
//     console.error("JWT Verification Error:", err.message);
//     return res.status(401).json({
//       success: false,
//       status: 401,
//       message: "Invalid or expired token",
//     });
//   }
// };

export const authenticateUser = async (req, res, next) => {
  try {
    let token = req.headers.authorization || req.headers.Authorization;

    if (!token) {
      return res.status(401).json({
        success: false,
        status: 401,
        message: "Access token not provided",
      });
    }

    const secretKey = process.env.JWT_SECRET;
    const decoded = verify(token, secretKey, {
      issuer: "tracking",
      expiresIn: "30d",
    });

    const _id = decoded?._id || decoded?.id;
    const user = await userModel.findById(_id);

    if (!user) {
      return res.status(401).json({
        success: false,
        status: 401,
        message: "User not found or unauthorized",
      });
    }

    // ✅ add id explicitly
    req.user = {
      ...user.toObject(),
      id: user._id.toString()
    };

    console.log("Authenticated user ID:", req.user.id);

    next();
  } catch (err) {
    console.error("JWT Verification Error:", err.message);
    return res.status(401).json({
      success: false,
      status: 401,
      message: "Invalid or expired token",
    });
  }
};

// Authorize user roles
export const authorizeUserRoles = (...rolesAllowed) => {
  return (req, res, next) => {
    try {
      if (!req.user || !rolesAllowed.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          status: 0,
          message: "Forbidden: You are not authorized",
        });
      }
      next();
    } catch (err) {
      console.error("Authorization error:", err.message);
      return res.status(500).json({
        success: false,
        status: 500,
        message: "Internal server error during authorization",
      });
    }
  };
};

export const languageMiddleware = (req, res, next) => {
  let languageCode = req.query?.lang || "en";
  req.languageCode = languageCode;
  next();
};

export const setCurrency = (req, res, next) => {
  req.currency = req.query?.currency?.toUpperCase() || "INR";
  next();
};
