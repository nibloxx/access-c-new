// server/index.js - Main entry point for the DTBAC Admin Dashboard

// Main imports
import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import path from 'path';
import morgan from 'morgan';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cors from 'cors';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Route imports 
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import roleRoutes from './routes/role.js';
import teamRoutes from './routes/team.js';
import resourceRoutes from './routes/resource.js';
import projectRoutes from './routes/project.js';
import faqRoutes from './routes/faq.js';
import dashboardRoutes from './routes/dashboard.js';

// ES Module dirname setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware
app.use(helmet()); // Security headers
app.use(morgan('dev')); // Logging

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') ,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET || 'dtbac-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 3600000 } // 1 hour
}));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/dtbac', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/resources', resourceRoutes); 
app.use('/api/projects', projectRoutes);
app.use('/api/faqs', faqRoutes);  
app.use('/api', dashboardRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Start server
app.listen(PORT, () => {
  console.log(`DTBAC Admin Dashboard running on port ${PORT}`);
});

export default app;