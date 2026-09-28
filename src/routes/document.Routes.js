const express = require('express')

const documentRouter = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware')

const {uploadDocument,getDocuments,downloadDocument,deleteDocument} = require('../controllers/document.controller');

documentRouter.post('/api/documents/upload',authMiddleware,upload.single("document"),uploadDocument);
documentRouter.get('/api/documents',authMiddleware,getDocuments);
documentRouter.get('/api/documents/:id/download',authMiddleware,downloadDocument);
documentRouter.delete('/api/documents/:id',authMiddleware,deleteDocument);

module.exports = documentRouter