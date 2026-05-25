const express = require('express');
const path = require('path');

const corsMiddleware = require('./middleware/cors');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const newsRoutes = require('./routes/news');
const uploadsRoutes = require('./routes/uploads');
const contactRoutes = require('./routes/contact');

const app = express();

app.use(corsMiddleware);
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/uploads', uploadsRoutes);
app.use('/api/contact', contactRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
