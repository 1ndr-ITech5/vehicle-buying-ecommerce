const express = require('express');
const multer = require('multer');
const path = require('path');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); //Appending extension
  }
});

const upload = multer({ storage: storage });

router.post('/', upload.single('image'), (req, res) => {
  console.log('Upload request received');
  console.log('File:', req.file);
  if (!req.file) {
    console.log('No file uploaded');
    return res.status(400).send('No file uploaded.');
  }
  console.log('File uploaded successfully');
  res.send({
    message: 'File uploaded successfully',
    imageUrl: `http://localhost:3001/uploads/${req.file.filename}`
  });
});

module.exports = router;
