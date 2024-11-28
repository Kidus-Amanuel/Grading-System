import React from 'react'
import ReactDom from 'react-dom'
import { useState, useEffect } from 'react';
import Side from './StudentSide';

export default function InstructorHeadban({title}) {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [screenSize, setScreenSize] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            setScreenSize(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <header className="bg-[#2c3e50] border-b-[0.1rem] border-solid border-[rgb(167,115,222)] p-4 flex items-center justify-between">
            {/* Sidebar Button for Small Screens */}
            {screenSize <= 768 && (
                <button onClick={() => setIsOpen(true)}>
                    <svg
                        className="w-9 h-9 text-gray-800 hover:text-[rgb(167,115,222)] dark:text-white"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M5 7h14M5 12h14M5 17h14" />
                    </svg>
                </button>
            )}
            {/* Title */}
            <h1 className="text-3xl font-semibold text-white flex-1 text-center">{title}</h1>
            {/* Avatar Dropdown */}
            <div className="relative">
                <img
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-10 h-10 rounded-full cursor-pointer"
                    src="https://via.placeholder.com/150"
                    alt="User Avatar"
                />
                {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg dark:bg-gray-700">
                        <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                            <li>
                                <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                                    Dashboard
                                </a>
                            </li>
                            <li>
                                <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                                    Settings
                                </a>
                            </li>
                            <li>
                                <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                                    Sign out
                                </a>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
            {/* Sidebar Popup */}
            <SideBarPopUP open={isOpen} onClose={() => setIsOpen(false)} />
        </header>
    );
}

const Canncel_STYLES = {
    position: 'fixed',
    top: '0%',
    transform: 'translate(0%, 0%)',
    padding: '1rem',
};

const MODAL_STYLES = {
    position: 'fixed',
    top: '50%',
    left: '0%',
    transform: 'translate(0%, -50%)',
    zIndex: 1000,
};

const OVERLAY_STYLES = {
    position: 'fixed',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 1000,
};

function SideBarPopUP({ open, onClose }) {
    if (!open) return null;
    return ReactDom.createPortal(
        <>
            <div style={OVERLAY_STYLES}></div>
            <div style={MODAL_STYLES} className="flex">
                <div>
                    <Side />
                </div>
                <div style={Canncel_STYLES}>
                    <button onClick={onClose}>
                        <svg
                            className="w-6 h-6 text-gray-800 hover:text-[rgb(167,115,222)] dark:text-white"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 17.94 6M18 18 6.06 6" />
                        </svg>
                    </button>
                </div>
            </div>
        </>,
        document.getElementById('portal')
    );
}
