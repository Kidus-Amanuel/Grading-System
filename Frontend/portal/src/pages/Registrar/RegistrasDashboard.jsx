import React, { useEffect, useState } from "react";
import axios from "axios";
import HeadBan from '../../components/Registrar/RegistrarHeadBan';

export default function RegistrasDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        approvedUsers: 0,
        pendingApprovals: 0,
        verifiedUsers: 0,
    });

    const [pendingUsers, setPendingUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch Registrar Stats when the component mounts
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/registrar/stats', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setStats(response.data);
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };

        const fetchPendingUsers = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/registrar/pending-users', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setPendingUsers(response.data);
            } catch (error) {
                console.error('Error fetching pending users:', error);
            }
        };

        fetchStats();
        fetchPendingUsers();
    }, []);

    // Handle Approve/Reject Actions
    const handleUserAction = async (userId, action) => {
        try {
            if (action === "approve") {
                await axios.post(`http://localhost:5000/api/registrar/approve-user/${userId}`, {}, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                // Update UI state
                setPendingUsers((prev) => prev.filter((user) => user.Userid !== userId));
                setStats((prev) => ({
                    ...prev,
                    approvedUsers: prev.approvedUsers + 1,
                    pendingApprovals: prev.pendingApprovals - 1,
                }));
            } else if (action === "reject") {
                await axios.post(`http://localhost:5000/api/registrar/reject-user/${userId}`, {}, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                // Update UI state
                setPendingUsers((prev) => prev.filter((user) => user.Userid !== userId));
                setStats((prev) => ({
                    ...prev,
                    pendingApprovals: prev.pendingApprovals - 1,
                }));
            }
        } catch (error) {
            console.error(`Error processing user action (${action}):`, error);
        }
    };

    // Handle search input
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const filteredUsers = pendingUsers.filter((user) =>
        user.FullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.Email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className='text-center z-0 bg-gray-100'>
            <div>
                <HeadBan title={"Welcome"} />
            </div>
            <div className="min-h-screen bg-gray-100">
                {/* Header */}
                <header className="bg-white shadow">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex justify-between">
                        <h1 className="text-2xl font-semibold text-gray-800">
                            Registrar Dashboard
                        </h1>
                    </div>
                </header>

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Stats Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 my-6">
                        <div className="bg-white shadow rounded-lg p-6 text-center">
                            <p className="text-gray-600">Total Users</p>
                            <p className="text-2xl font-bold">{stats.totalUsers}</p>
                        </div>
                        <div className="bg-white shadow rounded-lg p-6 text-center">
                            <p className="text-gray-600">Approved Users</p>
                            <p className="text-2xl font-bold">{stats.approvedUsers}</p>
                        </div>
                        <div className="bg-white shadow rounded-lg p-6 text-center">
                            <p className="text-gray-600">Pending Approvals</p>
                            <p className="text-2xl font-bold">{stats.pendingApprovals}</p>
                        </div>
                        <div className="bg-white shadow rounded-lg p-6 text-center">
                            <p className="text-gray-600">Verified Users</p>
                            <p className="text-2xl font-bold">{stats.verifiedUsers}</p>
                        </div>
                    </div>

                    {/* Pending Approvals Section */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">
                                Pending Approvals
                            </h2>
                            <input
                                type="text"
                                className="border border-gray-300 rounded-lg px-4 py-2"
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                        </div>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 text-left text-gray-600 font-medium">Full Name</th>
                                    <th className="px-4 py-2 text-left text-gray-600 font-medium">Email</th>
                                    <th className="px-4 py-2 text-left text-gray-600 font-medium">Role</th>
                                    <th className="px-4 py-2 text-right text-gray-600 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.Userid} className="bg-white hover:bg-gray-50">
                                        <td className="px-4 py-2">{user.FullName}</td>
                                        <td className="px-4 py-2">{user.Email}</td>
                                        <td className="px-4 py-2">{user.Role}</td>
                                        <td className="px-4 py-2 text-right space-x-2">
                                            <button
                                                onClick={() => handleUserAction(user.Userid, "approve")}
                                                className="bg-green-500 text-white px-3 py-1 rounded-lg"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleUserAction(user.Userid, "reject")}
                                                className="bg-red-500 text-white px-3 py-1 rounded-lg"
                                            >
                                                Reject
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}