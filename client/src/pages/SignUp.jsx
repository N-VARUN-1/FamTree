import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/userSlice.js';
import OAuth from '../components/OAuth.jsx';

export default function Signup() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        const { username, email, password } = formData;

        if (!username || !email || !password) {
            return setMessage({ type: 'error', text: 'Please fill all the fields' });
        }

        try {
            setLoading(true);
            const res = await fetch('https://fam-tree-backend.vercel.app/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
                credentials: 'include'
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Something went wrong!');
            }

            setMessage({ type: 'success', text: data.message || 'User registered successfully!' });
            dispatch(setUser({ email, username }));
            setFormData({ username: '', email: '', password: '' });
            navigate('/sign-in')

        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleOAuth = (provider) => {
        alert(`OAuth with ${provider} clicked!`);
        // Placeholder for OAuth integration
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-lime-50">
            <div className="w-full max-w-md p-8 rounded-2xl shadow-lg bg-white">
                <h2 className="text-3xl font-bold text-lime-600 text-center mb-6">Create your Account</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        name="username"
                        type="text"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Username"
                        className="w-full p-3 border border-lime-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400"
                    />
                    <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email"
                        className="w-full p-3 border border-lime-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400"
                    />
                    <input
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Password"
                        className="w-full p-3 border border-lime-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-lime-500 hover:bg-lime-600 text-white font-semibold py-3 rounded-xl transition"
                    >
                        {loading ? 'Signing up...' : 'Sign Up'}
                    </button>
                </form>

                {message.text && (
                    <div
                        className={`mt-4 text-center font-medium ${message.type === 'error' ? 'text-red-500' : 'text-lime-600'
                            }`}
                    >
                        {message.text}
                    </div>
                )}

                <div className="my-6 text-center text-gray-500">or continue with</div>

                <div className="flex flex-col space-y-3">
                    <OAuth />
                </div>

                <p className="mt-6 text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <a href="/sign-in" className="text-lime-600 font-semibold hover:underline">
                        Sign in
                    </a>
                </p>
            </div>
        </div>
    );
}
