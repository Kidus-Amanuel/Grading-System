import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios'; // Import Axios for API calls

const MODAL_STYLES = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#fff',
    padding: '1rem',
    borderRadius: '10px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
    zIndex: 1000,
    width: '90%', 
    maxWidth: '400px', 
    height: '75%',
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

const CLOSE_BUTTON_STYLES = {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    border: 'none',
    borderRadius: '50%',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
    padding: '0.5rem',
    cursor: 'pointer',
};

export default function Login({ open, onClose }) {
    const [UniversityID, setUniversityID] = useState('');
    const [password, setpassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        
        if (!UniversityID || !password) {
            setError('Please fill in both fields.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/login', {
                UniversityID,
                password,
            });

            // Navigate based on the role returned from the backend
            const { route } = response.data;
            navigate(route); // Navigate to the appropriate route
        } catch (error) {
            if (error.response) {
                setError(error.response.data.message); // Set error message from backend
            } else {
                setError('An error occurred. Please try again later.');
            }
        }
    };

    if (!open) return null;

    return ReactDOM.createPortal(
        <>
            <div style={OVERLAY_STYLES}></div>
            <div style={MODAL_STYLES}>
                <div className='flex justify-between items-center mb-4'>
                    <button onClick={onClose} style={CLOSE_BUTTON_STYLES}>
                        <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L17.94 6M18 18L6.06 6" />
                        </svg>
                    </button>
                </div>

                <div className="flex flex-col justify-center items-center">
                    <h1 className="text-4xl font-bold text-center text-[#2c3e50] mb-2">Welcome</h1>

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label className="block text-gray-700 font-bold mb-2" htmlFor="UniversityID">
                                University ID
                            </label>
                            <input
                                className="w-full px-4 py-2 rounded-lg border border-gray-400"
                                id="UniversityID"
                                name="UniversityID"
                                type="text"
                                value={UniversityID}
                                onChange={(e) => setUniversityID(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-bold mb-2" htmlFor="password">
                                Password
                            </label>
                            <input
                                className="w-full px-4 py-2 rounded-lg border border-gray-400"
                                id="password"
                                name="password"
                                type="password" // Change type to password for security
                                value={password}
                                onChange={(e) => setpassword(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <button className="w-full bg-[#2c3e50] hover:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg">
                                Log In
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>,
        document.getElementById('portal')
    );
}