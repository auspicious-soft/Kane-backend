import { toBuffer } from 'bwip-js';
import { Readable } from 'stream';
import { uploadStreamToS3Service } from '../services/users/users-service';

export async function generateBarcode(id, userEmail) {
  const user = {
    id: id // Dynamic ID passed to the function
  };

  try {
    // Generate barcode as PNG buffer
    const png = await new Promise((resolve, reject) => {
      toBuffer({
        bcid: 'code128', // Barcode type
        text: user.id, // Text to encode
        scale: 3, // Scaling factor
        height: 10, // Bar height in mm
        includetext: false, // No human-readable text in barcode itself
        textxalign: 'center'
      }, (err, png) => {
        if (err) {
          reject(err);
        } else {
          resolve(png);
        }
      });
    });

    // Convert buffer to readable stream
    const bufferStream = new Readable();
    bufferStream.push(png);
    bufferStream.push(null); // Signal end of stream

    // Upload to S3
    const fileName = `barcode-${id}.png`;
    const fileType = 'image/png';
    const imageKey = await uploadStreamToS3Service(bufferStream, fileName, fileType, userEmail);

    console.log(`Barcode generated and uploaded to S3 with key: ${imageKey}`);
    return imageKey;
  } catch (err) {
    console.error('Error generating or uploading barcode:', err);
    throw err;
  }
}