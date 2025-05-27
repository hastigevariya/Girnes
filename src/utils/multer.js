import multer from "multer";
import path from "path";

const saveUserProfileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/userProfile");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = Date.now() + "userProfile" + ext;
    cb(null, filename);
  },
});

export const saveUserProfile = multer({
  storage: saveUserProfileStorage,
  limits: {
    files: 1,
    fileSize: 1 * 1024 * 1024, // 1 MB
  },
});

const productStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/productImage");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = Date.now() + "productImage" + ext;
    cb(null, filename);
  },
});

export const productImage = multer({
  storage: productStorage,
  limits: {
    files: 5,
    fileSize: 1 * 1024 * 1024, // 1 MB
  },
});
