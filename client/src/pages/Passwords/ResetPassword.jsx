import React, { useState } from 'react';

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const email = localStorage.getItem("verifiedEmail");

        if (!email) return setError("Verification expired or invalid.");

        if (password !== confirm) return setError("Passwords do not match");

        const res = await fetch("https://fam-tree-backend.vercel.app/api/resetPass", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
        });

        const data = await res.json();

        if (res.ok) {
            setMessage("Password reset successfully!");
            localStorage.removeItem("verifiedEmail");
            window.location.href = "/sign-in";
        } else {
            setError(data.message || "Failed to reset password");
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-96">
                <h2 className="text-xl font-bold mb-4 text-center">Reset Password</h2>
                {error && <p className="text-red-600">{error}</p>}
                {message && <p className="text-green-600">{message}</p>}
                <input
                    type="password"
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 border rounded mb-4"
                    required
                />
                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full p-2 border rounded mb-4"
                    required
                />
                <button type="submit" className="w-full bg-lime-600 text-white py-2 rounded">
                    Reset Password
                </button>
            </form>
        </div>
    );
}
