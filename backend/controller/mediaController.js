import asyncHandler from 'express-async-handler'
import { pool } from '../database/dbConnect.js';
import { uploadDir } from '../helper/multer.js';
import path from 'path';
import fs from 'fs'

export const dataUpload = asyncHandler(async (req, res) => {
  const { chunkIndex, totalChunks, filename } = req.body;
  const chunk = req.file.buffer;
  const chunkPath = path.join(uploadDir, `${filename}.part-${chunkIndex}`);
  console.log(chunkPath)

  fs.writeFileSync(chunkPath, chunk);

  
  const allChunksUploaded = Array.from({ length: totalChunks }, (_, i) => i)
    .every(i => fs.existsSync(path.join(uploadDir, `${filename}.part-${i}`)));

  if (allChunksUploaded) {
    const outputPath = path.join(uploadDir, filename);
    const outputStream = fs.createWriteStream(outputPath);

    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = path.join(uploadDir, `${filename}.part-${i}`);
      const chunkStream = fs.createReadStream(chunkPath);
      chunkStream.pipe(outputStream, { end: false });
    }

    outputStream.on('finish', async () => {
      
      for (let i = 0; i < totalChunks; i++) {
        fs.unlinkSync(path.join(uploadDir, `${filename}.part-${i}`));
      }

      
      console.log(mediaPath);
      const mediaPath = path.join(uploadDir, filename);
      
      const save = await pool.query('INSERT INTO media(name, media) VALUES ($1, $2) RETURNING *', [filename, mediaPath]);

      res.status(200).json({
        message: 'Files uploaded and assembled successfully',
        data: save.rows
      });
    });
  } else {
    res.status(200).json({ message: 'Chunk uploaded successfully' });
  }
});

export const showData = asyncHandler(
    async(req, res)=>{
        const data =await pool.query('SELECT * FROM media')
        if(data.rows === 0){
            res.status(404).json({
                message:"not data found"
            })
        }

        return res.status(200).json({
            message:"data found",
            data
        })
    }
)