import './App.css';
import { Routes, Route, useLocation } from 'react-router-dom';

import Home from './Home.jsx';
import Side from './components/collegeDean/Side.jsx';
import Dashboard from './pages/CollegeDean/Dashboard.jsx';
import Management from './pages/CollegeDean/Managment.jsx';
import Notification from './pages/CollegeDean/Notification.jsx';
import Profile from './pages/CollegeDean/Profile.jsx';
import Login from './components/login.jsx';
import Courses from './pages/CollegeDean/Courses.jsx';
import DepartmentProfile from './pages/DepartmentHead/DepartmentProfile.jsx';
import DepartmentCourses from './pages/DepartmentHead/DepartmentCourses.jsx';
import DepartmentStudents from './pages/DepartmentHead/DepartmentStudent.jsx';
import DepartmentInstructors from './pages/DepartmentHead/DepartmentInstructor.jsx';
import DepartmentSide from './components/Departmenthead/DepartmentSide.jsx';
import InstructorCourses from './pages/Instructor/InstructorCourses.jsx';
import InstructorGrade from './pages/Instructor/InstructorGrade.jsx';
import InstructorProfile from './pages/Instructor/InstructorProfile.jsx';
import InstructorSide from './components/Instructor/InstructorSide.jsx';
import StudentCourses from './pages/Student/StudentCourses.jsx';
import StudentGpa from './pages/Student/StudentGpa.jsx';
import StudentProfile from './pages/Student/StudentProfile.jsx';
import StudentSide from './components/Student/StudentSide.jsx';

function App() {
  const location = useLocation();

  // Define route groups
  const deanRoutes = ['/Dashboard', '/Courses', '/Management', '/Notification', '/Profile'];
  const departmentRoutes = [
    '/DepartmentProfile',
    '/DepartmentCourses',
    '/DepartmentInstructor',
    '/DepartmentStudents',
  ];
  const instructorRoutes = ['/InstructorCourses', '/InstructorGrade', '/InstructorProfile'];
  const studentRoutes = ['/StudentCourses', '/StudentGpa', '/StudentProfile'];

  // Determine which sidebar to show
  const showDeanSidebar = deanRoutes.includes(location.pathname);
  const showDepartmentSidebar = departmentRoutes.includes(location.pathname);
  const showInstructorSidebar = instructorRoutes.includes(location.pathname);
  const showStudentSidebar = studentRoutes.includes(location.pathname);

  // Check if current path is the login page
  const isLoginPage = location.pathname === '/Login';

  return (
    <div className="flex md:flex-row flex-col h-screen bg-[#DCD4F1]">
      {!['/', '/Login'].includes(location.pathname) && (
        <div className="m-0 px-0 py-0 md:h-full w-fit">
          {showDeanSidebar && <Side />}
          {showDepartmentSidebar && <DepartmentSide />}
          {showInstructorSidebar && <InstructorSide />}
          {showStudentSidebar && <StudentSide />}
        </div>
      )}
      <div className="md:flex-1 overflow-y-auto overflow-x-hidden">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/Courses" element={<Courses />} />
          <Route path="/Management" element={<Management />} />
          <Route path="/Notification" element={<Notification />} />
          <Route path="/Profile" element={<Profile />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/DepartmentProfile" element={<DepartmentProfile />} />
          <Route path="/DepartmentCourses" element={<DepartmentCourses />} />
          <Route path="/DepartmentInstructor" element={<DepartmentInstructors />} />
          <Route path="/DepartmentStudents" element={<DepartmentStudents />} />
          <Route path="/InstructorCourses" element={<InstructorCourses />} />
          <Route path="/InstructorGrade" element={<InstructorGrade />} />
          <Route path="/InstructorProfile" element={<InstructorProfile />} />
          <Route path="/StudentCourses" element={<StudentCourses />} />
          <Route path="/StudentGpa" element={<StudentGpa />} />
          <Route path="/StudentProfile" element={<StudentProfile />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
