-- Create database
CREATE DATABASE IF NOT EXISTS Employeemanagement2;
USE Employeemanagement2;

-- Create admin table
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin
INSERT INTO admins (name, email, password) 
VALUES ('Admin User', 'admin@example.com', '$2b$10$mJ3hhlkHxn4J0mEeT3ZtVedCw9AYzI2.9FTUgEjN8k7wBl2wqqwLC');
-- Note: the password above is 'admin123' encrypted with bcrypt

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

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(20) DEFAULT '#3498db',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default departments
INSERT INTO departments (name, description, color) VALUES
('Engineering', 'Software development and technical operations', '#3498db'),
('Sales', 'Client acquisition and business development', '#2ecc71'),
('Marketing', 'Brand promotion and market research', '#9b59b6'),
('Finance', 'Financial management and accounting', '#f39c12'),
('Human Resources', 'Employee management and recruitment', '#e74c3c'),
('Creative', 'Design and creative services', '#1abc9c'),
('Legal', 'Legal affairs and compliance', '#34495e');

-- Create categories table for general-purpose categorization
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  type VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample categories
INSERT INTO categories (name, type, description) VALUES
('Hardware', 'Asset', 'Physical computer equipment'),
('Software', 'Asset', 'Applications and programs'),
('Training', 'Program', 'Educational programs'),
('Meeting Room', 'Facility', 'Conference and meeting spaces'),
('Travel', 'Expense', 'Business travel expenses'); 