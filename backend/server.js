const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'cribtopia_secret_key_2024';

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

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'jeremywpage@gmail.com',
    pass: process.env.EMAIL_PASS || ''
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth middleware
const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }
    req.user = result.rows[0];
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Auth endpoints

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, full_name, phone, role } = req.body;
    
    // Check if user exists
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Hash password
    const password_hash = await bcrypt.hash(password, 10);
    
    // Create user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, phone, role) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, email, full_name, phone, role, created_at`,
      [email, password_hash, full_name, phone || null, role || 'buyer']
    );
    
    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({ user, token });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const user = result.rows[0];
    
    // Check password
    if (!user.password_hash) {
      return res.status(401).json({ error: 'Account uses OAuth. Please login with Google.' });
    }
    
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ 
      user: { 
        id: user.id, 
        email: user.email, 
        full_name: user.full_name, 
        phone: user.phone, 
        role: user.role 
      }, 
      token 
    });
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Get current user
app.get('/api/auth/me', auth, (req, res) => {
  res.json({ 
    user: { 
      id: req.user.id, 
      email: req.user.email, 
      full_name: req.user.full_name, 
      phone: req.user.phone, 
      role: req.user.role 
    } 
  });
});

// Update user profile
app.put('/api/auth/profile', auth, async (req, res) => {
  try {
    const { full_name, phone, role } = req.body;
    const result = await pool.query(
      `UPDATE users SET full_name = $1, phone = $2, role = $3, updated_at = NOW() 
       WHERE id = $4 
       RETURNING id, email, full_name, phone, role`,
      [full_name, phone, role, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Password reset routes
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    // Check if user exists
    const userResult = await pool.query(
      'SELECT id, email, full_name FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    
    if (userResult.rows.length === 0) {
      // Don't reveal that email doesn't exist for security
      return res.json({ 
        message: 'If the email exists in our system, you will receive a password reset link.' 
      });
    }
    
    const user = userResult.rows[0];
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Set expiry to 1 hour from now
    const resetTokenExpiresAt = new Date(Date.now() + 3600000); // 1 hour
    
    // Store hash of token in database
    await pool.query(
      `UPDATE users SET 
       reset_token_hash = $1, 
       reset_token_expires_at = $2 
       WHERE id = $3`,
      [hashedToken, resetTokenExpiresAt, user.id]
    );
    
    // Send email with reset link
    const resetUrl = `${process.env.FRONTEND_URL || 'http://brutus.tail7c3f02.ts.net:5173'}/#/reset-password?token=${resetToken}`;
    
    await transporter.sendMail({
      from: '"Cribtopia Support" <jeremywpage@gmail.com>',
      to: user.email,
      subject: 'Reset your Cribtopia password',
      html: `
        <h2>Password Reset Request</h2>
        <p>Hello ${user.full_name || user.email},</p>
        <p>We received a request to reset your password for your Cribtopia account.</p>
        <p>Click the link below to reset your password (this link will expire in 1 hour):</p>
        <a href="${resetUrl}" style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Reset Password
        </a>
        <p>If you didn't request this, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
        <hr>
        <p><small>Cribtopia Real Estate Platform</small></p>
      `
    });
    
    res.json({ 
      message: 'If the email exists in our system, you will receive a password reset link.' 
    });
  } catch (err) {
    console.error('Error in forgot password:', err);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    
    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    // Find user with valid token
    const userResult = await pool.query(
      `SELECT id, email, full_name FROM users 
       WHERE reset_token_hash = $1 
       AND reset_token_expires_at > NOW()`,
      [hashedToken]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }
    
    const user = userResult.rows[0];
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Update password and clear reset token fields
    await pool.query(
      `UPDATE users SET 
       password_hash = $1, 
       reset_token_hash = NULL, 
       reset_token_expires_at = NULL,
       updated_at = NOW() 
       WHERE id = $2`,
      [passwordHash, user.id]
    );
    
    res.json({ 
      message: 'Password has been reset successfully. You can now log in with your new password.' 
    });
  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
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
    
    // Convert features array to PostgreSQL format
    const featuresPg = features && features.length > 0 
      ? `{${features.map(v => `"${v.replace(/"/g, '""')}"`).join(',')}}` 
      : null;
    const photosPg = photos && photos.length > 0 
      ? JSON.stringify(photos) 
      : null;
    
    const result = await pool.query(
      `INSERT INTO listings (address, city, state, zip, price, bedrooms, bathrooms, sqft, description, listing_type, year_built, lot_size, parking, heating, cooling, flooring, features, neighborhood, photos, video_path, seller_name, seller_email, seller_phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23) RETURNING *`,
      [address, city, state, zip, price, bedrooms, bathrooms, sqft, description, listing_type || 'FSBO', year_built || null, lot_size || null, parking || null, heating || null, cooling || null, flooring || null, featuresPg, neighborhood || null, photosPg, video_path || null, seller_name, seller_email, seller_phone]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating listing:', err);
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

// Create listing for authenticated user
app.post('/api/listings/auth', auth, async (req, res) => {
  try {
    const { 
      address, city, state, zip, price, bedrooms, bathrooms, sqft, description, listing_type,
      year_built, lot_size, parking, heating, cooling, flooring, features, neighborhood,
      photos, video_path
    } = req.body;
    
    // Convert features array to PostgreSQL format
    const featuresPg = features && features.length > 0 
      ? `{${features.map(v => `"${v.replace(/"/g, '""')}"`).join(',')}}` 
      : null;
    const photosPg = photos && photos.length > 0 
      ? JSON.stringify(photos) 
      : null;
    
    const result = await pool.query(
      `INSERT INTO listings (address, city, state, zip, price, bedrooms, bathrooms, sqft, description, listing_type, year_built, lot_size, parking, heating, cooling, flooring, features, neighborhood, photos, video_path, seller_id, seller_name, seller_email, seller_phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24) RETURNING *`,
      [address, city, state, zip, price, bedrooms, bathrooms, sqft, description, listing_type || 'FSBO', year_built || null, lot_size || null, parking || null, heating || null, cooling || null, flooring || null, featuresPg, neighborhood || null, photosPg, video_path || null, req.user.id, req.user.full_name, req.user.email, req.user.phone]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating listing:', err);
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

// Get current user's listings
app.get('/api/listings/my', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM listings WHERE seller_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching my listings:', err);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

app.put('/api/listings/:id', async (req, res) => {
  try {
    // JSONB columns that need to be stringified
    const jsonbFields = ['photos', 'amenities'];
    // Text array columns that need PostgreSQL array format
    const textArrayFields = ['features', 'appliances'];
    
    const fields = Object.keys(req.body);
    const values = Object.values(req.body).map((val, i) => {
      const field = fields[i];
      // Stringify arrays for JSONB columns
      if (jsonbFields.includes(field) && Array.isArray(val)) {
        return JSON.stringify(val);
      }
      // Convert arrays to PostgreSQL array format for text[] columns
      if (textArrayFields.includes(field) && Array.isArray(val)) {
        return `{${val.map(v => `"${v.replace(/"/g, '""')}"`).join(',')}}`;
      }
      return val;
    });
    
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

// Get offers for the authenticated buyer
app.get('/api/offers/my', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, l.address, l.city, l.state, l.price, l.photos 
       FROM offers o 
       JOIN listings l ON o.listing_id = l.id 
       WHERE o.buyer_id = $1 
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching my offers:', err);
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
});

// Get offers for the authenticated seller's listings
app.get('/api/offers/incoming', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, l.address, l.city, l.state, l.listing_type, l.price, l.photos
       FROM offers o 
       JOIN listings l ON o.listing_id = l.id 
       WHERE l.seller_id = $1 
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching incoming offers:', err);
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

app.post('/api/offers', auth, async (req, res) => {
  try {
    const { listing_id, buyer_name, buyer_email, buyer_phone, offer_amount, earnest_money, financing_type, closing_date, contingencies, message } = req.body;
    const result = await pool.query(
      `INSERT INTO offers (listing_id, buyer_id, buyer_name, buyer_email, buyer_phone, offer_amount, earnest_money, financing_type, closing_date, contingencies, message, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending') RETURNING *`,
      [listing_id, req.user.id, buyer_name, buyer_email, buyer_phone, offer_amount, earnest_money || null, financing_type || 'Cash', closing_date || null, contingencies || null, message || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating offer:', err);
    res.status(500).json({ error: 'Failed to create offer' });
  }
});

// Allow unauthenticated offer submission (fallback for demo)
app.post('/api/offers/guest', async (req, res) => {
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