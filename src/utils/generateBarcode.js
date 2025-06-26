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



import { toBuffer } from 'bwip-js';
import { writeFileSync } from 'fs';

// Reusable function to generate barcode
export function generateBarcode(id) {
  const user = {
    id: id // Dynamic ID passed to the function
  };

  // Generate barcode as PNG
  toBuffer({
    bcid: 'code128', // Barcode type
    text: user.id, // Text to encode
    scale: 3, // Scaling factor
    height: 10, // Bar height in mm
    includetext: false, // No human-readable text in barcode itself
    textxalign: 'center'
  }, (err, png) => {
    if (err) {
      console.error('Error generating barcode:', err);
    } else {
      // Save the barcode as a PNG file
      writeFileSync('barcode.png', png);
      console.log('Barcode generated and saved as barcode.png');
    }
  });
}

// Example usage
// generateBarcode('784596123');



// import { toBuffer } from 'bwip-js';
// import { writeFileSync } from 'fs';

// // User details
// const user = {
//   id: '123456',
//   name: 'John Doe',
//   email: 'john.doe@example.com'
// };

// // Combine user details into a single string for the barcode
// const barcodeText = `ID: ${user.id}, Name: ${user.name}, Email: ${user.email}`;

// // Generate barcode as SVG
// toBuffer({
//   bcid: 'code128', // Barcode type
//   text: barcodeText, // Text to encode
//   scale: 3, // Scaling factor
//   height: 10, // Bar height in mm
//   includetext: true, // Show human-readable text below barcode
//   textxalign: 'center', // Center-align text
//   renderer: 'svg' // Specify SVG output
// }, (err, buffer) => {
//   if (err) {
//     console.error('Error generating barcode:', err);
//   } else {
//     // Save the barcode as an SVG file
//     writeFileSync('barcode.svg', buffer);
//     console.log('Barcode generated and saved as barcode.svg');
//   }
// });