import express from "express";
import bcrypt from "bcrypt";
import con from "../utils/db.js";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb("Error: Images only (jpeg, jpg, png, gif)");
    }
  }
});

// Get all employees
router.get("/", (req, res) => {
  const sql = "SELECT id, first_name, last_name, email, phone, date_of_birth, hire_date, department, position, employment_type, location, salary, address, city, state, postal_code, country, emergency_contact_name, emergency_contact_phone, bio, profile_image FROM employees";
  
  con.query(sql, (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.json({ 
        status: false, 
        message: "Failed to fetch employees" 
      });
    }
    
    // Format employee data
    const employees = result.map(emp => ({
      id: emp.id,
      name: `${emp.first_name} ${emp.last_name}`,
      email: emp.email,
      phone: emp.phone,
      date_of_birth: emp.date_of_birth,
      position: emp.position,
      department: emp.department,
      salary: parseFloat(emp.salary),
      hire_date: emp.hire_date,
      location: emp.location,
      employment_type: emp.employment_type,
      address: emp.address,
      city: emp.city,
      state: emp.state,
      postal_code: emp.postal_code,
      country: emp.country,
      emergency_contact_name: emp.emergency_contact_name,
      emergency_contact_phone: emp.emergency_contact_phone,
      bio: emp.bio,
      profile_image: emp.profile_image
    }));
    
    return res.json({ 
      status: true, 
      data: employees 
    });
  });
});

// Get employee by ID
router.get("/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT id, first_name, last_name, email, phone, date_of_birth, hire_date, department, position, employment_type, location, salary, address, city, state, postal_code, country, emergency_contact_name, emergency_contact_phone, bio, profile_image FROM employees WHERE id = ?";
  
  con.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.json({ 
        status: false, 
        message: "Failed to fetch employee" 
      });
    }
    
    if (result.length === 0) {
      return res.json({ 
        status: false, 
        message: "Employee not found" 
      });
    }
    
    const emp = result[0];
    const employee = {
      id: emp.id,
      name: `${emp.first_name} ${emp.last_name}`,
      first_name: emp.first_name,
      last_name: emp.last_name,
      email: emp.email,
      phone: emp.phone,
      date_of_birth: emp.date_of_birth,
      position: emp.position,
      department: emp.department,
      salary: parseFloat(emp.salary),
      hire_date: emp.hire_date,
      location: emp.location,
      employment_type: emp.employment_type,
      address: emp.address,
      city: emp.city,
      state: emp.state,
      postal_code: emp.postal_code,
      country: emp.country,
      emergency_contact_name: emp.emergency_contact_name,
      emergency_contact_phone: emp.emergency_contact_phone,
      bio: emp.bio,
      profile_image: emp.profile_image
    };
    
    return res.json({ 
      status: true, 
      data: employee 
    });
  });
});

// Add new employee
router.post("/", upload.single("profile_image"), (req, res) => {
  // Get form data
  const {
    first_name, last_name, email, password, phone, date_of_birth, hire_date,
    department, position, employment_type, location, salary, address, city,
    state, postal_code, country, emergency_contact_name, emergency_contact_phone, bio
  } = req.body;
  
  // Validate required fields
  if (!first_name || !last_name || !email || !password || !hire_date || !department || !position || !salary) {
    return res.json({
      status: false,
      message: "Please provide all required fields"
    });
  }
  
  // Check if employee with email already exists
  const checkEmailSql = "SELECT * FROM employees WHERE email = ?";
  con.query(checkEmailSql, [email], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.json({
        status: false,
        message: "Error checking email availability"
      });
    }
    
    if (result.length > 0) {
      return res.json({
        status: false,
        message: "Email already in use"
      });
    }
    
    // Hash password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error("Password hashing error:", err);
        return res.json({
          status: false,
          message: "Error creating account"
        });
      }
      
      // Profile image path
      const profile_image = req.file ? req.file.path : null;
      
      // Insert employee
      const insertSql = `
        INSERT INTO employees (
          first_name, last_name, email, password, phone, date_of_birth, hire_date,
          department, position, employment_type, location, salary, address, city,
          state, postal_code, country, emergency_contact_name, emergency_contact_phone, bio, profile_image
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const values = [
        first_name, last_name, email, hashedPassword, phone, date_of_birth, hire_date,
        department, position, employment_type, location, salary, address, city,
        state, postal_code, country, emergency_contact_name, emergency_contact_phone, bio, profile_image
      ];
      
      con.query(insertSql, values, (err, result) => {
        if (err) {
          console.error("Database error:", err);
          return res.json({
            status: false,
            message: "Failed to add employee"
          });
        }
        
        return res.json({
          status: true,
          message: "Employee added successfully",
          id: result.insertId
        });
      });
    });
  });
});

// Update employee
router.put("/:id", upload.single("profile_image"), (req, res) => {
  const id = req.params.id;
  
  // Get form data
  const {
    first_name, last_name, email, password, phone, date_of_birth, hire_date,
    department, position, employment_type, location, salary, address, city,
    state, postal_code, country, emergency_contact_name, emergency_contact_phone, bio
  } = req.body;
  
  // First check if the employee exists
  const checkSql = "SELECT * FROM employees WHERE id = ?";
  con.query(checkSql, [id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.json({
        status: false,
        message: "Error checking employee"
      });
    }
    
    if (result.length === 0) {
      return res.json({
        status: false,
        message: "Employee not found"
      });
    }
    
    // If email is changed, check if new email is already in use
    if (email !== result[0].email) {
      const checkEmailSql = "SELECT * FROM employees WHERE email = ? AND id != ?";
      con.query(checkEmailSql, [email, id], (err, emailResult) => {
        if (err) {
          console.error("Database error:", err);
          return res.json({
            status: false,
            message: "Error checking email availability"
          });
        }
        
        if (emailResult.length > 0) {
          return res.json({
            status: false,
            message: "Email already in use"
          });
        }
        
        proceedWithUpdate();
      });
    } else {
      proceedWithUpdate();
    }
    
    function proceedWithUpdate() {
      let passwordPromise = Promise.resolve(null);
      
      // If password is provided, hash it
      if (password) {
        passwordPromise = new Promise((resolve, reject) => {
          bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
              console.error("Password hashing error:", err);
              reject(err);
            } else {
              resolve(hashedPassword);
            }
          });
        });
      }
      
      // Process the update
      passwordPromise.then(hashedPassword => {
        // Profile image path
        const profile_image = req.file ? req.file.path : result[0].profile_image;
        
        // Build update SQL based on provided fields
        let updateSql = "UPDATE employees SET ";
        const updateValues = [];
        
        if (first_name) {
          updateSql += "first_name = ?, ";
          updateValues.push(first_name);
        }
        
        if (last_name) {
          updateSql += "last_name = ?, ";
          updateValues.push(last_name);
        }
        
        if (email) {
          updateSql += "email = ?, ";
          updateValues.push(email);
        }
        
        if (hashedPassword) {
          updateSql += "password = ?, ";
          updateValues.push(hashedPassword);
        }
        
        if (phone !== undefined) {
          updateSql += "phone = ?, ";
          updateValues.push(phone);
        }
        
        if (date_of_birth !== undefined) {
          updateSql += "date_of_birth = ?, ";
          updateValues.push(date_of_birth);
        }
        
        if (hire_date) {
          updateSql += "hire_date = ?, ";
          updateValues.push(hire_date);
        }
        
        if (department) {
          updateSql += "department = ?, ";
          updateValues.push(department);
        }
        
        if (position) {
          updateSql += "position = ?, ";
          updateValues.push(position);
        }
        
        if (employment_type) {
          updateSql += "employment_type = ?, ";
          updateValues.push(employment_type);
        }
        
        if (location) {
          updateSql += "location = ?, ";
          updateValues.push(location);
        }
        
        if (salary) {
          updateSql += "salary = ?, ";
          updateValues.push(salary);
        }
        
        if (address !== undefined) {
          updateSql += "address = ?, ";
          updateValues.push(address);
        }
        
        if (city !== undefined) {
          updateSql += "city = ?, ";
          updateValues.push(city);
        }
        
        if (state !== undefined) {
          updateSql += "state = ?, ";
          updateValues.push(state);
        }
        
        if (postal_code !== undefined) {
          updateSql += "postal_code = ?, ";
          updateValues.push(postal_code);
        }
        
        if (country !== undefined) {
          updateSql += "country = ?, ";
          updateValues.push(country);
        }
        
        if (emergency_contact_name !== undefined) {
          updateSql += "emergency_contact_name = ?, ";
          updateValues.push(emergency_contact_name);
        }
        
        if (emergency_contact_phone !== undefined) {
          updateSql += "emergency_contact_phone = ?, ";
          updateValues.push(emergency_contact_phone);
        }
        
        if (bio !== undefined) {
          updateSql += "bio = ?, ";
          updateValues.push(bio);
        }
        
        updateSql += "profile_image = ? ";
        updateValues.push(profile_image);
        
        updateSql += "WHERE id = ?";
        updateValues.push(id);
        
        // Execute update
        con.query(updateSql, updateValues, (err, updateResult) => {
          if (err) {
            console.error("Database error:", err);
            return res.json({
              status: false,
              message: "Failed to update employee"
            });
          }
          
          return res.json({
            status: true,
            message: "Employee updated successfully"
          });
        });
      }).catch(err => {
        return res.json({
          status: false,
          message: "Error updating employee"
        });
      });
    }
  });
});

// Delete employee
router.delete("/:id", (req, res) => {
  const id = req.params.id;
  
  const sql = "DELETE FROM employees WHERE id = ?";
  con.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.json({
        status: false,
        message: "Failed to delete employee"
      });
    }
    
    if (result.affectedRows === 0) {
      return res.json({
        status: false,
        message: "Employee not found"
      });
    }
    
    return res.json({
      status: true,
      message: "Employee deleted successfully"
    });
  });
});

// Employee login
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  
  const sql = "SELECT * FROM employees WHERE email = ?";
  con.query(sql, [email], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.json({
        status: false,
        message: "Login failed"
      });
    }
    
    if (result.length === 0) {
      return res.json({
        status: false,
        message: "Invalid email or password"
      });
    }
    
    const employee = result[0];
    
    // Compare password
    bcrypt.compare(password, employee.password, (err, isMatch) => {
      if (err || !isMatch) {
        return res.json({
          status: false,
          message: "Invalid email or password"
        });
      }
      
      // Create JWT token
      const token = jwt.sign(
        {
          role: "employee",
          id: employee.id,
          email: employee.email
        },
        "jwt_secret_key",
        { expiresIn: "1d" }
      );
      
      // Set cookie
      res.cookie('token', token);
      
      return res.json({
        status: true,
        message: "Login successful",
        user: {
          id: employee.id,
          name: `${employee.first_name} ${employee.last_name}`,
          email: employee.email,
          role: "employee",
          department: employee.department,
          position: employee.position
        }
      });
    });
  });
});

export default router; 