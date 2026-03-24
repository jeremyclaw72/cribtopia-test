const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://cribtopia:cribtopia_secret_2024@localhost:5432/cribtopia'
});

// Ensure uploads directory exists
const uploadsDir = '/app/uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images and videos
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else if (file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only images and videos are allowed'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB max (for videos)
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Listings endpoints
app.get('/api/listings', async (req, res) => {
  try {
    const { status, type } = req.query;
    let query = 'SELECT * FROM listings WHERE 1=1';
    const params = [];
    
    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }
    if (type) {
      params.push(type);
      query += ` AND listing_type = $${params.length}`;
    }
    
    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching listings:', err);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

app.get('/api/listings/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM listings WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching listing:', err);
    res.status(500).json({ error: 'Failed to fetch listing' });
  }
});

// Upload photos and video
app.post('/api/upload', upload.array('files', 21), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const photos = [];
    let video = null;

    req.files.forEach(file => {
      const fileUrl = `/uploads/${file.filename}`;
      if (file.mimetype.startsWith('image/')) {
        photos.push(fileUrl);
      } else if (file.mimetype.startsWith('video/')) {
        video = fileUrl;
      }
    });

    res.json({ photos, video });
  } catch (err) {
    console.error('Error uploading files:', err);
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

// Upload single video (for video-only uploads)
app.post('/api/upload/video', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video uploaded' });
    }

    const videoUrl = `/uploads/${req.file.filename}`;
    res.json({ video: videoUrl });
  } catch (err) {
    console.error('Error uploading video:', err);
    res.status(500).json({ error: 'Failed to upload video' });
  }
});

app.post('/api/listings', async (req, res) => {
  try {
    const { 
      address, city, state, zip, price, bedrooms, bathrooms, sqft, description, listing_type,
      year_built, lot_size, parking, heating, cooling, flooring, features, neighborhood,
      photos, video_path,
      seller_name, seller_email, seller_phone 
    } = req.body;
    const result = await pool.query(
      `INSERT INTO listings (address, city, state, zip, price, bedrooms, bathrooms, sqft, description, listing_type, year_built, lot_size, parking, heating, cooling, flooring, features, neighborhood, photos, video_path, seller_name, seller_email, seller_phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23) RETURNING *`,
      [address, city, state, zip, price, bedrooms, bathrooms, sqft, description, listing_type || 'FSBO', year_built || null, lot_size || null, parking || null, heating || null, cooling || null, flooring || null, features ? JSON.stringify(features) : null, neighborhood || null, photos ? JSON.stringify(photos) : null, video_path || null, seller_name, seller_email, seller_phone]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating listing:', err);
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

app.put('/api/listings/:id', async (req, res) => {
  try {
    const fields = Object.keys(req.body);
    const values = Object.values(req.body);
    const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
    
    const result = await pool.query(
      `UPDATE listings SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [req.params.id, ...values]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating listing:', err);
    res.status(500).json({ error: 'Failed to update listing' });
  }
});

app.delete('/api/listings/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM listings WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    res.json({ message: 'Listing deleted' });
  } catch (err) {
    console.error('Error deleting listing:', err);
    res.status(500).json({ error: 'Failed to delete listing' });
  }
});

// Offers endpoints
app.get('/api/offers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM offers ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching offers:', err);
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
});

app.get('/api/offers/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM offers WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Offer not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching offer:', err);
    res.status(500).json({ error: 'Failed to fetch offer' });
  }
});

app.post('/api/offers', async (req, res) => {
  try {
    const { listing_id, buyer_name, buyer_email, buyer_phone, offer_amount, earnest_money, financing_type, closing_date, contingencies, message } = req.body;
    const result = await pool.query(
      `INSERT INTO offers (listing_id, buyer_name, buyer_email, buyer_phone, offer_amount, earnest_money, financing_type, closing_date, contingencies, message, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending') RETURNING *`,
      [listing_id, buyer_name, buyer_email, buyer_phone, offer_amount, earnest_money || null, financing_type || 'Cash', closing_date || null, contingencies || null, message || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating offer:', err);
    res.status(500).json({ error: 'Failed to create offer' });
  }
});

app.put('/api/offers/:id', async (req, res) => {
  try {
    const fields = Object.keys(req.body);
    const values = Object.values(req.body);
    const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
    
    const result = await pool.query(
      `UPDATE offers SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [req.params.id, ...values]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Offer not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating offer:', err);
    res.status(500).json({ error: 'Failed to update offer' });
  }
});

app.patch('/api/offers/:id/status', async (req, res) => {
  try {
    const { status, counter_amount } = req.body;
    const result = await pool.query(
      `UPDATE offers SET status = $1, counter_amount = $2, updated_at = NOW() WHERE id = $3 RETURNING *`,
      [status, counter_amount || null, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Offer not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating offer status:', err);
    res.status(500).json({ error: 'Failed to update offer status' });
  }
});

// Users endpoints
app.get('/api/users/me', (req, res) => {
  res.json({
    id: 'user-demo',
    email: 'demo@cribtopia.com',
    full_name: 'Demo User',
    role: 'buyer'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Cribtopia API running on port ${PORT}`);
});

module.exports = app;