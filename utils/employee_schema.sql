-- Create employee table
CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  date_of_birth DATE,
  hire_date DATE NOT NULL,
  department VARCHAR(50) NOT NULL,
  position VARCHAR(50) NOT NULL,
  employment_type VARCHAR(20) DEFAULT 'Full-Time',
  location VARCHAR(50) DEFAULT 'Headquarters',
  salary DECIMAL(10, 2) NOT NULL,
  address VARCHAR(255),
  city VARCHAR(50),
  state VARCHAR(50),
  postal_code VARCHAR(20),
  country VARCHAR(50),
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(20),
  bio TEXT,
  profile_image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add an index on department to optimize filtering and queries
CREATE INDEX idx_department ON employees(department);

-- Add an index on email for faster login lookups
CREATE INDEX idx_email ON employees(email); 