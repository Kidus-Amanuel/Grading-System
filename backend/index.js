import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Replace with your frontend URL
  credentials: true, // Allow credentials if needed
}));
app.use(bodyParser.json());

// MySQL connection pool
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'your_database_name',
});

// JWT middleware for authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token.' });
    }

    req.user = user; // Attach decoded user info to request
    next();
  });
};

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { UniversityID, password } = req.body;

  if (!UniversityID || !password) {
    return res.status(400).json({ message: 'University ID and password are required.' });
  }

  try {
    const [users] = await db.query(
      'SELECT Userid, University_id, FullName, Passwords, Role_id, College_id FROM user WHERE University_id = ?',
      [UniversityID]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = users[0];

    if (password !== user.Passwords) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.Userid,
        collegeId: user.College_id,
        role: user.Role_id,
      },
      process.env.JWT_SECRET || 'your_jwt_secret', // Use a secure environment variable
      { expiresIn: '1d' } // Token expires in 1 day
    );

    // Map role ID to frontend routes
    const roleRoutes = {
      1: '/Dashboard', // College Dean
      2: '/StudentCourses', // Student
      3: '/DepartmentStudents', // Department Head
      4: '/InstructorCourses', // Instructor
    };

    // Return token and user details
    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.Userid,
        name: user.FullName,
        role: user.Role_id,
        collegeId: user.College_id,
      },
      route: roleRoutes[user.Role_id] || '/Dashboard', // Default route if no role found
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Get departments endpoint
app.get('/api/departments', authenticateToken, async (req, res) => {
  const { id: userId, collegeId } = req.user;

  console.log("User ID from Token:", userId);
  console.log("College ID from Token:", collegeId);

  if (!collegeId) {
    console.error("Access denied. College ID not found.");
    return res.status(403).json({ message: 'Access denied. College ID not found.' });
  }

  try {
    const query = `
      SELECT 
        d.Department_id AS id,
        d.Departmentname AS name,
        d.Years AS years,
        COUNT(s.Semester_id) AS semesters,
        c.Collegename AS college
      FROM 
        department d
      JOIN 
        college c ON d.College_id = c.College_id
      LEFT JOIN 
        semesters s ON s.Department_id = d.Department_id
      WHERE 
        d.College_id = ? 
      GROUP BY 
        d.Department_id, c.Collegename;
    `;
    const [results] = await db.execute(query, [collegeId]);
    console.log("Query Results:", results);
    res.json(results);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ message: 'Failed to fetch departments.' });
  }
});
// Add Department endpoint
app.post('/api/departments', authenticateToken, async (req, res) => {
  const { name, years, semestersPerYear } = req.body;
  const { collegeId } = req.user; // Extracting collegeId from the token

  // Log incoming request details
  console.log('Received request to add department:', { name, years, semestersPerYear, collegeId });

  // Validation
  if (!name || !years || !Array.isArray(semestersPerYear)) {
    console.error('Validation error: Missing required fields');
    return res.status(400).json({
      message: 'Name, years, and semesters per year are required.'
    });
  }

  if (semestersPerYear.length !== parseInt(years, 10)) {
    console.error('Validation error: Mismatch between years and semestersPerYear length');
    return res.status(400).json({
      message: 'The number of entries in semestersPerYear must match the number of years.'
    });
  }

  try {
    // Insert department into the database
    const [departmentResult] = await db.query(
      'INSERT INTO department (Departmentname, Years, College_id) VALUES (?, ?, ?)',
      [name, years, collegeId]
    );

    const departmentId = departmentResult.insertId;
    console.log('Department added with ID:', departmentId);

    // Insert semesters for each year
    const semesterPromises = [];
    semestersPerYear.forEach((numSemesters, yearIndex) => {
      for (let semesterIndex = 1; semesterIndex <= numSemesters; semesterIndex++) {
        semesterPromises.push(
          db.query(
            'INSERT INTO semesters (Semestername, Years, Department_id, Max_ects) VALUES (?, ?, ?, ?)',
            [
              `Year ${yearIndex + 1}, Semester ${semesterIndex}`,
              yearIndex + 1,
              departmentId,
              30, // Default Max_ects
            ]
          )
        );
        console.log(`Inserting semester: Year ${yearIndex + 1}, Semester ${semesterIndex} for Department ID ${departmentId}`);
      }
    });

    // Wait for all semesters to be inserted
    await Promise.all(semesterPromises);
    console.log('All semesters added successfully.');

    // Send success response
    res.status(201).json({
      id: departmentId,
      name,
      years,
      collegeId,
      semestersPerYear,
    });
  } catch (error) {
    console.error('Error adding department:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Editing department with JWT authentication
app.put('/api/departments/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, years, semestersPerYear } = req.body;

  // Validate the request payload
  if (!name || !years || !Array.isArray(semestersPerYear)) {
    return res.status(400).json({
      message: 'Name, years, and semesters per year are required.'
    });
  }

  if (semestersPerYear.length !== parseInt(years, 10)) {
    return res.status(400).json({
      message: 'The number of entries in semestersPerYear must match the number of years.'
    });
  }

  try {
    // Update department details
    const [updateResult] = await db.query(
      'UPDATE department SET Departmentname = ?, Years = ? WHERE Department_id = ?',
      [name, years, id]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ message: 'Department not found.' });
    }

    // Clear existing semesters for the department
    await db.query('DELETE FROM semesters WHERE Department_id = ?', [id]);

    // Insert updated semesters for the department
    const semesterPromises = [];
    semestersPerYear.forEach((numSemesters, yearIndex) => {
      for (let semesterIndex = 1; semesterIndex <= numSemesters; semesterIndex++) {
        semesterPromises.push(
          db.query(
            'INSERT INTO semesters (Semestername, Years, Department_id, Max_ects) VALUES (?, ?, ?, ?)',
            [
              `Year ${yearIndex + 1}, Semester ${semesterIndex}`,
              yearIndex + 1,
              id,
              30 // Default Max_ects value
            ]
          )
        );
      }
    });

    await Promise.all(semesterPromises);

    // Respond with updated department data
    res.json({
      id,
      name,
      years,
      semestersPerYear,
    });
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Delete Department endpoint
app.delete('/api/departments/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { user } = req; // Get user info from the token
  const { collegeId } = user; // Get the collegeId from the user payload

  // Check if the user has access to the department (optional)
  if (!collegeId) {
    return res.status(403).json({ message: 'Access denied. College ID not found.' });
  }

  const connection = await db.getConnection(); // Get a connection from the pool
  try {
    await connection.beginTransaction(); // Start a transaction

    // Step 1: Delete from dependent tables
    await connection.query(
      'DELETE FROM student_assessment_scores WHERE Course_id IN (SELECT Course_id FROM course WHERE Department_id = ?)',
      [id]
    );

    await connection.query(
      'DELETE FROM assessment_component WHERE Course_id IN (SELECT Course_id FROM course WHERE Department_id = ?)',
      [id]
    );

    await connection.query(
      'DELETE FROM student_record_table WHERE Course_id IN (SELECT Course_id FROM course WHERE Department_id = ?)',
      [id]
    );

    await connection.query(
      'DELETE FROM dean_adjustments WHERE Course_id IN (SELECT Course_id FROM course WHERE Department_id = ?)',
      [id]
    );

    await connection.query(
      'DELETE FROM enrollment WHERE Course_id IN (SELECT Course_id FROM course WHERE Department_id = ?)',
      [id]
    );

    await connection.query(
      'DELETE FROM enrollment WHERE Semester_id IN (SELECT Semester_id FROM semesters WHERE Department_id = ?)',
      [id]
    );

    await connection.query(
      'DELETE FROM assignment_course WHERE Semester_id IN (SELECT Semester_id FROM semesters WHERE Department_id = ?)',
      [id]
    );

    await connection.query(
      'DELETE FROM assignment_course WHERE Course_id IN (SELECT Course_id FROM course WHERE Department_id = ?)',
      [id]
    );

    await connection.query(
      'DELETE FROM gpa_table WHERE Semester_id IN (SELECT Semester_id FROM semesters WHERE Department_id = ?)',
      [id]
    );

    await connection.query(
      'DELETE FROM prerequisite_course WHERE Course_id IN (SELECT Course_id FROM course WHERE Department_id = ?)',
      [id]
    );

    await connection.query(
      'DELETE FROM prerequisite_course WHERE Prerequisite_courses_id IN (SELECT Course_id FROM course WHERE Department_id = ?)',
      [id]
    );

    // Step 2: Delete courses, semesters, and graduation requirements
    await connection.query('DELETE FROM course WHERE Department_id = ?', [id]);
    await connection.query('DELETE FROM semesters WHERE Department_id = ?', [id]);
    await connection.query('DELETE FROM graduation_requirements WHERE Department_id = ?', [id]);

    // Step 3: Delete users and students
    await connection.query('DELETE FROM student WHERE Department_id = ?', [id]);
    await connection.query('DELETE FROM user WHERE Department_id = ?', [id]);

    // Step 4: Finally, delete the department
    const [result] = await connection.query('DELETE FROM department WHERE Department_id = ?', [id]);

    if (result.affectedRows === 0) {
      await connection.rollback(); // Rollback if the department does not exist
      return res.status(404).json({ message: 'Department not found.' });
    }

    await connection.commit(); // Commit the transaction
    res.status(204).send(); // Send success response
  } catch (error) {
    await connection.rollback(); // Rollback on error
    console.error('Error deleting department:', error);
    res.status(500).json({ message: 'Internal server error.' });
  } finally {
    connection.release(); // Release the connection back to the pool
  }
});


// Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found.' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
