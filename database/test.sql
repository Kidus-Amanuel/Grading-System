
-- 	Table 2: role
CREATE TABLE roles (
    Role_id INT AUTO_INCREMENT PRIMARY KEY,
    Role_name VARCHAR(255) NOT NULL
);

-- 	Table 3: permission
CREATE TABLE permission (
    Permission_id INT AUTO_INCREMENT PRIMARY KEY,
    Permissionname VARCHAR(255) NOT NULL
);

-- 	Table 4: role_permission
CREATE TABLE role_permission (
    RolePermission_id INT AUTO_INCREMENT PRIMARY KEY,
    Role_id INT,
    Permission_id INT,
    FOREIGN KEY (Role_id) REFERENCES roles (Role_id),
    FOREIGN KEY (Permission_id) REFERENCES permission(Permission_id)
);

-- 	Table 5: batches
CREATE TABLE batche (
    Batch_id INT AUTO_INCREMENT PRIMARY KEY,
    Batchyear INT NOT NULL
);

-- 	Table 6: college
CREATE TABLE college (
    College_id INT AUTO_INCREMENT PRIMARY KEY,
    Collegename VARCHAR(255) NOT NULL
);

-- 	Table 7: department
CREATE TABLE department (
    Department_id INT AUTO_INCREMENT PRIMARY KEY,
    Departmentname VARCHAR(255) NOT NULL,
    College_id INT,
    FOREIGN KEY (college_id) REFERENCES college(College_id)
);

-- 	Table 10: semesters
CREATE TABLE semesters (
    Semester_id INT AUTO_INCREMENT PRIMARY KEY,
    Semestername VARCHAR(255) NOT NULL,
    Year INT NOT NULL,
    Max_ects INT NOT NULL
);


-- 	Table 8: course
CREATE TABLE course (
    Course_id INT AUTO_INCREMENT PRIMARY KEY,
    Coursecode VARCHAR(50) NOT NULL,
    Coursename VARCHAR(255) NOT NULL,
    Credit INT NOT NULL,
    Department_id INT,
    Semester_id INT,
    FOREIGN KEY (department_id) REFERENCES department(Department_id),
    FOREIGN KEY (semester_id) REFERENCES semesters(Semester_id)
);

-- 	Table 9: prerequisite_course
CREATE TABLE prerequisite_course (
    Prerequisiteid INT AUTO_INCREMENT PRIMARY KEY,
    Course_id INT,
    Prerequisite_courses_id INT,
    FOREIGN KEY (course_id) REFERENCES course(Course_id),
    FOREIGN KEY (prerequisite_courses_id) REFERENCES course(Course_id)
);


-- 	Table 1: user
CREATE TABLE user (
    Userid INT AUTO_INCREMENT PRIMARY KEY,
    University_id VARCHAR(50) UNIQUE NOT NULL,
    FullName VARCHAR(255) NOT NULL,
    Email VARCHAR(255) NOT NULL,
    Passwords VARCHAR(255) NOT NULL,
    Role_id INT,
    College_id INT,
    Department_id INT,
    Approve_status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    Verification_status ENUM('Not Verified', 'Verified') DEFAULT 'Not Verified',
    Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (Role_id) REFERENCES roles(Role_id),
    FOREIGN KEY (College_id) REFERENCES college(College_id),
    FOREIGN KEY (department_id) REFERENCES department(department_id)
);
CREATE TABLE student (
    Student_id INT AUTO_INCREMENT PRIMARY KEY,
    University_id VARCHAR(50) UNIQUE NOT NULL,
    Batch_id INT,
    Department_id INT,
    Enrollment_status ENUM('Active', 'Inactive', 'Graduated', 'Dropped') DEFAULT 'Active',
    Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (University_id) REFERENCES user(University_id),
    FOREIGN KEY (Batch_id) REFERENCES batche(Batch_id),
    FOREIGN KEY (Department_id) REFERENCES department(Department_id)
);


-- 	Table 11: enrollment
CREATE TABLE enrollment (
    Enrollmentid INT AUTO_INCREMENT PRIMARY KEY,
    University_id VARCHAR(50),
    Course_id INT,
    Semester_id INT,
    Enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (University_id) REFERENCES user(University_id),
    FOREIGN KEY (Course_id) REFERENCES course(Course_id),
    FOREIGN KEY (Semester_id) REFERENCES semesters(Semester_id)
);

-- 	Table 12: assignment_course
CREATE TABLE assignment_course (
    Assignmentid INT AUTO_INCREMENT PRIMARY KEY,
    Course_id INT,
    University_id VARCHAR(50),
    Semester_id INT,
    FOREIGN KEY (Course_id) REFERENCES course(Course_id),
    FOREIGN KEY (University_id) REFERENCES user(University_id),
    FOREIGN KEY (Semester_id) REFERENCES semesters(Semester_id)
);

-- 	Table 13: student_record_table
CREATE TABLE student_record_table (
    Recordid INT AUTO_INCREMENT PRIMARY KEY,
    University_id VARCHAR(50),
    Course_id INT,
    Semester_id INT,
    Grade VARCHAR(5),
    Credit_earned INT NOT NULL,
    FOREIGN KEY (University_id) REFERENCES user(University_id),
    FOREIGN KEY (Course_id) REFERENCES course(Course_id),
    FOREIGN KEY (Semester_id) REFERENCES semesters(Semester_id)
);

-- 	Table 14: gpa_table
CREATE TABLE gpa_table (
    Gpaid INT AUTO_INCREMENT PRIMARY KEY,
    University_id VARCHAR(50),
    Semester_id INT,
    Semestergpa DECIMAL(3, 2),
    Cumulativegpa DECIMAL(3, 2),
    Status ENUM('Pass', 'Fail') DEFAULT 'Pass',
    FOREIGN KEY (University_id) REFERENCES user(University_id),
    FOREIGN KEY (Semester_id) REFERENCES semesters(Semester_id)
);

-- 	Table 15: graduation_requirements
CREATE TABLE graduation_requirements (
    Reqid INT AUTO_INCREMENT PRIMARY KEY,
    Department_id INT,
    Min_gpa DECIMAL(3, 2),
    Total_credits INT NOT NULL,
    FOREIGN KEY (Department_id) REFERENCES department(Department_id)
);

INSERT INTO college (Collegename) VALUES ('Engineering College');
INSERT INTO department (Departmentname, College_id) 
VALUES 
    ('Computer Science', 1), 
    ('Electrical Engineering', 1), 
    ('Mechanical Engineering', 1);
INSERT INTO batche (Batchyear) VALUES (2022), (2023), (2024);
INSERT INTO roles (Role_name) 
VALUES 
    ('College Dean'), 
    ('Department Head'), 
    ('Instructor'), 
    ('Student');
-- Dean
INSERT INTO user (University_id, FullName, Email, Passwords, Role_id, College_id, Department_id, Approve_status, Verification_status)
VALUES 
    ('D001', 'Dr. Alice Dean', 'alice.dean@example.com', 'hashed_password', 1, 1, NULL, 'Approved', 'Verified');

-- Department Head (Computer Science)
INSERT INTO user (University_id, FullName, Email, Passwords, Role_id, College_id, Department_id, Approve_status, Verification_status)
VALUES 
    ('H001', 'Dr. Bob Head', 'bob.head@example.com', 'hashed_password', 2, 1, 1, 'Approved', 'Verified');
INSERT INTO user (University_id, FullName, Email, Passwords, Role_id, College_id, Department_id, Approve_status, Verification_status)
VALUES 
    ('I001', 'Instructor1', 'instructor1@example.com', 'hashed_password', 3, 1, 1, 'Approved', 'Verified'),
    ('I002', 'Instructor2', 'instructor2@example.com', 'hashed_password', 3, 1, 1, 'Approved', 'Verified'),
    ('I003', 'Instructor3', 'instructor3@example.com', 'hashed_password', 3, 1, 1, 'Approved', 'Verified'),
    ('I004', 'Instructor4', 'instructor4@example.com', 'hashed_password', 3, 1, 1, 'Approved', 'Verified'),
    ('I005', 'Instructor5', 'instructor5@example.com', 'hashed_password', 3, 1, 1, 'Approved', 'Verified'),
    ('I006', 'Instructor6', 'instructor6@example.com', 'hashed_password', 3, 1, 1, 'Approved', 'Verified'),
    ('I007', 'Instructor7', 'instructor7@example.com', 'hashed_password', 3, 1, 1, 'Approved', 'Verified'),
    ('I008', 'Instructor8', 'instructor8@example.com', 'hashed_password', 3, 1, 1, 'Approved', 'Verified'),
    ('I009', 'Instructor9', 'instructor9@example.com', 'hashed_password', 3, 1, 1, 'Approved', 'Verified'),
    ('I010', 'Instructor10', 'instructor10@example.com', 'hashed_password', 3, 1, 1, 'Approved', 'Verified');
INSERT INTO semesters (Semestername, Year, Max_ects) 
VALUES 
    ('Semester 1', 2022, 30),
    ('Semester 2', 2022, 30),
    ('Semester 1', 2023, 30),
    ('Semester 2', 2023, 30);
INSERT INTO course (Coursecode, Coursename, Credit, Department_id, Semester_id)
VALUES 
    ('CS101', 'Introduction to Computer Science', 3, 1, 1),
    ('CS102', 'Data Structures', 3, 1, 1),
    ('CS103', 'Algorithms', 3, 1, 2),
    ('CS201', 'Operating Systems', 3, 1, 2),
    ('CS202', 'Database Systems', 3, 1, 3),
    ('CS301', 'Artificial Intelligence', 3, 1, 3),
    ('CS302', 'Computer Networks', 3, 1, 4),
    ('CS303', 'Software Engineering', 3, 1, 4),
    ('CS401', 'Machine Learning', 3, 1, 4),
    ('CS402', 'Cloud Computing', 3, 1, 4);

-- Prerequisites
INSERT INTO prerequisite_course (Course_id, Prerequisite_courses_id)
VALUES 
    (3, 2), -- Algorithms requires Data Structures
    (4, 1), -- Operating Systems requires Intro to CS
    (7, 5); -- AI requires Database Systems
-- Batch 2022
INSERT INTO user (University_id, FullName, Email, Passwords, Role_id, College_id, Department_id, Approve_status, Verification_status)
VALUES 
    ('S202201', 'Student A1', 'a1@example.com', 'hashed_password', 4, 1, 1, 'Approved', 'Verified'),
    ('S202202', 'Student A2', 'a2@example.com', 'hashed_password', 4, 1, 1, 'Approved', 'Verified'),
    ('S202203', 'Student A3', 'a3@example.com', 'hashed_password', 4, 1, 1, 'Approved', 'Verified'),
    ('S202204', 'Student A4', 'a4@example.com', 'hashed_password', 4, 1, 1, 'Approved', 'Verified'),
    ('S202205', 'Student A5', 'a5@example.com', 'hashed_password', 4, 1, 1, 'Approved', 'Verified');

-- Batch 2023 (similar for other batches, adjust IDs)
INSERT INTO assignment_course (Course_id, University_id, Semester_id)
VALUES 
    (1, 'I001', 1),
    (2, 'I002', 1),
    (3, 'I003', 2),
    (4, 'I004', 2),
    (5, 'I005', 3),
    (6, 'I006', 3),
    (7, 'I007', 4),
    (8, 'I008', 4),
    (9, 'I009', 4),
    (10, 'I010', 4);
INSERT INTO graduation_requirements (Department_id, Min_gpa, Total_credits)
VALUES 
    (1, 2.5, 120); -- Computer Science graduation requirement
-- Course assignments for Semesters
UPDATE course 
SET Semester_id = CASE 
    WHEN Coursecode = 'CS101' THEN 1
    WHEN Coursecode = 'CS102' THEN 1
    WHEN Coursecode = 'CS103' THEN 2
    WHEN Coursecode = 'CS201' THEN 2
    WHEN Coursecode = 'CS202' THEN 3
    WHEN Coursecode = 'CS301' THEN 3
    WHEN Coursecode = 'CS302' THEN 4
    WHEN Coursecode = 'CS303' THEN 4
    WHEN Coursecode = 'CS401' THEN 4
    WHEN Coursecode = 'CS402' THEN 4
END;
-- Enroll Students in Semester 1 Courses
INSERT INTO enrollment (University_id, Course_id, Semester_id)
VALUES 
    ('S202201', 1, 1),
    ('S202202', 1, 1),
    ('S202203', 2, 1),
    ('S202204', 2, 1),
    ('S202205', 1, 1);

-- Enroll Students in Semester 2 Courses
INSERT INTO enrollment (University_id, Course_id, Semester_id)
VALUES 
    ('S202201', 3, 2),
    ('S202202', 3, 2),
    ('S202203', 4, 2),
    ('S202204', 4, 2),
    ('S202205', 4, 2);

-- Repeat for Semester 3 and 4
INSERT INTO enrollment (University_id, Course_id, Semester_id)
VALUES 
    ('S202201', 5, 3),
    ('S202202', 5, 3),
    ('S202203', 6, 3),
    ('S202204', 6, 3),
    ('S202205', 6, 3);

INSERT INTO enrollment (University_id, Course_id, Semester_id)
VALUES 
    ('S202201', 7, 4),
    ('S202202', 7, 4),
    ('S202203', 8, 4),
    ('S202204', 9, 4),
    ('S202205', 10, 4);
