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
      'SELECT Userid, University_id, FullName, Passwords, Role_id, College_id ,Department_id FROM user WHERE University_id = ?',
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
      res.status(200).json(courses);
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


// Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found.' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
