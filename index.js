import express from 'express';  // Make sure you're using Node with ES module support (e.g., .mjs extension or "type": "module" in package.json)
import cors from 'cors'
import cookieParser from 'cookie-parser'  // Add cookie-parser
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import adminRouter from './Routes/AdminRoute.js';
import employeeRouter from './Routes/EmployeeRoute.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express()
app.use(cors({
     origin: ["http://localhost:5173", "http://localhost:5174"],  // Updated to match your frontend URLs
     methods: ['GET', "POST", "PUT", "DELETE"],
     credentials: true 
}))
app.use(express.json())
app.use(cookieParser())  // Use cookie-parser middleware

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/auth', adminRouter);
app.use('/employees', employeeRouter);

// Add a simple health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: false,
    message: 'Something went wrong!'
  });
});

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
  // Show admin credentials for testing
  console.log("Admin credentials for testing: { email: 'admin@example.com', password: 'admin123' }")
})
