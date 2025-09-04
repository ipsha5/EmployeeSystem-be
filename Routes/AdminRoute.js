import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import con from "../utils/db.js";

const router = express.Router();

// Authentication middleware
const verifyUser = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json({ status: false, message: "Not authenticated" });
  }
  
  try {
    const decoded = jwt.verify(token, "jwt_secret_key");
    if (decoded.role === "admin") {
      next();
    } else {
      return res.json({ status: false, message: "Not authorized" });
    }
  } catch (err) {
    return res.json({ status: false, message: "Invalid token" });
  }
};

// Login route
router.post("/adminlogin", (req, res) => {
  const { email, password } = req.body;
  
  const sql = "SELECT * FROM admins WHERE email = ?";
  con.query(sql, [email], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.json({ loginStatus: false, Error: "Database error" });
    }
    
    if (result.length === 0) {
      return res.json({ loginStatus: false, Error: "Wrong email or password" });
    }
    
    const admin = result[0];
    
    // Check if using plain text passwords for development
    if (admin.password === password) {
      const token = jwt.sign(
        {
          role: "admin",
          email: admin.email,
          id: admin.id
        },
        "jwt_secret_key",
        { expiresIn: "1d" }
      );
      
      res.cookie('token', token);
      
      return res.json({ 
        loginStatus: true,
        message: "Login successful",
        user: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: "admin"
        }
      });
    }
    
    // Otherwise check bcrypt password
    bcrypt.compare(password, admin.password, (err, isMatch) => {
      if (err) {
        console.error("Password comparison error:", err);
        return res.json({ loginStatus: false, Error: "Authentication error" });
      }
      
      if (!isMatch) {
        return res.json({ loginStatus: false, Error: "Wrong email or password" });
      }
      
      const token = jwt.sign(
        {
          role: "admin",
          email: admin.email,
          id: admin.id
        },
        "jwt_secret_key",
        { expiresIn: "1d" }
      );
      
      res.cookie('token', token);
      
      return res.json({ 
        loginStatus: true,
        message: "Login successful",
        user: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: "admin"
        }
      });
    });
  });
});

// Register new admin
router.post("/register", verifyUser, (req, res) => {
  const { name, email, password } = req.body;
  
  // Validate input
  if (!name || !email || !password) {
    return res.json({ status: false, message: "All fields are required" });
  }
  
  // Check if email already exists
  const checkSql = "SELECT * FROM admins WHERE email = ?";
  con.query(checkSql, [email], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.json({ status: false, message: "Database error" });
    }
    
    if (result.length > 0) {
      return res.json({ status: false, message: "Email already exists" });
    }
    
    // Hash password
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        console.error("Password hashing error:", err);
        return res.json({ status: false, message: "Error creating account" });
      }
      
      // Insert new admin
      const insertSql = "INSERT INTO admins (name, email, password) VALUES (?, ?, ?)";
      con.query(insertSql, [name, email, hash], (err, result) => {
        if (err) {
          console.error("Database error:", err);
          return res.json({ status: false, message: "Error creating account" });
        }
        
        return res.json({ status: true, message: "Admin created successfully" });
      });
    });
  });
});

// Get all admins
router.get("/admins", verifyUser, (req, res) => {
  const sql = "SELECT id, name, email, created_at FROM admins";
  
  con.query(sql, (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.json({ status: false, message: "Failed to fetch admins" });
    }
    
    return res.json({ status: true, data: result });
  });
});

// Delete admin
router.delete("/delete-admin/:id", verifyUser, (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM admins WHERE id = ?";
  
  con.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.json({ status: false, message: "Failed to delete admin" });
    }
    
    if (result.affectedRows === 0) {
      return res.json({ status: false, message: "Admin not found" });
    }
    
    return res.json({ status: true, message: "Admin deleted successfully" });
  });
});

// Logout
router.get("/logout", (req, res) => {
  res.clearCookie('token');
  return res.json({ status: true, message: "Logged out successfully" });
});

export default router;

