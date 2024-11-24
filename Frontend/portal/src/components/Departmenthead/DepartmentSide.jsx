import logo from '../../assets/student-grading-system-high-resolution-logo-transparent.png'
import { Avatar, Dropdown} from "flowbite-react";


export default function DepartmentSide(){
    
    return(
        <div className='bg-[#2c3e50] border-r-[0.1rem] border-solid border-[rgb(227,223,232)] h-screen flex flex-col justify-between overflow-y-auto'>
            <aside className=" p-4 w-64 text-lg flex flex-col items-start justify-start overflow-clip">
                <div className="w-full mb-6 flex justify-center">
                    <img src={logo} className="w-34 p-2" alt="Logo" />
                </div>
            
                <nav className="w-full text-white">
                    <ul className="space-y-2">
                        <li>
                            <a href="/DepartmentStudents" className="hover:text-[#ded5f5] hover:bg-[#4f6f8f] block py-2 px-4 border-l-[0.2rem] border-transparent hover:border-[#A773DE] font-medium rounded-md transition-all duration-150 ease-in-out">
                            Dashboard
                            </a>
                            <div> <hr className=' w-65% '/></div>

                        </li>
                        <li>
                            <a href="/DepartmentCourses" className="hover:text-[#ded5f5] hover:bg-[#4f6f8f] block py-2 px-4 border-l-[0.2rem] border-transparent hover:border-[#A773DE] font-medium rounded-md transition-all duration-150 ease-in-out">
                            Courses
                            </a>
                            <div> <hr className=' w-65% '/></div>

                        </li>
                        <li>
                            <a href="/DepartmentInstructor" className="hover:text-[#ded5f5] hover:bg-[#4f6f8f] block py-2 px-4 border-l-[0.2rem] border-transparent hover:border-[#A773DE] font-medium rounded-md transition-all duration-150 ease-in-out">
                            Instructor
                            </a>
                            <div> <hr className=' w-65% '/></div>

                        </li>
                    
                        <li>
                            <a href="/DepartmentProfile" className="hover:text-[#ded5f5] hover:bg-[#4f6f8f] block py-2 px-4 border-l-[0.2rem] border-transparent hover:border-[#A773DE] font-medium rounded-md transition-all duration-150 ease-in-out">
                            My detail
                            </a>
                            <div> <hr className=' w-65% '/></div>

                        </li>
                        
                    </ul>
                </nav>
            </aside>
            <div className='flex justify-center my-6'> 
            <div className='hover:bg-[rgba(167,115,222,0.28)] w-fit rounded-xl px-2 py-2 bg-white'>
                <Dropdown
                    arrowIcon={false}
                    inline
                    label={
                        <Avatar alt="User settings" img="https://flowbite.com/docs/images/people/profile-picture-3.jpg" rounded>
                            <div className="space-y-1 font-medium dark:text-white text-left">
                                <div>Kidus </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Kidus@gmai.com</div>
                            </div>
                        </Avatar>
                    }
                >
                    <Dropdown.Header>
                        <span className="block text-sm">Kidus</span>
                        <span className="block truncate text-sm font-medium">Kidus@gmai.com</span>
                    </Dropdown.Header>
                    <Dropdown.Divider />
                    <Dropdown.Item href='/'>Sign out</Dropdown.Item>
                </Dropdown>
            </div>
            </div>
        </div>
    );
}