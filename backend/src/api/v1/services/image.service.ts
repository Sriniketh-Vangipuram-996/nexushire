import sharp from "sharp";
import fs from "fs";
import path from "path";

export const optimizeImage=async(filePath:string)=>{
    const ext=path.extname(filePath);
    const baseName=path.basename(filePath,ext);

    const outputPath=path.join(
        path.dirname(filePath),
        `${baseName}.webp`
    );

    await sharp(filePath)
        .resize(1200) //limit max width
        .webp({quality:80})
        .toFile(outputPath);

    //remove original
    fs.unlinkSync(filePath);
    return outputPath;
}
