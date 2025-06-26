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

// User details
const user = {
   // ID from the image
  _id:"8734y95498",
};
const barcodeText = `_ID: ${user._id}`;
// Generate barcode as PNG
toBuffer({
  bcid: 'code128', // Barcode type
  text: user._id, // Text to encode
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

    // Create HTML content with the barcode image
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Barcode Display</title>
  <style>
    body {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background-color: #f0f0f0;
      font-family: Arial, sans-serif;
    }
    .barcode-container {
      border: 2px solid #000080;
      border-radius: 5px;
      padding: 20px;
      text-align: center;
      background-color: white;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
    .barcode-img {
      width: 200px; /* Adjust width as needed */
      height: auto;
    }
    .id-text {
      margin-top: 10px;
      font-size: 18px;
    }
    .close-btn {
      margin-top: 20px;
      padding: 10px 20px;
      font-size: 16px;
      background-color: #d2a679;
      border: none;
      border-radius: 20px;
      cursor: pointer;
    }
    .close-btn:hover {
      background-color: #b88d5e;
    }
  </style>
</head>
<body>
  <div class="barcode-container">
    <img src="barcode.png" alt="Barcode" class="barcode-img">
    <div class="id-text">Your Id code is<br>${user.id}</div>
    <button class="close-btn">Close</button>
  </div>
</body>
</html>
    `;

    // Save the HTML file
    writeFileSync('barcode.html', htmlContent);
    console.log('Barcode and HTML layout generated as barcode.png and barcode.html');
  }
});




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