import multer from "multer";
import { ALLOWED_DEED_TYPES, ALLOWED_IMAGE_TYPES } from "../lib/fileSignature";

const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;
const MAX_DEED_SIZE_BYTES = 15 * 1024 * 1024;
const MAX_IMAGES_PER_UPLOAD = 10;

// Memory storage: files are validated (including a magic-byte check in the
// controller) and handed to StorageProvider, never written straight from
// the client's declared filename/mimetype (Rule 44).
export const uploadImages = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_SIZE_BYTES, files: MAX_IMAGES_PER_UPLOAD },
  fileFilter: (_req, file, cb) => {
    cb(null, ALLOWED_IMAGE_TYPES.includes(file.mimetype));
  },
}).array("images", MAX_IMAGES_PER_UPLOAD);

export const uploadDeed = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_DEED_SIZE_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    cb(null, ALLOWED_DEED_TYPES.includes(file.mimetype));
  },
}).single("deed");
