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
      'SELECT Userid, University_id, FullName, Passwords, Role_id, College_id, Department_id, Approve_status FROM user WHERE University_id = ?',
      [UniversityID]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = users[0];

    if (password !== user.Passwords) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Check if the user is approved
    if (user.Approve_status !== 'Approved') {
      return res.status(403).json({ message: 'User not approved. Please contact the admin.' });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.Userid,
        UniversityId: user.University_id,
        collegeId: user.College_id,
        role: user.Role_id,
        DepartmentId: user.Department_id,
      },
      process.env.JWT_SECRET || 'your_jwt_secret', // Use a secure environment variable
      { expiresIn: '1d' } // Token expires in 1 day
    );

    // Map role ID to frontend routes
    const roleRoutes = {
      1: '/Dashboard', // College Dean
      4: '/StudentGpa', // Student
      2: '/DepartmentStudents', // Department Head
      3: '/InstructorCourses', // Instructor
      5: '/RegistrarDashboard', // Registrar
    };

    // Return token and user details
    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.Userid,
        UniversityId: user.University_id,
        name: user.FullName,
        role: user.Role_id,
        collegeId: user.College_id,
        DepartmentId: user.Department_id,
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

// Get courses by department endpoint
app.get('/api/courses', authenticateToken, async (req, res) => {
  const { collegeId } = req.user;

  try {
    const query = `
      SELECT 
        d.Department_id AS id, 
        d.Departmentname AS name, 
        COUNT(c.Course_id) AS totalCourses
      FROM 
        department d
      LEFT JOIN 
        course c ON d.Department_id = c.Department_id
      WHERE 
        d.College_id = ?
      GROUP BY 
        d.Department_id;
    `;
    
    const [results] = await db.execute(query, [collegeId]);
    res.json(results);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ message: 'Failed to fetch courses.' });
  }
});

// Get courses for a specific department
app.get('/api/departments/:id/courses', authenticateToken, async (req, res) => {
  const { id } = req.params; // Get the department ID from the request parameters

  try {
      const query = `
          SELECT 
              c.Course_id AS id,
              c.Coursecode AS code,
              c.Coursename AS name,
              c.Credit AS credit,
              s.Semestername AS semester
          FROM 
              course c
          JOIN 
              semesters s ON c.Semester_id = s.Semester_id
          WHERE 
              c.Department_id = ?;
      `;

      const [results] = await db.execute(query, [id]);

      if (results.length === 0) {
          return res.status(404).json({ message: 'No courses found for this department.' });
      }

      res.json(results);
  } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: 'Failed to fetch courses.' });
  }
});


// Add Course endpoint
app.post('/api/courses', authenticateToken, async (req, res) => {
  const { courseCode, courseName, credits, semesterId, departmentId, prerequisites } = req.body;

  // Validation
  if (!courseCode || !courseName || !credits || !semesterId || !departmentId) {
    return res.status(400).json({ message: 'Course code, name, credits, semester ID, and department ID are required.' });
  }

  try {
    // Insert course into the database
    const [courseResult] = await db.query(
      'INSERT INTO course (Coursecode, Coursename, Credit, Semester_id, Department_id) VALUES (?, ?, ?, ?, ?)',
      [courseCode, courseName, credits, semesterId, departmentId]
    );

    const courseId = courseResult.insertId;

    // If prerequisites are provided, insert them into prerequisite_course table
    if (prerequisites && prerequisites.length > 0) {
      const prerequisitePromises = prerequisites.map(prerequisiteId => {
        return db.query(
          'INSERT INTO prerequisite_course (Course_id, Prerequisite_courses_id) VALUES (?, ?)',
          [courseId, prerequisiteId]
        );
      });

      await Promise.all(prerequisitePromises);
    }

    res.status(201).json({
      message: 'Course added successfully.',
      courseId,
    });
  } catch (error) {
    console.error('Error adding course:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Get semesters for a specific department
app.get('/api/departments/:id/semesters', authenticateToken, async (req, res) => {
  const { id } = req.params; // Get the department ID from the request parameters

  try {
    const query = `
      SELECT 
        s.Semester_id AS id,
        s.Semestername AS name,
        s.Years AS year,
        s.Max_ects AS maxEcts
      FROM 
        semesters s
      WHERE 
        s.Department_id = ?;
    `;

    const [results] = await db.execute(query, [id]);

    if (results.length === 0) {
      return res.status(404).json({ message: 'No semesters found for this department.' });
    }

    res.json(results); // Return the semesters for the department
  } catch (error) {
    console.error("Error fetching semesters:", error);
    res.status(500).json({ message: 'Failed to fetch semesters.' });
  }
});


// Get Course Details endpoint
app.get('/api/course/:id', authenticateToken, async (req, res) => {
  const courseId = req.params.id; // Get course ID from the request parameters

  try {
      // Fetch course details
      const [courses] = await db.query(
          'SELECT c.Course_id, c.Coursecode, c.Coursename, c.Credit, c.Semester_id, c.Department_id ' +
          'FROM course c WHERE c.Course_id = ?',
          [courseId]
      );

      // Check if the course exists
      if (courses.length === 0) {
          return res.status(404).json({ message: 'Course not found.' });
      }

      const course = courses[0]; // Get the first (and should be only) result

      // Fetch prerequisite courses
      const [prerequisites] = await db.query(
          'SELECT pc.Prerequisite_courses_id, c.Coursename ' +
          'FROM prerequisite_course pc ' +
          'JOIN course c ON pc.Prerequisite_courses_id = c.Course_id ' +
          'WHERE pc.Course_id = ?',
          [courseId]
      );

      // Format the response
      const response = {
          course: {
              id: course.Course_id,
              code: course.Coursecode,
              name: course.Coursename,
              credits: course.Credit,
              semesterId: course.Semester_id,
              departmentId: course.Department_id,
          },
          prerequisites: prerequisites.map(prerequisite => ({
              id: prerequisite.Prerequisite_courses_id,
              name: prerequisite.Coursename,
          })),
      };

      res.status(200).json(response);
  } catch (error) {
      console.error('Error fetching course details:', error);
      res.status(500).json({ message: 'Internal server error.' });
  }
});
// Edit Course endpoint
app.put('/api/course/:id', authenticateToken, async (req, res) => {
  const courseId = req.params.id; // Get course ID from the request parameters
  const { courseCode, courseName, credits, semesterId, departmentId, prerequisites } = req.body;

  // Debugging logs
  console.log("Received PUT request to update course");
  console.log("Course ID:", courseId);
  console.log("Request Body:", req.body);

  // Validation
  if (!courseCode || !courseName || credits === undefined || !semesterId || !departmentId) {
      console.log("Validation failed. Missing required fields.");
      return res.status(400).json({ message: 'Course code, name, credits, semester ID, and department ID are required.' });
  }

  try {
      // Update the course in the database
      const [result] = await db.query(
          'UPDATE course SET Coursecode = ?, Coursename = ?, Credit = ?, Semester_id = ?, Department_id = ? WHERE Course_id = ?',
          [courseCode, courseName, credits, semesterId, departmentId, courseId]
      );

      // Debugging log for update result
      console.log("Database update result:", result);

      // Check if the course was updated
      if (result.affectedRows === 0) {
          console.log("Course not found or no changes made.");
          return res.status(404).json({ message: 'Course not found.' });
      }

      // Remove existing prerequisites for the course
      await db.query('DELETE FROM prerequisite_course WHERE Course_id = ?', [courseId]);
      console.log("Existing prerequisites deleted for Course ID:", courseId);

      // If prerequisites are provided, insert them into prerequisite_course table
      if (prerequisites && prerequisites.length > 0) {
          console.log("Inserting prerequisites:", prerequisites);
          const prerequisitePromises = prerequisites.map(prerequisiteId => {
              return db.query(
                  'INSERT INTO prerequisite_course (Course_id, Prerequisite_courses_id) VALUES (?, ?)',
                  [courseId, prerequisiteId]
              );
          });

          await Promise.all(prerequisitePromises);
          console.log("Prerequisites inserted successfully.");
      } else {
          console.log("No prerequisites provided.");
      }

      res.status(200).json({
          message: 'Course updated successfully.',
          courseId,
      });
  } catch (error) {
      console.error('Error updating course:', error);
      res.status(500).json({ message: 'Internal server error.' });
  }
});

// Delete Course endpoint
app.delete('/api/course/:id', authenticateToken, async (req, res) => {
  const courseId = req.params.id; // Get course ID from the request parameters

  try {
      // Check if the course exists
      const [course] = await db.query('SELECT * FROM course WHERE Course_id = ?', [courseId]);
      if (course.length === 0) {
          return res.status(404).json({ message: 'Course not found.' });
      }

      // Delete prerequisites associated with the course
      await db.query('DELETE FROM prerequisite_course WHERE Course_id = ?', [courseId]);

      // Delete the course
      const [result] = await db.query('DELETE FROM course WHERE Course_id = ?', [courseId]);

      // Check if the deletion was successful
      if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Course not found or already deleted.' });
      }

      res.status(200).json({ message: 'Course deleted successfully.' });
  } catch (error) {
      console.error('Error deleting course:', error);
      res.status(500).json({ message: 'Internal server error.' });
  }
});

// Get Students by Department endpoint
app.get('/api/students', authenticateToken, async (req, res) => {
  const { DepartmentId } = req.user; // Extracting DepartmentId from the token

  // Log incoming request details
  console.log('Received request to get students for department ID:', DepartmentId);

  try {
      // Query to get students from the specified department, including names and batch years
      const [students] = await db.query(`
          SELECT 
              s.Student_id,
              u.FullName AS studentName,
              b.Batchyear AS batchYear,
              s.Enrollment_status,
              s.Created_at,
              s.Updated_at
          FROM 
              student s
          JOIN 
              user u ON s.Student_Uni_id = u.University_id
          JOIN 
              batche b ON s.Batch_id = b.Batch_id
          WHERE 
              s.Department_id = ?
      `, [DepartmentId]);

      // Check if students were found
      if (students.length === 0) {
          return res.status(404).json({ message: 'No students found for this department.' });
      }

      // Send success response with students data
      res.status(200).json(students);
  } catch (error) {
      console.error('Error retrieving students:', error);
      res.status(500).json({ message: 'Internal server error.' });
  }
});

app.get('/api/depcourses', authenticateToken, async (req, res) => {
  const { DepartmentId } = req.user; // Extracting departmentId from the token

  // Log incoming request details
  console.log('Received request to get courses for department ID:', DepartmentId);

  try {
      // Query to get courses from the specified department, including course details
      const [courses] = await db.query(`
          SELECT 
              c.Course_id AS id,
              c.Coursecode AS code,
              c.Coursename AS name,
              c.Credit AS credit,
              s.Semestername AS semester
          FROM 
              course c
          JOIN 
              semesters s ON c.Semester_id = s.Semester_id
          WHERE 
              c.Department_id = ?
      `, [DepartmentId]);

      // Log the query results for debugging
      console.log('Courses found:', courses);

      // Check if courses were found
      if (courses.length === 0) {
          return res.status(404).json({ message: 'No courses found for this department.' });
      }

      // Send success response with courses data
      res.status(200).json(courses);
  } catch (error) {
      console.error('Error retrieving courses:', error);
      res.status(500).json({ message: 'Internal server error.' });
  }
});
  
/// introuctors for the department

app.get('/api/instructors', authenticateToken, async (req, res) => {
  const { DepartmentId } = req.user; // Extracting departmentId from the token

  // Log incoming request details
  console.log('Received request to get instructors for department ID:', DepartmentId);

  try {
      // Query to get instructors from the specified department
      const [instructors] = await db.query(`
          SELECT 
              u.University_id,
              u.FullName,
              u.Email
          FROM 
              user u
          WHERE 
              u.Department_id = ? AND u.Role_id = 3
      `, [DepartmentId]);

      // Log the query results for debugging
      console.log('Instructors found:', instructors);

      // Check if instructors were found
      if (instructors.length === 0) {
          return res.status(404).json({ message: 'No instructors found for this department.' });
      }

      // Send success response with instructors data
      res.status(200).json(instructors);
  } catch (error) {
      console.error('Error retrieving instructors:', error);
      res.status(500).json({ message: 'Internal server error.' });
  }
});
// assign course

app.post('/api/assign-course-instructor', authenticateToken, async (req, res) => {
  const { courseId, instructorUniId } = req.body;

  // Input validation
  if (!courseId || !instructorUniId) {
    return res.status(400).json({ message: 'Missing required fields: courseId and instructorUniId' });
  }

  try {
    // Check if course exists
    const [courseExists] = await db.query(`
      SELECT *
      FROM course
      WHERE Course_id = ?
    `, [courseId]);

    if (courseExists.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if instructor exists
    const [instructorExists] = await db.query(`
      SELECT *
      FROM user
      WHERE University_id = ? AND Role_id IN (SELECT Role_id FROM roles WHERE Role_name = 'Instructor')
    `, [instructorUniId]);

    if (instructorExists.length === 0) {
      return res.status(404).json({ message: 'Instructor not found or not an instructor' });
    }

    // Check if course is already assigned to an instructor
    const [existingAssignment] = await db.query(`
      SELECT *
      FROM assignment_course
      WHERE Course_id = ?
    `, [courseId]);

    if (existingAssignment.length > 0) {
      // Update the assignment to the new instructor
      await db.query(`
        UPDATE assignment_course
        SET Instructor_Uni_id = ?
        WHERE Course_id = ?
      `, [instructorUniId, courseId]);

      return res.status(200).json({ message: 'Assignment updated to the new instructor successfully' });
    } else {
      // Create a new assignment
      await db.query(`
        INSERT INTO assignment_course (Course_id, Instructor_Uni_id)
        VALUES (?, ?)
      `, [courseId, instructorUniId]);

      return res.status(201).json({ message: 'Course assigned to instructor successfully' });
    }
  } catch (error) {
    console.error('Error assigning course to instructor:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

//assesment components

app.post('/api/add-assessments', authenticateToken, async (req, res) => {
  const { courseId, assessments } = req.body;

  // Input validation
  if (!courseId || !Array.isArray(assessments) || assessments.length === 0) {
      return res.status(400).json({ message: 'Invalid input: courseId and assessments are required.' });
  }

  try {
      // Check if the course exists
      const [courseExists] = await db.query(`
          SELECT *
          FROM course
          WHERE Course_id = ?
      `, [courseId]);

      if (courseExists.length === 0) {
          return res.status(404).json({ message: 'Course not found.' });
      }

      // Delete all existing assessments for the given course
      await db.query(`
          DELETE FROM assessment_component
          WHERE Course_id = ?
      `, [courseId]);

      // Validate total weight does not exceed 100%
      const totalWeight = assessments.reduce((sum, { weight }) => sum + weight, 0);
      if (totalWeight > 100) {
          return res.status(400).json({ message: 'Total weight of assessments cannot exceed 100%.' });
      }

      // Insert the new assessments for the course
      const insertValues = assessments.map(({ componentName, weight }) => [componentName, weight, courseId]);
      await db.query(`
          INSERT INTO assessment_component (Component_name, Weights, Course_id)
          VALUES ?
      `, [insertValues]);

      res.status(201).json({ message: 'Assessments replaced successfully.' });
  } catch (error) {
      console.error('Error adding assessments:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});


// API Endpoint to Get Courses for a Student's Semester by Department ID
app.get('/api/Semestercourses', authenticateToken, async (req, res) => {
  const { UniversityId } = req.user; // Extracting student university ID from the token

  // Log incoming request details
  console.log('Received request to get courses for student ID:', UniversityId);

  try {
      // Query to get the semester ID and department ID for the student
      const [student] = await db.query(`
          SELECT Semester_id, Department_id 
          FROM student 
          WHERE Student_Uni_id = ?
      `, [UniversityId]);

      // Check if the student exists
      if (student.length === 0) {
          return res.status(404).json({ message: 'Student not found.' });
      }

      const semesterId = student[0].Semester_id;
      const departmentId = student[0].Department_id;

      // Query to get courses for the specified semester and department
      const [courses] = await db.query(`
          SELECT 
              c.Course_id,
              c.Coursecode,
              c.Coursename,
              c.Credit
          FROM 
              course c
          WHERE 
              c.Semester_id = ? AND c.Department_id = ?
      `, [semesterId, departmentId]);

      // Check if courses were found
      if (courses.length === 0) {
          return res.status(404).json({ message: 'No courses found for this semester in the department.' });
      }

      // Send success response with courses data
      res.status(200).json(
        {
          semesterId: semesterId, // Include the student's semester ID
          courses: courses         // Include the courses
      }
      );
  } catch (error) {
      console.error('Error retrieving courses:', error);
      res.status(500).json({ message: 'Internal server error.' });
  }
});

// New endpoint for enrolling in multiple courses
app.post('/api/enroll', authenticateToken, async (req, res) => {
  const { enrollments } = req.body; // Expecting an array of { courseId, semesterId }
  const UniversityId = req.user?.UniversityId; // Ensure University_id is properly retrieved
  console.log(UniversityId)

  if (!UniversityId) {
    return res.status(401).json({ message: 'Unauthorized: Invalid or missing University ID' });
  }

  if (!Array.isArray(enrollments) || enrollments.length === 0) {
    return res.status(400).json({ message: 'Missing required fields: enrollments array' });
  }

  try {
    // Step 1: Fetch completed courses for the student
    const [completedCourses] = await db.query(
      `SELECT Course_id FROM enrollment WHERE Student_Uni_id = ?`,
      [UniversityId]
    );

    const completedCourseIds = completedCourses.map(course => course.Course_id);

    // Step 2: Validate prerequisites for each enrollment
    const failedEnrollments = [];
    for (const { courseId } of enrollments) {
      const [prerequisites] = await db.query(
        `SELECT Prerequisite_courses_id FROM prerequisite_course WHERE Course_id = ?`,
        [courseId]
      );

      const prerequisiteIds = prerequisites.map(prerequisite => prerequisite.Prerequisite_courses_id);
      const unmetPrerequisites = prerequisiteIds.filter(prereqId => !completedCourseIds.includes(prereqId));

      if (unmetPrerequisites.length > 0) {
        failedEnrollments.push({ courseId, unmetPrerequisites });
      }
    }

    if (failedEnrollments.length > 0) {
      return res.status(400).json({
        message: 'Cannot enroll in courses due to unmet prerequisites',
        failedEnrollments,
      });
    }

    // Step 3: Check semester ECTS limit
    const semesterId = enrollments[0]?.semesterId; // Assuming all enrollments are for the same semester
    const [[semesterInfo]] = await db.query(
      `SELECT Max_ects FROM semesters WHERE Semester_id = ?`,
      [semesterId]
    );

    if (!semesterInfo) {
      return res.status(404).json({ message: 'Semester not found' });
    }

    const maxEcts = semesterInfo.Max_ects;

    // Fetch current enrolled courses and their credits for the semester
    const [currentEnrollments] = await db.query(
      `
      SELECT c.Credit FROM enrollment e
      JOIN course c ON e.Course_id = c.Course_id
      WHERE e.Student_Uni_id = ? AND e.Semester_id = ?
      `,
      [UniversityId, semesterId]
    );

    const currentEcts = currentEnrollments.reduce((total, course) => total + course.Credit, 0);

    // Calculate new total ECTS with the new courses
    const newCourseIds = enrollments.map(({ courseId }) => courseId);
    const [newCourses] = await db.query(
      `SELECT Course_id, Credit FROM course WHERE Course_id IN (?)`,
      [newCourseIds]
    );

    const newEcts = newCourses.reduce((total, course) => total + course.Credit, 0);
    const totalEcts = currentEcts + newEcts;

    // Validate against max ECTS
    if (totalEcts > maxEcts) {
      return res.status(400).json({
        message: 'Enrollment exceeds maximum ECTS limit for the semester. Please drop a course.',
        maxEcts,
        totalEcts,
      });
    }

    // Step 4: Prevent duplicate enrollments
    const [existingEnrollments] = await db.query(
      `SELECT Course_id FROM enrollment WHERE Student_Uni_id = ? AND Semester_id = ?`,
      [UniversityId, semesterId]
    );

    const existingCourseIds = existingEnrollments.map(enrollment => enrollment.Course_id);
    const duplicateCourses = newCourseIds.filter(courseId => existingCourseIds.includes(courseId));

    if (duplicateCourses.length > 0) {
      return res.status(400).json({
        message: 'Cannot enroll: Duplicate course(s) detected',
        duplicateCourses,
      });
    }

    // Step 5: Proceed with enrollment
    const sql = `
      INSERT INTO enrollment (Student_Uni_id, Course_id, Semester_id)
      VALUES (?, ?, ?)
    `;

    const promises = enrollments.map(({ courseId, semesterId }) => {
      const values = [UniversityId, courseId, semesterId];
      return db.query(sql, values);
    });

    await Promise.all(promises);

    res.status(201).json({ message: 'Enrolled successfully in multiple courses' });
  } catch (error) {
    console.error('Error enrolling in courses:', error); // Log the error
    res.status(500).json({ message: 'Error enrolling in courses', error: error.message });
  }
});


// API Endpoint to Get Courses Assigned to an Instructor
app.get('/api/instructorCourses', authenticateToken, async (req, res) => {
  const { UniversityId } = req.user; // Extracting instructor's university ID from the token

  // Log incoming request details
  console.log('Received request to get courses for instructor ID:', UniversityId);

  try {
      // Query to get courses assigned to the instructor
      const [courses] = await db.query(`
          SELECT 
              c.Course_id,
              c.Coursecode,
              c.Coursename,
              c.Credit,
              a.Assignmentid
          FROM 
              assignment_course a
          JOIN 
              course c ON a.Course_id = c.Course_id
          WHERE 
              a.Instructor_Uni_id = ?
      `, [UniversityId]);

      // Check if courses were found
      if (courses.length === 0) {
          return res.status(404).json({ message: 'No courses found for this instructor.' });
      }

      // Send success response with courses data
      res.status(200).json(courses);
  } catch (error) {
      console.error('Error retrieving assigned courses:', error);
      res.status(500).json({ message: 'Internal server error.' });
  }
});


// API Endpoint to Get Enrolled Students for a Specific Course
app.get('/api/enrolledStudents/:courseId', authenticateToken, async (req, res) => {
  const { courseId } = req.params; // Extracting course ID from request parameters

  // Log incoming request details
  console.log('Received request to get enrolled students for course ID:', courseId);

  try {
      // Query to get enrolled students for the specified course
      const [students] = await db.query(`
          SELECT 
              u.FullName,
              u.University_id,
              e.Enrollment_date
          FROM 
              enrollment e
          JOIN 
              user u ON e.Student_Uni_id = u.University_id
          WHERE 
              e.Course_id = ?
      `, [courseId]);

      // Check if students were found
      if (students.length === 0) {
          return res.status(404).json({ message: 'No students enrolled in this course.' });
      }

      // Send success response with enrolled students data
      res.status(200).json(students);
  } catch (error) {
      console.error('Error retrieving enrolled students:', error);
      res.status(500).json({ message: 'Internal server error.' });
  }
});

// API Endpoint to Get Assessment Components for a Specific Course
app.get('/api/assessmentComponents/:courseId', authenticateToken, async (req, res) => {
  const { courseId } = req.params; // Extracting course ID from request parameters

  // Log incoming request details
  console.log('Received request to get assessment components for course ID:', courseId);

  try {
      // Query to get assessment components for the specified course
      const [components] = await db.query(`
          SELECT 
              ac.Component_id,
              ac.Component_name,
              ac.Weights
          FROM 
              assessment_component ac
          WHERE 
              ac.Course_id = ?
      `, [courseId]);

      // Check if components were found
      if (components.length === 0) {
          return res.status(404).json({ message: 'No assessment components found for this course.' });
      }

      // Send success response with assessment components data
      res.status(200).json(components);
  } catch (error) {
      console.error('Error retrieving assessment components:', error);
      res.status(500).json({ message: 'Internal server error.' });
  }
});


// API Endpoint to Store Multiple Student Assessment Scores
app.post('/api/studentAssessmentScores', authenticateToken, async (req, res) => {
  const scores = req.body; // Expecting an array of score objects

  console.log('Received request to store multiple student scores:', scores);

  if (!Array.isArray(scores) || scores.length === 0) {
      console.log('Error: Scores must be an array and cannot be empty.');
      return res.status(400).json({ message: 'Scores must be an array and cannot be empty.' });
  }

  try {
      // Prepare the SQL query to check for existing entries
      const sqlCheckExistence = `
          SELECT * FROM student_assessment_scores
          WHERE Student_Uni_id = ? AND Course_id = ? AND Component_id = ?
      `;
      
      const sqlInsert = `
          INSERT INTO student_assessment_scores (Student_Uni_id, Course_id, Component_id, Score)
          VALUES ? 
      `;

      const values = [];
      const existingRecords = [];

      // First, check for duplicates
      for (const score of scores) {
          const { Student_Uni_id, Course_id, Component_id, Score } = score;

          // Check if the record already exists for this student, course, and component
          const [existingRecord] = await db.query(sqlCheckExistence, [Student_Uni_id, Course_id, Component_id]);

          if (existingRecord && existingRecord.length > 0) {
              existingRecords.push({ Student_Uni_id, Course_id, Component_id });
              console.log(`Duplicate record found for Student ${Student_Uni_id} in Course ${Course_id} for Component ${Component_id}`);
          } else {
              // If no existing record, prepare the new score for insertion
              values.push([Student_Uni_id, Course_id, Component_id, Score]);
          }
      }

      // Insert the new scores that do not have duplicates
      if (values.length > 0) {
          await db.query(sqlInsert, [values]);
          console.log('Scores successfully inserted into the database.');
      }

      // If no new records were inserted, let the user know
      if (values.length === 0) {
          return res.status(400).json({ message: 'No new scores to insert (duplicates found).' });
      }

      // Calculate final scores and grades
      const studentScoresMap = {};

      // Sum scores for each student and course
      for (const score of scores) {
          const { Student_Uni_id, Course_id, Score } = score;

          // Initialize if not present
          if (!studentScoresMap[Student_Uni_id]) {
              studentScoresMap[Student_Uni_id] = {
                  Course_id: Course_id,
                  totalScore: 0,
                  count: 0 // To keep track of the number of components
              };
          }

          // Sum the scores
          studentScoresMap[Student_Uni_id].totalScore += Score;
          studentScoresMap[Student_Uni_id].count += 1; // Increment count of components

          console.log(`Updated scores for ${Student_Uni_id} in course ${Course_id}: Total Score = ${studentScoresMap[Student_Uni_id].totalScore}, Components Count = ${studentScoresMap[Student_Uni_id].count}`);
      }

      // Now process each student to determine grades and insert into student_record_table
      for (const [studentId, data] of Object.entries(studentScoresMap)) {
          const { Course_id, totalScore } = data;

          // Final score (sum of all components)
          const finalScore = totalScore;
          console.log(`Final score for ${studentId} in course ${Course_id}: ${finalScore}`);

          // Determine grade and status
          let grade, status;
          if (finalScore >= 90) {
            grade = 'A+';
            status = 'Passed';
        } else if (finalScore >= 85) {
            grade = 'A';
            status = 'Passed';
        } else if (finalScore >= 80) {
            grade = 'A-';
            status = 'Passed';
        } else if (finalScore >= 75) {
            grade = 'B+';
            status = 'Passed';
        } else if (finalScore >= 70) {
            grade = 'B';
            status = 'Passed';
        } else if (finalScore >= 65) {
            grade = 'B-';
            status = 'Passed';
        } else if (finalScore >= 60) {
            grade = 'C+';
            status = 'Passed';
        } else if (finalScore >= 55) {
            grade = 'C';
            status = 'Passed';
        } else if (finalScore >= 50) {
            grade = 'C-';
            status = 'Passed';
        } else if (finalScore >= 40) {
            grade = 'D';
            status = 'Passed';
        } else {
            grade = 'F';
            status = 'Failed';
        }
          console.log(`Assigned grade for ${studentId}: ${grade}, Status: ${status}`);

          // Fetch Semester ID and Credit Earned
          const [studentData] = await db.query(`
              SELECT Semester_id FROM student WHERE Student_Uni_id = ?
          `, [studentId]);

          const [courseData] = await db.query(`
              SELECT Credit FROM course WHERE Course_id = ?
          `, [Course_id]);

          console.log("Semester Data:", studentData); // Log the fetched semester data
          console.log("Credit Data:", courseData); // Log the fetched credit data
          
          const semesterId = studentData && studentData.length > 0 ? studentData[0].Semester_id : null;
          const creditEarned = courseData && courseData.length > 0 ? courseData[0].Credit : null;

          console.log("semester_id", semesterId); // Log the semester ID
          console.log("credit", creditEarned); // Log the credit value

          if (semesterId === null || creditEarned === null) {
              console.log(`Error: Unable to find semester or credit information for ${studentId} in course ${Course_id}.`);
              continue; // Skip this student if data is not found
          }

          // Insert into student_record_table
          await db.query(`
              INSERT INTO student_record_table (Student_Uni_id, Course_id, Semester_id, Grade, Credit_earned, Statues)
              VALUES (?, ?, ?, ?, ?, ?)
          `, [studentId, Course_id, semesterId, grade, creditEarned, status]);

          console.log(`Record inserted for ${studentId} in student_record_table: Grade = ${grade}, Credit Earned = ${creditEarned}, Status = ${status}`);
      }

      res.status(201).json({ message: 'Scores stored and records updated successfully.', existingRecords });
  } catch (error) {
      console.error('Error processing student scores:', error);
      res.status(500).json({ message: 'Internal server error.' });
  }
});


app.post('/api/studentAssessmentScore', authenticateToken, async (req, res) => {
  const scores = req.body; // Expecting an array of score objects

  console.log('Received request to store multiple student scores:', scores);

  if (!Array.isArray(scores) || scores.length === 0) {
      console.log('Error: Scores must be an array and cannot be empty.');
      return res.status(400).json({ message: 'Scores must be an array and cannot be empty.' });
  }

  try {
      const sqlInsert = `
          INSERT INTO student_assessment_scores (Student_Uni_id, Course_id, Component_id, Score)
          VALUES ?
      `;
      const values = scores.map(score => [
          score.Student_Uni_id,
          score.Course_id,
          score.Component_id,
          score.Score
      ]);

      await db.query(sqlInsert, [values]);
      console.log('Scores successfully inserted into the database.');

      // Calculate final scores and grades
      const studentScoresMap = {};

      // Sum scores for each student and course
      for (const score of scores) {
          const { Student_Uni_id, Course_id, Score } = score;

          // Initialize if not present
          if (!studentScoresMap[Student_Uni_id]) {
              studentScoresMap[Student_Uni_id] = {
                  Course_id: Course_id,
                  totalScore: 0,
                  count: 0 // To keep track of the number of components
              };
          }

          // Sum the scores
          studentScoresMap[Student_Uni_id].totalScore += Score;
          studentScoresMap[Student_Uni_id].count += 1; // Increment count of components

          console.log(`Updated scores for ${Student_Uni_id} in course ${Course_id}: Total Score = ${studentScoresMap[Student_Uni_id].totalScore}, Components Count = ${studentScoresMap[Student_Uni_id].count}`);
      }

      // Now process each student to determine grades and insert into student_record_table
      for (const [studentId, data] of Object.entries(studentScoresMap)) {
          const { Course_id, totalScore } = data;

          // Final score (sum of all components)
          const finalScore = totalScore;
          console.log(`Final score for ${studentId} in course ${Course_id}: ${finalScore}`);

          // Determine grade and status
          let grade, status;
          if (finalScore >= 90) {
            grade = 'A+';
            status = 'Passed';
        } else if (finalScore >= 85) {
            grade = 'A';
            status = 'Passed';
        } else if (finalScore >= 80) {
            grade = 'A-';
            status = 'Passed';
        } else if (finalScore >= 75) {
            grade = 'B+';
            status = 'Passed';
        } else if (finalScore >= 70) {
            grade = 'B';
            status = 'Passed';
        } else if (finalScore >= 65) {
            grade = 'B-';
            status = 'Passed';
        } else if (finalScore >= 60) {
            grade = 'C+';
            status = 'Passed';
        } else if (finalScore >= 55) {
            grade = 'C';
            status = 'Passed';
        } else if (finalScore >= 50) {
            grade = 'C-';
            status = 'Passed';
        } else if (finalScore >= 40) {
            grade = 'D';
            status = 'Passed';
        } else {
            grade = 'F';
            status = 'Failed';
        }
          console.log(`Assigned grade for ${studentId}: ${grade}, Status: ${status}`);

          // Fetch Semester ID and Credit Earned
          const [studentData] = await db.query(`
              SELECT Semester_id FROM student WHERE Student_Uni_id = ?
          `, [studentId]);

          const [courseData] = await db.query(`
              SELECT Credit FROM course WHERE Course_id = ?
          `, [Course_id]);

          console.log("Semester Data:", studentData); // Log the fetched semester data
          console.log("Credit Data:", courseData); // Log the fetched credit data
          
          const semesterId = studentData && studentData.length > 0 ? studentData[0].Semester_id : null;
          const creditEarned = courseData && courseData.length > 0 ? courseData[0].Credit : null;

          console.log("semester_id", semesterId); // Log the semester ID
          console.log("credit", creditEarned); // Log the credit value

          if (semesterId === null || creditEarned === null) {
              console.log(`Error: Unable to find semester or credit information for ${studentId} in course ${Course_id}.`);
              continue; // Skip this student if data is not found
          }

          // Insert into student_record_table
          await db.query(`
              INSERT INTO student_record_table (Student_Uni_id, Course_id, Semester_id, Grade, Credit_earned, Statues)
              VALUES (?, ?, ?, ?, ?, ?)
          `, [studentId, Course_id, semesterId, grade, creditEarned, status]);

          console.log(`Record inserted for ${studentId} in student_record_table: Grade = ${grade}, Credit Earned = ${creditEarned}, Status = ${status}`);
      }

      res.status(201).json({ message: 'Scores stored and records updated successfully.' });
  } catch (error) {
      console.error('Error processing student scores:', error);
      res.status(500).json({ message: 'Internal server error.' });
  }
});


//to Get Student Grades for a Course

app.get('/api/studentGrades/:courseId', authenticateToken, async (req, res) => {
  const { courseId } = req.params; // Extracting course ID from request parameters

  // Log incoming request details
  console.log('Received request to get student grades for course ID:', courseId);

  try {
      // Query to get enrolled students and their grades for the specified course
      const [grades] = await db.query(`
          SELECT 
              u.FullName,
              u.University_id,
              sr.Grade,
              sr.Statues AS Status,
              e.Enrollment_date
          FROM 
              enrollment e
          JOIN 
              user u ON e.Student_Uni_id = u.University_id
          JOIN 
              student_record_table sr ON e.Student_Uni_id = sr.Student_Uni_id AND e.Course_id = sr.Course_id
          WHERE 
              e.Course_id = ?
      `, [courseId]);

      // Check if grades were found
      if (grades.length === 0) {
          return res.status(404).json({ message: 'No students found for this course or no grades available.' });
      }

      // Send success response with student grades data
      res.status(200).json(grades);
  } catch (error) {
      console.error('Error retrieving student grades:', error);
      res.status(500).json({ message: 'Internal server error.' });
  }
});


//API Endpoint for Editing Student Grades
app.put('/api/studentAssessmentScores', authenticateToken, async (req, res) => {
  const scores = req.body; // Expecting an array of score objects

  console.log('Received request to update student scores:', scores);

  if (!Array.isArray(scores) || scores.length === 0) {
      console.log('Error: Scores must be an array and cannot be empty.');
      return res.status(400).json({ message: 'Scores must be an array and cannot be empty.' });
  }

  try {
      const sqlDeleteScore = `
          DELETE FROM student_assessment_scores 
          WHERE Student_Uni_id = ? AND Course_id = ? AND Component_id = ?
      `;

      const sqlDeleteRecord = `
          DELETE FROM student_record_table 
          WHERE Student_Uni_id = ? AND Course_id = ? AND Semester_id = ?
      `;

      const sqlInsertScore = `
          INSERT INTO student_assessment_scores (Student_Uni_id, Course_id, Component_id, Score)
          VALUES (?, ?, ?, ?)
      `;

      // Prepare to calculate the final score for each student
      const studentScoresMap = {};

      // Loop through each score and process it
      for (const score of scores) {
          const { Student_Uni_id, Course_id, Component_id, Score } = score;

          // Ensure all required fields are provided
          if (!Student_Uni_id || !Score || !Course_id || !Component_id) {
              return res.status(400).json({ message: 'Missing required fields (Student ID, Score, Course ID, or Component ID).' });
          }

          // Delete existing score record if found (no duplicates)
          await db.query(sqlDeleteScore, [Student_Uni_id, Course_id, Component_id]);
          console.log(`Deleted existing record for Student ${Student_Uni_id} in Course ${Course_id} for Component ${Component_id}`);

          // Insert the new score
          await db.query(sqlInsertScore, [Student_Uni_id, Course_id, Component_id, Score]);
          console.log(`Inserted new record for Student ${Student_Uni_id} in Course ${Course_id} for Component ${Component_id}: Score = ${Score}`);

          // Initialize or update the total score and component count for the student
          if (!studentScoresMap[Student_Uni_id]) {
              studentScoresMap[Student_Uni_id] = {
                  Course_id: Course_id,
                  totalScore: 0,
                  count: 0 // To keep track of the number of components
              };
          }

          studentScoresMap[Student_Uni_id].totalScore += Score;
          studentScoresMap[Student_Uni_id].count += 1; // Increment count of components
      }

      // Now process each student to determine grades and update the student_record_table
      for (const [studentId, data] of Object.entries(studentScoresMap)) {
          const { Course_id, totalScore } = data;

          // Calculate the final score (sum of all components)
          const finalScore = totalScore;
          console.log(`Final score for ${studentId} in course ${Course_id}: ${finalScore}`);

          // Determine grade and status based on final score
          let grade, status;
          if (finalScore >= 90) {
              grade = 'A+';
              status = 'Passed';
          } else if (finalScore >= 85) {
              grade = 'A';
              status = 'Passed';
          } else if (finalScore >= 80) {
              grade = 'A-';
              status = 'Passed';
          } else if (finalScore >= 75) {
              grade = 'B+';
              status = 'Passed';
          } else if (finalScore >= 70) {
              grade = 'B';
              status = 'Passed';
          } else if (finalScore >= 65) {
              grade = 'B-';
              status = 'Passed';
          } else if (finalScore >= 60) {
              grade = 'C+';
              status = 'Passed';
          } else if (finalScore >= 55) {
              grade = 'C';
              status = 'Passed';
          } else if (finalScore >= 50) {
              grade = 'C-';
              status = 'Passed';
          } else if (finalScore >= 40) {
              grade = 'D';
              status = 'Passed';
          } else {
              grade = 'F';
              status = 'Failed';
          }

          console.log(`Assigned grade for ${studentId}: ${grade}, Status: ${status}`);

          // Fetch Semester ID and Credit Earned
          const [studentData] = await db.query(`
              SELECT Semester_id FROM student WHERE Student_Uni_id = ?
          `, [studentId]);

          const [courseData] = await db.query(`
              SELECT Credit FROM course WHERE Course_id = ?
          `, [Course_id]);

          const semesterId = studentData && studentData.length > 0 ? studentData[0].Semester_id : null;
          const creditEarned = courseData && courseData.length > 0 ? courseData[0].Credit : null;

          if (semesterId === null || creditEarned === null) {
              console.log(`Error: Unable to find semester or credit information for ${studentId} in course ${Course_id}.`);
              continue; // Skip this student if data is not found
          }

          // Delete existing record in student_record_table for the same student and course
          await db.query(sqlDeleteRecord, [studentId, Course_id, semesterId]);
          console.log(`Deleted existing record for ${studentId} in student_record_table for Course ${Course_id} and Semester ${semesterId}`);

          // Update the student_record_table with the calculated grade, credit earned, and status
          await db.query(`
              INSERT INTO student_record_table 
              (Student_Uni_id, Course_id, Semester_id, Grade, Credit_earned, Statues) 
              VALUES (?, ?, ?, ?, ?, ?)
          `, [studentId, Course_id, semesterId, grade, creditEarned, status]);

          console.log(`Record updated for ${studentId} in student_record_table: Grade = ${grade}, Credit Earned = ${creditEarned}, Status = ${status}`);
      }

      // Send success response
      res.status(200).json({ message: 'Scores deleted, updated, and records modified successfully.' });
  } catch (error) {
      console.error('Error processing scores:', error);
      res.status(500).json({ message: 'Internal server error.' });
  }
});


// GET: Fetch Registrar Stats
app.get('/api/registrar/stats', authenticateToken, async (req, res) => {
  try {
      const [stats] = await db.query(`
          SELECT 
              (SELECT COUNT(*) FROM user) AS totalUsers,
              (SELECT COUNT(*) FROM user WHERE Approve_status = 'Approved') AS approvedUsers,
              (SELECT COUNT(*) FROM user WHERE Approve_status = 'Pending') AS pendingApprovals,
              (SELECT COUNT(*) FROM user WHERE Verification_status = 'Verified') AS verifiedUsers
      `);

      res.status(200).json(stats[0]);
  } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ message: 'Internal server error.' });
  }
});



// GET: Fetch Pending Approvals
app.get('/api/registrar/pending-users', authenticateToken, async (req, res) => {
  try {
      const [users] = await db.query(`
          SELECT 
              Userid, FullName, Email, 
              (SELECT Role_name FROM roles WHERE Role_id = user.Role_id) AS Role,
              Approve_status
          FROM 
              user
          WHERE 
              Approve_status = 'Pending'
      `);

      res.status(200).json(users);
  } catch (error) {
      console.error('Error fetching pending users:', error);
      res.status(500).json({ message: 'Internal server error.' });
  }
});

// POST: Approve User
app.post('/api/registrar/approve-user/:userId', authenticateToken, async (req, res) => {
  const { userId } = req.params;

  try {
      const [result] = await db.query(`
          UPDATE user 
          SET Approve_status = 'Approved' 
          WHERE Userid = ?
      `, [userId]);

      if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'User not found.' });
      }

      res.status(200).json({ message: 'User approved successfully.' });
  } catch (error) {
      console.error('Error approving user:', error);
      res.status(500).json({ message: 'Internal server error.' });
  }
});

// POST: Reject User
app.post('/api/registrar/reject-user/:userId', authenticateToken, async (req, res) => {
  const { userId } = req.params;

  try {
      const [result] = await db.query(`
          UPDATE user 
          SET Approve_status = 'Rejected' 
          WHERE Userid = ?
      `, [userId]);

      if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'User not found.' });
      }

      res.status(200).json({ message: 'User rejected successfully.' });
  } catch (error) {
      console.error('Error rejecting user:', error);
      res.status(500).json({ message: 'Internal server error.' });
  }
});

// GET: Search Users
app.get('/api/registrar/search-users', authenticateToken, async (req, res) => {
  const { query } = req.query;

  try {
      const [users] = await db.query(`
          SELECT 
              Userid, FullName, Email, 
              (SELECT Role_name FROM roles WHERE Role_id = user.Role_id) AS Role,
              Approve_status
          FROM 
              user
          WHERE 
              FullName LIKE ? OR Email LIKE ?
      `, [`%${query}%`, `%${query}%`]);

      res.status(200).json(users);
  } catch (error) {
      console.error('Error searching users:', error);
      res.status(500).json({ message: 'Internal server error.' });
  }
});



// GET: Fetch all colleges
app.get('/api/colleges', async (req, res) => {
  try {
      // Query to fetch all colleges
      const [colleges] = await db.query(`SELECT * FROM college`);

      // Send the result as a JSON response
      res.status(200).json(colleges);
  } catch (error) {
      console.error('Error fetching colleges:', error);
      res.status(500).json({ message: 'Internal server error.' });
  }
});

// GET: Fetch all departments for a specific college
app.get('/api/collegess/:collegeId/departments', async (req, res) => {
  const { collegeId } = req.params;

  try {
      // Query to fetch departments by college ID
      const [departments] = await db.query(
          `SELECT * FROM department WHERE College_id = ?`, 
          [collegeId]
      );

      if (departments.length === 0) {
          return res.status(404).json({ message: 'No departments found for this college.' });
      }

      // Send the departments as a JSON response
      res.status(200).json(departments);
  } catch (error) {
      console.error('Error fetching departments:', error);
      res.status(500).json({ message: 'Internal server error.' });
  }
});

// GET: Fetch all batches
app.get('/api/batches', async (req, res) => {
  try {
      // Query to fetch all batches
      const [batches] = await db.query(`SELECT * FROM batche`);

      // Send the result as a JSON response
      res.status(200).json(batches);
  } catch (error) {
      console.error('Error fetching batches:', error);
      res.status(500).json({ message: 'Internal server error.' });
  }
});

// GET: Fetch all roles
app.get('/api/roles', async (req, res) => {
  try {
      // Query to fetch all roles
      const [roles] = await db.query(`SELECT * FROM roles`);

      // Send the result as a JSON response
      res.status(200).json(roles);
  } catch (error) {
      console.error('Error fetching roles:', error);
      res.status(500).json({ message: 'Internal server error.' });
  }
});


// Get semesters for a specific department
app.get('/api/departmentss/:id/semesters', async (req, res) => {
  const { id } = req.params; // Get the department ID from the request parameters

  try {
      const query = `
          SELECT 
              s.Semester_id AS id,
              s.Semestername AS name,
              s.Years AS year,
              s.Max_ects AS maxEcts
          FROM 
              semesters s
          WHERE 
              s.Department_id = ?;
      `;

      const [results] = await db.execute(query, [id]);

      if (results.length === 0) {
          return res.status(404).json({ message: 'No semesters found for this department.' });
      }

      res.json(results); // Return the semesters for the department
  } catch (error) {
      console.error("Error fetching semesters:", error);
      res.status(500).json({ message: 'Failed to fetch semesters.' });
  }
});

app.post('/signup', async (req, res) => {
  const {
    universityId,
    fullName,
    email,
    password,
    roleId,
    collegeId,
    departmentId,
    batch,
    semester,
  } = req.body;

  try {
    // Insert into `user` table
    const userQuery = `
      INSERT INTO user 
      (University_id, FullName, Email, Passwords, Role_id, College_id, Department_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const userParams = [
      universityId,
      fullName,
      email,
      password, // No hashing applied
      roleId,
      (roleId === "5" ) ? null : collegeId, // College is not required for College Dean or Registrar
      (roleId === "1" || roleId === "5") ? null : departmentId, // Department is not required for College Dean
    ];

    const [userResult] = await db.execute(userQuery, userParams);

    // If the role is student, insert into `student` table
    if (roleId === '4') { // Assuming '4' corresponds to 'Student'
      const studentQuery = `
        INSERT INTO student (Student_Uni_id, Batch_id, Department_id, Semester_id)
        VALUES (?, ?, ?, ?)
      `;
      const studentParams = [
        universityId,
        batch || null,
        departmentId || null,
        semester || null,
      ];
      await db.execute(studentQuery, studentParams);
    }

    res.status(201).json({ message: 'User added successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while adding the user.' });
  }
});

app.post('/grade-submission-status', authenticateToken, async (req, res) => {
  const { courseId } = req.body;

  try {
      // Step 1: Retrieve the semesterId from the course table
      const [courseResult] = await db.query(`
          SELECT Semester_id FROM course WHERE Course_id = ?
      `, [courseId]);

      if (courseResult.length === 0) {
          return res.status(404).json({ message: 'Course not found.' });
      }

      const semesterId = courseResult[0].Semester_id;

      // Step 2: Delete the existing entry for the course
      await db.query(`
          DELETE FROM grade_submission_status 
          WHERE Course_id = ?
      `, [courseId]);

      // Step 3: Insert the new entry
      const [result] = await db.query(`
          INSERT INTO grade_submission_status (Semester_id, Course_id, SubmittedCount)
          VALUES (?, ?, 1)
      `, [semesterId, courseId]);

      res.status(200).json({ message: 'Submission status updated successfully.', result });
  } catch (error) {
      console.error('Error updating submission status:', error);
      res.status(500).json({ message: 'Internal server error.' });
  }
});

// Endpoint to get the years for a specific department
app.get('/department/years', authenticateToken, async (req, res) => {
  try {
      const { DepartmentId } = req.user; // Get department ID from the request
      console.log(DepartmentId)
      const [yearsResult] = await db.query(`
          SELECT DISTINCT Years FROM department WHERE Department_id = ?
      `, [DepartmentId]);

      if (yearsResult.length === 0) {
          return res.status(404).json({ message: 'Department not found or no years available.' });
      }

      res.status(200).json(yearsResult);
  } catch (error) {
      console.error('Error fetching years:', error);
      res.status(500).json({ message: 'Internal server error.' });
  }
});

// Endpoint to get semesters for a specific year in the department retrieved from the token
app.get('/department/years/:year/semesters', authenticateToken, async (req, res) => {
  const { year } = req.params;
  const { DepartmentId } = req.user; // Get department ID from the request object

  try {
      const [semestersResult] = await db.query(`
          SELECT * FROM semesters WHERE Department_id = ? AND Years = ?
      `, [DepartmentId, year]);

      if (semestersResult.length === 0) {
          return res.status(404).json({ message: 'No semesters found for this year.' });
      }

      res.status(200).json(semestersResult);
  } catch (error) {
      console.error('Error fetching semesters:', error);
      res.status(500).json({ message: 'Internal server error.' });
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
