// const express = require('express');
// const multer = require('multer');
// const { MongoClient, GridFSBucket } = require('mongodb');
// const { Readable } = require('stream');
// require('dotenv').config();

// const app = express();
// const upload = multer(); // Multer handles multipart/form-data

// const mongoURI = process.env.MONGO_URI;
// const dbName = process.env.DB_NAME;

// let bucket;

// // Connect to MongoDB
// MongoClient.connect(mongoURI, { useUnifiedTopology: true })
//   .then(client => {
//     const db = client.db(dbName);
//     bucket = new GridFSBucket(db, { bucketName: 'pdfs' });
//     console.log('Connected to MongoDB');
//   })
//   .catch(err => console.error('MongoDB connection error:', err));

// // Upload endpoint
// app.post('/upload', upload.single('file'), (req, res) => {
//   if (!req.file) return res.status(400).json({ message: 'No file uploaded!' });

//   const readableStream = new Readable();
//   readableStream.push(req.file.buffer);
//   readableStream.push(null);

//   const uploadStream = bucket.openUploadStream(req.file.originalname);
//   readableStream.pipe(uploadStream);

//   uploadStream.on('finish', () => {
//     res.json({ message: 'File uploaded successfully!' });
//   });

//   uploadStream.on('error', (err) => {
//     console.error(err);
//     res.status(500).json({ message: 'File upload failed!' });
//   });
// });

// app.listen(5000, () => {
//   console.log('Server running on http://localhost:5000');
// });




// ********************************************************************************
// ********************************************************************************



const express = require('express');
const multer = require('multer');
const cors = require('cors'); // Import cors
const { MongoClient, GridFSBucket } = require('mongodb');
const { ObjectId } = require('mongodb'); // Import ObjectId for handling file IDs
const { Readable } = require('stream');
require('dotenv').config();

const app = express();
app.use(cors()); // Enable CORS for all routes

const upload = multer();

const mongoURI = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;

let bucket;

MongoClient.connect(mongoURI)
  .then(client => {
    const db = client.db(dbName);
    bucket = new GridFSBucket(db, { bucketName: 'pdfs' });
    console.log('Connected to MongoDB');
  })
  .catch(err => console.error('MongoDB connection error:', err));


app.get('/files', async (req, res) => {
  try {
    const files = await bucket.find().toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ message: 'No files found!' });
    }
    res.json(files);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to retrieve files!' });
  }
});


app.get('/download/:filename', async (req, res) => {
  try {
    const file = await bucket.find({ filename: req.params.filename }).toArray();
    if (!file || file.length === 0) {
      return res.status(404).json({ message: 'File not found!' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    bucket.openDownloadStreamByName(req.params.filename).pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to download file!' });
  }
});



app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded!' });

  const readableStream = new Readable();
  readableStream.push(req.file.buffer);
  readableStream.push(null);

  const uploadStream = bucket.openUploadStream(req.file.originalname);
  readableStream.pipe(uploadStream);

  uploadStream.on('finish', () => {
    res.json({ message: 'File uploaded successfully!' });
  });

  uploadStream.on('error', (err) => {
    console.error(err);
    res.status(500).json({ message: 'File upload failed!' });
  });
});


// Delete file by ID
app.delete('/delete/:id', async (req, res) => {
  try {
    const fileId = new ObjectId(req.params.id);
    await bucket.delete(fileId);
    res.json({ message: 'File deleted successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete file!' });
  }
});


app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
