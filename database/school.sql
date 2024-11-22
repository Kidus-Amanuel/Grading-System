-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 20, 2024 at 06:23 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `school`
--

-- --------------------------------------------------------

--
-- Table structure for table `assignment_course`
--

CREATE TABLE `assignment_course` (
  `Assignment_id` int(11) NOT NULL,
  `Course_id` int(11) DEFAULT NULL,
  `University_id` varchar(50) DEFAULT NULL,
  `semester_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `batche`
--

CREATE TABLE `batche` (
  `Batch_id` int(11) NOT NULL,
  `Batchyear` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `college`
--

CREATE TABLE `college` (
  `College_id` int(11) NOT NULL,
  `Collegename` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `course`
--

CREATE TABLE `course` (
  `Course_id` int(11) NOT NULL,
  `Coursecode` varchar(50) NOT NULL,
  `Coursename` varchar(255) NOT NULL,
  `Credit` int(11) NOT NULL,
  `Department_id` int(11) DEFAULT NULL,
  `Semester_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `department`
--

CREATE TABLE `department` (
  `department_id` int(11) NOT NULL,
  `Departmentname` varchar(255) NOT NULL,
  `College_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `enrollment`
--

CREATE TABLE `enrollment` (
  `Enrollmentid` int(11) NOT NULL,
  `University_id` varchar(50) DEFAULT NULL,
  `Course_id` int(11) DEFAULT NULL,
  `semester_id` int(11) DEFAULT NULL,
  `Enrollment_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `gpa_table`
--

CREATE TABLE `gpa_table` (
  `Gpaid` int(11) NOT NULL,
  `University_id` varchar(50) DEFAULT NULL,
  `semester_id` int(11) DEFAULT NULL,
  `Semestergpa` decimal(3,2) DEFAULT NULL,
  `Cumulativegpa` decimal(3,2) DEFAULT NULL,
  `Status` enum('Pass','Fail') DEFAULT 'Pass'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `graduation_requirements`
--

CREATE TABLE `graduation_requirements` (
  `Req_id` int(11) NOT NULL,
  `department_id` int(11) DEFAULT NULL,
  `Min_gpa` decimal(3,2) DEFAULT NULL,
  `Total_credits` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permission`
--

CREATE TABLE `permission` (
  `Permission_id` int(11) NOT NULL,
  `Permissionname` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `prerequisite_course`
--

CREATE TABLE `prerequisite_course` (
  `Prerequisiteid` int(11) NOT NULL,
  `Course_id` int(11) DEFAULT NULL,
  `Prerequisite_courses_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `Role_id` int(11) NOT NULL,
  `Role_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `role_permission`
--

CREATE TABLE `role_permission` (
  `RolePermission_id` int(11) NOT NULL,
  `Role_id` int(11) DEFAULT NULL,
  `Permission_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `semesters`
--

CREATE TABLE `semesters` (
  `semester_id` int(11) NOT NULL,
  `Semestername` varchar(255) NOT NULL,
  `Year` int(11) NOT NULL,
  `Max_ects` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_record_table`
--

CREATE TABLE `student_record_table` (
  `Recordid` int(11) NOT NULL,
  `University_id` varchar(50) DEFAULT NULL,
  `Course_id` int(11) DEFAULT NULL,
  `semester_id` int(11) DEFAULT NULL,
  `Grade` varchar(5) DEFAULT NULL,
  `Credit_earned` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `User_id` int(11) NOT NULL,
  `University_id` varchar(50) NOT NULL,
  `FullName` varchar(255) NOT NULL,
  `Email` varchar(255) NOT NULL,
  `PasswordS` varchar(255) NOT NULL,
  `Role_id` int(11) DEFAULT NULL,
  `College_id` int(11) DEFAULT NULL,
  `Batch_id` int(11) DEFAULT NULL,
  `Department_id` int(11) DEFAULT NULL,
  `Approve_status` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  `Created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `Updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `assignment_course`
--
ALTER TABLE `assignment_course`
  ADD PRIMARY KEY (`Assignment_id`),
  ADD KEY `Course_id` (`Course_id`),
  ADD KEY `University_id` (`University_id`),
  ADD KEY `semester_id` (`semester_id`);

--
-- Indexes for table `batche`
--
ALTER TABLE `batche`
  ADD PRIMARY KEY (`Batch_id`);

--
-- Indexes for table `college`
--
ALTER TABLE `college`
  ADD PRIMARY KEY (`College_id`);

--
-- Indexes for table `course`
--
ALTER TABLE `course`
  ADD PRIMARY KEY (`Course_id`),
  ADD KEY `Department_id` (`Department_id`),
  ADD KEY `Semester_id` (`Semester_id`);

--
-- Indexes for table `department`
--
ALTER TABLE `department`
  ADD PRIMARY KEY (`department_id`),
  ADD KEY `College_id` (`College_id`);

--
-- Indexes for table `enrollment`
--
ALTER TABLE `enrollment`
  ADD PRIMARY KEY (`Enrollmentid`),
  ADD KEY `University_id` (`University_id`),
  ADD KEY `Course_id` (`Course_id`),
  ADD KEY `semester_id` (`semester_id`);

--
-- Indexes for table `gpa_table`
--
ALTER TABLE `gpa_table`
  ADD PRIMARY KEY (`Gpaid`),
  ADD KEY `University_id` (`University_id`),
  ADD KEY `semester_id` (`semester_id`);

--
-- Indexes for table `graduation_requirements`
--
ALTER TABLE `graduation_requirements`
  ADD PRIMARY KEY (`Req_id`),
  ADD KEY `department_id` (`department_id`);

--
-- Indexes for table `permission`
--
ALTER TABLE `permission`
  ADD PRIMARY KEY (`Permission_id`);

--
-- Indexes for table `prerequisite_course`
--
ALTER TABLE `prerequisite_course`
  ADD PRIMARY KEY (`Prerequisiteid`),
  ADD KEY `Course_id` (`Course_id`),
  ADD KEY `Prerequisite_courses_id` (`Prerequisite_courses_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`Role_id`);

--
-- Indexes for table `role_permission`
--
ALTER TABLE `role_permission`
  ADD PRIMARY KEY (`RolePermission_id`),
  ADD KEY `Role_id` (`Role_id`),
  ADD KEY `Permission_id` (`Permission_id`);

--
-- Indexes for table `semesters`
--
ALTER TABLE `semesters`
  ADD PRIMARY KEY (`semester_id`);

--
-- Indexes for table `student_record_table`
--
ALTER TABLE `student_record_table`
  ADD PRIMARY KEY (`Recordid`),
  ADD KEY `University_id` (`University_id`),
  ADD KEY `Course_id` (`Course_id`),
  ADD KEY `semester_id` (`semester_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`User_id`),
  ADD UNIQUE KEY `University_id` (`University_id`),
  ADD KEY `Role_id` (`Role_id`),
  ADD KEY `College_id` (`College_id`),
  ADD KEY `Batch_id` (`Batch_id`),
  ADD KEY `Department_id` (`Department_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `assignment_course`
--
ALTER TABLE `assignment_course`
  MODIFY `Assignment_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `batche`
--
ALTER TABLE `batche`
  MODIFY `Batch_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `college`
--
ALTER TABLE `college`
  MODIFY `College_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `course`
--
ALTER TABLE `course`
  MODIFY `Course_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `department`
--
ALTER TABLE `department`
  MODIFY `department_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `enrollment`
--
ALTER TABLE `enrollment`
  MODIFY `Enrollmentid` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `gpa_table`
--
ALTER TABLE `gpa_table`
  MODIFY `Gpaid` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `graduation_requirements`
--
ALTER TABLE `graduation_requirements`
  MODIFY `Req_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `permission`
--
ALTER TABLE `permission`
  MODIFY `Permission_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `prerequisite_course`
--
ALTER TABLE `prerequisite_course`
  MODIFY `Prerequisiteid` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `Role_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `role_permission`
--
ALTER TABLE `role_permission`
  MODIFY `RolePermission_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `semesters`
--
ALTER TABLE `semesters`
  MODIFY `semester_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_record_table`
--
ALTER TABLE `student_record_table`
  MODIFY `Recordid` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `User_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `assignment_course`
--
ALTER TABLE `assignment_course`
  ADD CONSTRAINT `assignment_course_ibfk_1` FOREIGN KEY (`Course_id`) REFERENCES `course` (`Course_id`),
  ADD CONSTRAINT `assignment_course_ibfk_2` FOREIGN KEY (`University_id`) REFERENCES `user` (`University_id`),
  ADD CONSTRAINT `assignment_course_ibfk_3` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`semester_id`);

--
-- Constraints for table `course`
--
ALTER TABLE `course`
  ADD CONSTRAINT `course_ibfk_1` FOREIGN KEY (`Department_id`) REFERENCES `department` (`department_id`),
  ADD CONSTRAINT `course_ibfk_2` FOREIGN KEY (`Semester_id`) REFERENCES `semesters` (`semester_id`);

--
-- Constraints for table `department`
--
ALTER TABLE `department`
  ADD CONSTRAINT `department_ibfk_1` FOREIGN KEY (`College_id`) REFERENCES `college` (`College_id`);

--
-- Constraints for table `enrollment`
--
ALTER TABLE `enrollment`
  ADD CONSTRAINT `enrollment_ibfk_1` FOREIGN KEY (`University_id`) REFERENCES `user` (`University_id`),
  ADD CONSTRAINT `enrollment_ibfk_2` FOREIGN KEY (`Course_id`) REFERENCES `course` (`Course_id`),
  ADD CONSTRAINT `enrollment_ibfk_3` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`semester_id`);

--
-- Constraints for table `gpa_table`
--
ALTER TABLE `gpa_table`
  ADD CONSTRAINT `gpa_table_ibfk_1` FOREIGN KEY (`University_id`) REFERENCES `user` (`University_id`),
  ADD CONSTRAINT `gpa_table_ibfk_2` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`semester_id`);

--
-- Constraints for table `graduation_requirements`
--
ALTER TABLE `graduation_requirements`
  ADD CONSTRAINT `graduation_requirements_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `department` (`department_id`);

--
-- Constraints for table `prerequisite_course`
--
ALTER TABLE `prerequisite_course`
  ADD CONSTRAINT `prerequisite_course_ibfk_1` FOREIGN KEY (`Course_id`) REFERENCES `course` (`Course_id`),
  ADD CONSTRAINT `prerequisite_course_ibfk_2` FOREIGN KEY (`Prerequisite_courses_id`) REFERENCES `course` (`Course_id`);

--
-- Constraints for table `role_permission`
--
ALTER TABLE `role_permission`
  ADD CONSTRAINT `role_permission_ibfk_1` FOREIGN KEY (`Role_id`) REFERENCES `roles` (`Role_id`),
  ADD CONSTRAINT `role_permission_ibfk_2` FOREIGN KEY (`Permission_id`) REFERENCES `permission` (`Permission_id`);

--
-- Constraints for table `student_record_table`
--
ALTER TABLE `student_record_table`
  ADD CONSTRAINT `student_record_table_ibfk_1` FOREIGN KEY (`University_id`) REFERENCES `user` (`University_id`),
  ADD CONSTRAINT `student_record_table_ibfk_2` FOREIGN KEY (`Course_id`) REFERENCES `course` (`Course_id`),
  ADD CONSTRAINT `student_record_table_ibfk_3` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`semester_id`);

--
-- Constraints for table `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `user_ibfk_1` FOREIGN KEY (`Role_id`) REFERENCES `roles` (`Role_id`),
  ADD CONSTRAINT `user_ibfk_2` FOREIGN KEY (`College_id`) REFERENCES `college` (`College_id`),
  ADD CONSTRAINT `user_ibfk_3` FOREIGN KEY (`Batch_id`) REFERENCES `batche` (`Batch_id`),
  ADD CONSTRAINT `user_ibfk_4` FOREIGN KEY (`Department_id`) REFERENCES `department` (`department_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
