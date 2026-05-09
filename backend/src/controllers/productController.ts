import { Request, Response } from 'express';
import { getPool } from '../db';
import * as XLSX from 'xlsx';
import fs from 'fs';

function parseNumber(val: unknown): number | null {
  if (val === null || val === undefined || val === '') return null;
  const str = String(val).replace(/[₹,%\s]/g, '').trim();
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

function parseRatingCount(val: unknown): number | null {
  if (val === null || val === undefined || val === '') return null;
  const str = String(val).replace(/,/g, '').trim();
  const num = parseInt(str);
  return isNaN(num) ? null : num;
}

function extractMainCategory(category: string): string {
  if (!category) return 'Unknown';
  return category.split('|')[0].trim();
}

export async function importFile(req: Request, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(sheet, { defval: '' }) as Record<string, unknown>[];

    let data = rawData;
    const firstRow = rawData[0] as Record<string, unknown>;
    const firstKey = Object.keys(firstRow)[0];
    if (firstKey === 'amazon' || String(firstRow[firstKey]).toLowerCase() === 'amazon') {
      const headers = Object.values(firstRow).map(String);
      data = rawData.slice(1).map((row) => {
        const newRow: Record<string, unknown> = {};
        Object.values(row).forEach((val, i) => {
          if (headers[i]) newRow[headers[i]] = val;
        });
        return newRow;
      });
    }

    const pool = getPool();
    const client = await pool.connect();
    let imported = 0;
    let skipped = 0;

    try {
      await client.query('BEGIN');
      for (const row of data) {
        const r = row as Record<string, unknown>;
        const productId = String(r['product_id'] || '').trim();
        const productName = String(r['product_name'] || '').trim();
        if (!productId || !productName || productId === 'product_id') {
          skipped++;
          continue;
        }

        const category = String(r['category'] || '').trim();
        const mainCategory = extractMainCategory(category);

        await client.query(
          `INSERT INTO products
            (product_id, product_name, category, main_category, discounted_price, actual_price, discount_percentage, rating, rating_count, about_product, user_name, review_title, review_content)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
           ON CONFLICT (product_id) DO UPDATE SET
            product_name = EXCLUDED.product_name,
            category = EXCLUDED.category,
            main_category = EXCLUDED.main_category,
            discounted_price = EXCLUDED.discounted_price,
            actual_price = EXCLUDED.actual_price,
            discount_percentage = EXCLUDED.discount_percentage,
            rating = EXCLUDED.rating,
            rating_count = EXCLUDED.rating_count,
            about_product = EXCLUDED.about_product,
            user_name = EXCLUDED.user_name,
            review_title = EXCLUDED.review_title,
            review_content = EXCLUDED.review_content`,
          [
            productId, productName, category, mainCategory,
            parseNumber(r['discounted_price']),
            parseNumber(r['actual_price']),
            parseNumber(r['discount_percentage']),
            parseNumber(r['rating']),
            parseRatingCount(r['rating_count']),
            String(r['about_product'] || ''),
            String(r['user_name'] || ''),
            String(r['review_title'] || ''),
            String(r['review_content'] || ''),
          ]
        );
        imported++;
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    fs.unlinkSync(req.file.path);
    res.json({ success: true, imported, skipped, message: `Imported ${imported} products` });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ success: false, message: 'Failed to import file', error: String(error) });
  }
}

export async function getProducts(req: Request, res: Response): Promise<void> {
  try {
    const pool = getPool();
    const page = parseInt(String(req.query.page || '1'));
    const limit = parseInt(String(req.query.limit || '10'));
    const search = String(req.query.search || '').trim();
    const category = String(req.query.category || '').trim();
    const minRating = parseFloat(String(req.query.minRating || '0'));
    const maxRating = parseFloat(String(req.query.maxRating || '5'));
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIdx = 1;

    if (search) { conditions.push(`product_name ILIKE $${paramIdx}`); params.push(`%${search}%`); paramIdx++; }
    if (category) { conditions.push(`main_category = $${paramIdx}`); params.push(category); paramIdx++; }
    if (minRating > 0) { conditions.push(`rating >= $${paramIdx}`); params.push(minRating); paramIdx++; }
    if (maxRating < 5) { conditions.push(`rating <= $${paramIdx}`); params.push(maxRating); paramIdx++; }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await pool.query(`SELECT COUNT(*) FROM products ${where}`, params);
    const total = parseInt(countResult.rows[0].count);

    const dataResult = await pool.query(
      `SELECT id, product_id, product_name, category, main_category, discounted_price, actual_price, discount_percentage, rating, rating_count, review_title
       FROM products ${where}
       ORDER BY rating_count DESC NULLS LAST
       LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      data: dataResult.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
}

export async function getCategories(req: Request, res: Response): Promise<void> {
  try {
    const pool = getPool();
    const result = await pool.query(
      `SELECT main_category as category, COUNT(*) as count FROM products GROUP BY main_category ORDER BY count DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
}

export async function getAnalytics(req: Request, res: Response): Promise<void> {
  try {
    const pool = getPool();
    const [categoryDist, topReviewed, discountDist, categoryRating, summary] = await Promise.all([
      pool.query(`SELECT main_category as category, COUNT(*) as count FROM products GROUP BY main_category ORDER BY count DESC LIMIT 15`),
      pool.query(`SELECT product_name, rating_count, rating FROM products WHERE rating_count IS NOT NULL ORDER BY rating_count DESC LIMIT 10`),
      pool.query(`
        SELECT
          CASE
            WHEN discount_percentage < 0.1 THEN '0-10%'
            WHEN discount_percentage < 0.2 THEN '10-20%'
            WHEN discount_percentage < 0.3 THEN '20-30%'
            WHEN discount_percentage < 0.4 THEN '30-40%'
            WHEN discount_percentage < 0.5 THEN '40-50%'
            WHEN discount_percentage < 0.6 THEN '50-60%'
            WHEN discount_percentage < 0.7 THEN '60-70%'
            WHEN discount_percentage < 0.8 THEN '70-80%'
            ELSE '80%+'
          END as range,
          COUNT(*) as count
        FROM products WHERE discount_percentage IS NOT NULL
        GROUP BY range ORDER BY MIN(discount_percentage)
      `),
      pool.query(`SELECT main_category as category, ROUND(AVG(rating)::numeric, 2) as avg_rating FROM products WHERE rating IS NOT NULL GROUP BY main_category ORDER BY avg_rating DESC LIMIT 15`),
      pool.query(`SELECT COUNT(*) as total_products, ROUND(AVG(rating) FILTER (WHERE rating IS NOT NULL)::numeric, 1) as avg_rating, ROUND(AVG(discount_percentage * 100) FILTER (WHERE discount_percentage IS NOT NULL)::numeric, 1) as avg_discount_pct, COALESCE(SUM(rating_count), 0) as total_reviews FROM products`),
    ]);

    res.json({
      success: true,
      data: {
        categoryDistribution: categoryDist.rows,
        topReviewed: topReviewed.rows,
        discountDistribution: discountDist.rows,
        categoryRating: categoryRating.rows,
        summary: summary.rows[0],
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
}
