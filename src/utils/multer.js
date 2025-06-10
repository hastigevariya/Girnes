import { diskStorage } from 'multer';
import multer from "multer";
import path from "path";
import { extname, join } from 'path';
import { mkdir, existsSync } from "fs";

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
export function getAvailableFileName(dir, baseName, extension) {
  let counter = 1;
  let fileName = `${baseName}.${extension}`;
  let filePath = join(dir, fileName);

  while (existsSync(filePath)) {
    counter++;
    fileName = `${baseName}(${counter}).${extension}`;
    filePath = join(dir, fileName);
  };
  return filePath;
}

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Only images are allowed (jpeg, png, jpg, webp).'), false);
  }

  cb(null, true);
};

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



const emailImagesStorage = diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/aboutusImage");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const first4Chars = file.originalname.slice(0, 4);
    cb(null, Date.now() + '-aboutusImage' + first4Chars + ext);
  },
});

const emailImage = multer({ storage: emailImagesStorage });
export const uploadEmailImages = emailImage.fields([
  { name: 'image', maxCount: 2 },
]);


const excelFileStorage = diskStorage({
  destination: (req, file, cb) => {
    const dir = './public/uploadFile';
    mkdir(dir, { recursive: true }, (err) => cb(err, dir));
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = extname(file.originalname);
    cb(null, `${timestamp}-excel${ext}`);
  },
});

export const uploadExcelFile = multer({ storage: excelFileStorage });