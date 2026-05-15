const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const newsRoutes = require('./routes/news');
const uploadsRoutes = require('./routes/uploads');
const contactRoutes = require('./routes/contact');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

app.use(
  cors({
    origin(origin, cb) {
      // Allow non-browser tools (no Origin) and local dev frontends.
      if (!origin) return cb(null, true);
      const allowed = new Set([
        'http://localhost:5173',
        'http://127.0.0.1:5173',
      ]);
      if (allowed.has(origin)) return cb(null, true);
      // Allow any Vite port on localhost/127.0.0.1
      if (/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/uploads', uploadsRoutes);
app.use('/api/contact', contactRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
