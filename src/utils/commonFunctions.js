import multer from "multer";
import fs from "fs";
import path from "path";

// User profile image upload
const saveUserProfile = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/userProfile");
  },
  filename: function (req, file, cb) {
    console.log("file.originalname", file.originalname);
    cb(null, Date.now() + "-userProfile-" + file.originalname);
  },
});
export const saveUserProfileUpload = multer({ storage: saveUserProfile });

// Product images upload
const productImagesStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "./public/productImages";
    fs.mkdir(dir, { recursive: true }, (error) => cb(error, dir));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-productImage-" + file.originalname);
  },
});
export const productImageUpload = multer({ storage: productImagesStorage });

// Excel file upload
const excelFileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./public/uploadFile";
    fs.mkdir(dir, { recursive: true }, (err) => cb(err, dir));
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${timestamp}-excel${ext}`);
  },
});
export const excelFileUpload = multer({ storage: excelFileStorage });

// Banner image upload
const bannerImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "./public/banner";
    fs.mkdir(dir, { recursive: true }, (error) => cb(error, dir));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-banner-" + file.originalname);
  },
});
export const bannerImageUpload = multer({ storage: bannerImageStorage });

// Certificate image upload
const certificateImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "./public/certificate";
    fs.mkdir(dir, { recursive: true }, (error) => cb(error, dir));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-certificate-" + file.originalname);
  },
});
export const certificateImageUpload = multer({
  storage: certificateImageStorage,
});

// Media file upload
const mediaStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "./public/media";
    fs.mkdir(dir, { recursive: true }, (error) => cb(error, dir));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-media-" + file.originalname);
  },
});
export const mediaFileUpload = multer({ storage: mediaStorage });

// Utility to get available file name
export const getAvailableFileName = (dir, baseName, extension) => {
  let counter = 1;
  let fileName = `${baseName}.${extension}`;
  let filePath = path.join(dir, fileName);

  while (fs.existsSync(filePath)) {
    counter++;
    fileName = `${baseName}(${counter}).${extension}`;
    filePath = path.join(dir, fileName);
  }
  return filePath;
};
