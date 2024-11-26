import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import HeadBan from "./HeadBan";
import AddCourse from './Addcourses';
import ListCourses from './ListofCourses';

export default function DepartCourses() {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const { departmentId } = location.state || {};

    useEffect(() => {
        if (departmentId) {
            console.log("Department ID received:", departmentId);
        }
    }, [departmentId]);

    return (
        <div>
            <div className='text-center z-0'>
                <HeadBan title={"Department Courses"} />
            </div>
            <div className="bg-white pt-11">
                <div className="flex justify-between items-center max-w-md mx-auto mb-4 space-x-20">
                    <form className="flex-grow relative">
                        <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
                        <div className="relative">
                            <input 
                                type="search" 
                                id="default-search" 
                                className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                                placeholder="Search Mockups, Logos..." 
                                required 
                            />
                            <button type="submit" className="text-white absolute right-2.5 top-1.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Search</button>
                        </div>
                    </form>
                    <button 
                        type="button" 
                        onClick={() => setIsOpen(true)}
                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
                        ADD
                    </button>
                </div>
                <AddCourse open={isOpen} onClose={() => setIsOpen(false)} departmentId={departmentId} />
                <div>
                    <div className="w-[95%] py-7 mx-auto">
                        <hr />
                    </div>
                    <ListCourses departmentId={departmentId} />
                </div>
            </div>
        </div>
    );
}