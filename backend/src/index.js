const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize } = require('./models');
const meetingsRouter = require('./routes/meetings');
const actionsRouter = require('./routes/actions');
const usersRouter = require('./routes/users');
const errorHandler = require('./middleware/errorHandler');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/meetings', meetingsRouter);
app.use('/api/actions', actionsRouter);
app.use('/api/users', usersRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Error handling middleware
app.use(errorHandler);

// Sync database and start server
sequelize.sync({ alter: true })
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Server is accessible at http://192.168.1.40:${PORT}`);
    });
  })
  .catch(error => {
    console.error('Unable to start server:', error);
  });
