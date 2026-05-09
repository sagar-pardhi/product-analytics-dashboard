import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { importFile, getProducts, getCategories, getAnalytics } from '../controllers/productController';

const router = Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, '/tmp'),
  filename: (_req, file, cb) => cb(null, `upload-${Date.now()}${path.extname(file.originalname)}`),
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const allowed = ['.xlsx', '.xls', '.csv'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only Excel and CSV files are allowed'));
  },
  limits: { fileSize: 50 * 1024 * 1024 },
});

router.post('/import', upload.single('file'), importFile);
router.get('/products', getProducts);
router.get('/categories', getCategories);
router.get('/analytics', getAnalytics);

export default router;
