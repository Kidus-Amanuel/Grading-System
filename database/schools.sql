
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
    Years INT NOT NULL,
    FOREIGN KEY (college_id) REFERENCES college(College_id)
);

-- 	Table 10: semesters
CREATE TABLE semesters (
    Semester_id INT AUTO_INCREMENT PRIMARY KEY,
    Semestername VARCHAR(255) NOT NULL,
    Years INT NOT NULL,
    Department_id INT,
    Max_ects INT NOT NULL,
    FOREIGN KEY (department_id) REFERENCES department(Department_id)

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
    Student_Uni_id VARCHAR(50) UNIQUE NOT NULL,
    Batch_id INT,
    Department_id INT,
    Enrollment_status ENUM('Active', 'Inactive', 'Graduated', 'Dropped') DEFAULT 'Active',
    Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (Student_Uni_id) REFERENCES user(University_id),
    FOREIGN KEY (Batch_id) REFERENCES batche(Batch_id),
    FOREIGN KEY (Department_id) REFERENCES department(Department_id)
);


-- 	Table 11: enrollment
CREATE TABLE enrollment (
    Enrollmentid INT AUTO_INCREMENT PRIMARY KEY,
    Student_Uni_id VARCHAR(50),
    Course_id INT,
    Semester_id INT,
    Enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Student_Uni_id) REFERENCES user(University_id),
    FOREIGN KEY (Course_id) REFERENCES course(Course_id),
    FOREIGN KEY (Semester_id) REFERENCES semesters(Semester_id)
);

-- 	Table 12: assignment_course
CREATE TABLE assignment_course (
    Assignmentid INT AUTO_INCREMENT PRIMARY KEY,
    Course_id INT,
    Instructor_Uni_id VARCHAR(50),
    Semester_id INT,
    FOREIGN KEY (Course_id) REFERENCES course(Course_id),
    FOREIGN KEY (Instructor_Uni_id) REFERENCES user(University_id),
    FOREIGN KEY (Semester_id) REFERENCES semesters(Semester_id)
);

-- 	Table 13: student_record_table
CREATE TABLE student_record_table (
    Recordid INT AUTO_INCREMENT PRIMARY KEY,
    Student_Uni_id VARCHAR(50),
    Course_id INT,
    Semester_id INT,
    Grade VARCHAR(5),
    Credit_earned INT NOT NULL,
    Statues ENUM('Passed', 'Failed') DEFAULT 'Passed',
    FOREIGN KEY (Student_Uni_id) REFERENCES user(University_id),
    FOREIGN KEY (Course_id) REFERENCES course(Course_id),
    FOREIGN KEY (Semester_id) REFERENCES semesters(Semester_id)
);

-- 	Table 14: gpa_table
CREATE TABLE gpa_table (
    Gpaid INT AUTO_INCREMENT PRIMARY KEY,
    Student_Uni_id VARCHAR(50),
    Semester_id INT,
    Semestergpa DECIMAL(3, 2),
    PreSemestergpa DECIMAL(3, 2),
    Semestertotalcredit DECIMAL(3, 2),
    PreSemestertotalcredit DECIMAL(3, 2),
    Cumulativegpa DECIMAL(3, 2),
    Cumulativecredit DECIMAL(3, 2),
    Status ENUM('Pass', 'Fail') DEFAULT 'Pass',
    FOREIGN KEY (Student_Uni_id) REFERENCES user(University_id),
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

CREATE TABLE assessment_component (
    Component_id INT AUTO_INCREMENT PRIMARY KEY,
    Component_name VARCHAR(50) NOT NULL, -- e.g., "Assignment", "Midterm"
    Weights DECIMAL(5, 2) NOT NULL,       -- e.g., 20%, 30%
    Course_id INT,
    FOREIGN KEY (Course_id) REFERENCES course(Course_id)
);

CREATE TABLE student_assessment_scores (
    Score_id INT AUTO_INCREMENT PRIMARY KEY,
    Student_Uni_id VARCHAR(50),        -- Student
    Course_id INT,                    -- Course
    Component_id INT,                 -- Assessment Component
    Score DECIMAL(5, 2) NOT NULL,     -- Score for the component
    FOREIGN KEY (Student_Uni_id) REFERENCES user(University_id),
    FOREIGN KEY (Course_id) REFERENCES course(Course_id),
    FOREIGN KEY (Component_id) REFERENCES assessment_component(Component_id)
);

CREATE TABLE dean_adjustments (
    Adjustment_id INT AUTO_INCREMENT PRIMARY KEY,
    Student_Uni_id VARCHAR(50),
    Course_id INT,
    Suggested_by VARCHAR(50),  -- Dean's ID
    Statues ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Student_Uni_id) REFERENCES user(University_id),
    FOREIGN KEY (Course_id) REFERENCES course(Course_id)
);

