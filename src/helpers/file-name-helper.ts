import { extname } from 'path';

// Custom filename function to preserve the original file extension
export const uploadFileName = (req, file, cb) => {
  console.log(file);
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const extension = extname(file.originalname);
  cb(
    null,
    `${file.originalname}-${file.fieldname}-${uniqueSuffix}${extension}`,
  );
};
