// upload.ts
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

// Resume uploader
export const uploadResume = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowed = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];
        if (allowed.includes(file.mimetype)) cb(null, true);
        else cb(new Error("Only PDF and DOCX allowed."));
    },
    limits: { fileSize: 5 * 1024 * 1024 },
});

// Avatar uploader
export const uploadAvatar = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) cb(null, true);
        else cb(new Error("Only image files allowed."));
    },
    limits: { fileSize: 5 * 1024 * 1024 },
});
export default {uploadAvatar,uploadResume};