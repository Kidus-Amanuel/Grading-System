import React, { useState } from 'react';
import HeadBan from "../../components/collegeDean/HeadBan";
import AddDepartment from '../../components/collegeDean/AddDepartment';
import ListOfDep from '../../components/collegeDean/ListOfDep';

export default function Dashboard() {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        // Implement search functionality here if needed
        console.log("Search Term:", searchTerm);
    };

    return (
        <div>
            <div className='text-center z-0 bg-white'>
                <div className='z-20 text-center'>
                    <HeadBan title={"Departments"} />
                </div>
                <div className="flex justify-center items-center pt-11 bg-white space-x-4">
                    <form className="max-w-md" onSubmit={handleSearchSubmit}>
                        <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                                </svg>
                            </div>
                            <input 
                                type="search" 
                                id="default-search" 
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                                placeholder="Search" 
                                required 
                            />
                            <button 
                                type="submit" 
                                className="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                            >
                                Search
                            </button>
                        </div>
                    </form>
                    <div>
                        <button 
                            type="button" 
                            onClick={() => setIsOpen(true)}
                            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                        >
                            ADD
                        </button>
                        <AddDepartment open={isOpen} onClose={() => setIsOpen(false)} />
                    </div>
                </div>
                <div className="w-[95%] mx-auto pt-11">
                        <hr />
                    </div>
                <div className="pt-6">
                    <ListOfDep />
                </div>
            </div>   
        </div>
    );
}