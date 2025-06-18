import React, { useState } from 'react';
import { Commet } from 'react-loading-indicators'
import { CircularProgress } from '@mui/material'

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('http://localhost:3000/api/forgotPass', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage("Verification code sent to your email.");
                setLoading(false);
                localStorage.setItem("resetEmail", email); // store for next step
                window.location.href = "/verify-code";
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Something went wrong.");
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-96">
                <h2 className="text-xl font-bold mb-4 text-center">Forgot Password</h2>
                {loading ? (
                    <div className='flex justify-center items-center'>
                        <CircularProgress color="success" />
                    </div>
                ) : (
                    <>
                        {message && <p className="text-green-600">{message}</p>}
                        {error && <p className="text-red-600">{error}</p>}
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 border rounded mb-4"
                            required
                        />
                        <button type="submit" className="w-full bg-lime-600 text-white py-2 rounded">
                            Send Code
                        </button>
                    </>
                )}
            </form>
        </div>
    );
}
