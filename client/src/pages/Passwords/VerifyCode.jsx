import React, { useState } from 'react';

export default function VerifyCode() {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const email = localStorage.getItem("resetEmail");

        const res = await fetch('https://fam-tree-backend.vercel.app/api/verifyCode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code }),
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem("verifiedEmail", email);
            window.location.href = "/reset-password";
        } else {
            setError(data.message || "Invalid code");
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-96">
                <h2 className="text-xl font-bold mb-4 text-center">Verify Code</h2>
                {error && <p className="text-red-600">{error}</p>}
                <input
                    type="text"
                    placeholder="Enter 4-digit code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full p-2 border rounded mb-4"
                    maxLength={4}
                    required
                />
                <button type="submit" className="w-full bg-lime-600 text-white py-2 rounded">
                    Verify
                </button>
            </form>
        </div>
    );
}
