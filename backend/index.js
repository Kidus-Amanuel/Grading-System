import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL connection pool
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'your_database_name',
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { UniversityID, password } = req.body;

  if (!UniversityID || !password) {
    return res.status(400).json({ message: 'University ID and password are required.' });
  }

  try {
    // Query to fetch the user based on University ID
    const [users] = await db.query(
      'SELECT Userid, University_id, FullName, Passwords, Role_id FROM user WHERE University_id = ?',
      [UniversityID]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = users[0];

    // Directly compare the password (without bcrypt)
    if (password !== user.Passwords) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Map role ID to frontend routes
    const roleRoutes = {
      2: '/Dashboard', // College Dean
      3: '/DepartmentStudents', // Department Head
      4: '/InstructorCourses', // Instructor
      1: '/StudentCourses', // Student
    };

    res.json({
      message: 'Login successful.',
      route: roleRoutes[user.Role_id] || '/Dashboard', // Default route if no role found
      role: user.Role_id,
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
