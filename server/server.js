import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';

dotenv.config();

// Connect to MongoDB for local Node.js development server
connectDB().catch((err) => {
  console.warn('[Server Startup Warning]: Initial DB connection pending:', err.message);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[ELQARA Server] Running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

export default app;
