## Employee Management System – Backend (`EmployeeSystem-be`)

**Frontend GitHub repo** (for reference):  
`https://github.com/ipsha5/EmployeeSystem-fe`

> Replace the URL above with your actual frontend GitHub repository link.

### Overview

This is the **Node.js + Express backend** for the Employee Management System.  
It exposes REST APIs for:

- **Admin authentication & management**
- **Employee CRUD (create, read, update, delete)**
- **Employee authentication**
- **Profile image uploads**

The backend is designed to be consumed by the React frontend (Vite) application.

### Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express
- **Database**: MySQL / MySQL2
- **Auth**: JSON Web Tokens (JWT) stored in HTTP-only cookies
- **Security & utilities**:
  - `bcrypt` for password hashing
  - `cookie-parser` for reading cookies
  - `cors` for cross-origin requests
  - `multer` for file uploads

### Project Structure (simplified)

```text
EmployeeSystem-be/
  index.js                # App entry point, server setup
  package.json
  Routes/
    AdminRoute.js         # Admin login, admin CRUD, logout
    EmployeeRoute.js      # Employee CRUD, login
  utils/
    db.js                 # MySQL connection
    employee_schema.sql   # Employee table schema
    setup_database.sql    # Initial DB setup
  uploads/                # (created at runtime) stored profile images
```

### Getting Started

#### 1. Prerequisites

- **Node.js** (18+ recommended)
- **MySQL** server running and accessible

#### 2. Install dependencies

From the `EmployeeSystem-be` folder:

```bash
npm install
```

#### 3. Configure the database

1. Create a MySQL database (for example: `ems_db`).
2. Run the SQL scripts in `utils/`:
   - `employee_schema.sql`
   - `setup_database.sql`
3. Update the connection details in `utils/db.js` (host, user, password, database) to match your environment.

#### 4. Environment configuration

If you use environment variables (recommended), configure at least:

- **`PORT`** – port for the backend (defaults to `3000` if not set).
- **`JWT_SECRET`** – secret key for signing tokens (currently hard-coded as `"jwt_secret_key"` in routes; you can refactor to use `process.env.JWT_SECRET`).

#### 5. Run the server

Development (with nodemon):

```bash
npm run dev
```

Production:

```bash
npm start
```

The server will start by default on:  
`http://localhost:3000`

### CORS & Frontend URLs

In `index.js`, CORS is configured as:

```js
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  methods: ['GET', "POST", "PUT", "DELETE"],
  credentials: true
}));
```

If your frontend runs on a different URL (or in production), update the `origin` array accordingly.

### Core Endpoints (high-level)

**Admin routes** – base path: `/auth`

- `POST /auth/adminlogin` – admin login, sets JWT cookie.
- `POST /auth/register` – create a new admin (protected by `verifyUser` middleware).
- `GET /auth/admins` – list all admins (protected).
- `DELETE /auth/delete-admin/:id` – delete an admin (protected).
- `GET /auth/logout` – clear admin JWT cookie.

**Employee routes** – base path: `/employees`

- `GET /employees` – list all employees.
- `GET /employees/:id` – get a single employee by ID.
- `POST /employees` – create employee (supports profile image upload via `multipart/form-data`).
- `PUT /employees/:id` – update employee (supports optional image + partial updates).
- `DELETE /employees/:id` – delete employee.
- `POST /employees/login` – employee login, sets JWT cookie.

### File Uploads

- Uploads are handled with **multer** and stored in the local `uploads/` folder.
- Files are accessible via:

```text
GET /uploads/<file-name>
```

Make sure the `uploads` directory is writable by the Node process. It is auto-created by `index.js` if it doesn’t exist.

### Development Notes

- Default admin test credentials are logged in the console when the server starts:
  - `email: admin@example.com`
  - `password: admin123`
- JWT secret is currently hard-coded as `"jwt_secret_key"` in the routes; update this to use an environment variable for production.
- Both admin and employee auth rely on cookies, so your frontend must send `withCredentials: true` in requests.

### Scripts

From `package.json`:

- **`npm start`** – start the server.
- **`npm run dev`** – start the server with `nodemon` for auto-restart on changes.

### License

Add your preferred license here (e.g., MIT) if you plan to share this publicly.


