import fs from "fs";
import path from "path";
import mammoth from "mammoth";
import { logger } from "./logger";

import pdfParse from "pdf-parse";
export const extractResumeText = async (filePath: string): Promise<string> => {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".pdf") {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (ext === ".docx") {
    const result = await mammoth.extractRawText({ path: filePath });
    logger.info("DOCX TEXT LENGTH:");
    logger.info(result.value.length);
    return result.value;
  }

  throw new Error("Unsupported file format");
};
