// import { toBuffer } from 'bwip-js';
// import { writeFileSync } from 'fs';

// // User details
// const user = {
//   id: '123456',
//   name: 'John Doe', // Uncommented to fix undefined error
//   email: 'john.doe@example.com'
// };

// // Combine user details into a single string for the barcode
// const barcodeText = `ID: ${user.id}, Name: ${user.name}, Email: ${user.email}`;

// // Generate barcode
// toBuffer({
//   bcid: 'code128', // Barcode type
//   text: barcodeText, // Text to encode
//   scale: 0.5, // Reduced from 3 to make barcode smaller width-wise
//   height: 10, // Bar height in mm
//   includetext: true, // Show human-readable text below barcode
//   textxalign: 'center' // Center-align text
// }, (err, png) => {
//   if (err) {
//     console.error('Error generating barcode:', err);
//   } else {
//     // Save the barcode as a PNG file
//     writeFileSync('barcode.png', png);
//     console.log('Barcode generated and saved as barcode.png');
//   }
// });



// import { toBuffer } from 'bwip-js';
// import { writeFileSync } from 'fs';

// Reusable function to generate barcode
// export function generateBarcode(id) {
//   const user = {
//     id: id // Dynamic ID passed to the function
//   };

//   // Generate barcode as PNG
//   toBuffer({
//     bcid: 'code128', // Barcode type
//     text: user.id, // Text to encode
//     scale: 3, // Scaling factor
//     height: 10, // Bar height in mm
//     includetext: false, // No human-readable text in barcode itself
//     textxalign: 'center'
//   }, (err, png) => {
//     if (err) {
//       console.error('Error generating barcode:', err);
//     } else {
//       // Save the barcode as a PNG file
//       writeFileSync('barcode.png', png);
//       console.log('Barcode generated and saved as barcode.png');
//     }
//   });
// }
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