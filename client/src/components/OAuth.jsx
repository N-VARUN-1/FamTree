import { Button } from 'flowbite-react'
import React, { useState } from 'react'
import { AiFillGoogleCircle } from 'react-icons/ai';
import { GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth';
import { app } from '../firebase';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/userSlice';
import { useNavigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';

export default function OAuth() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const auth = getAuth(app);
    const handleGoogleClick = async () => {
        setLoading(true);
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        try {
            const resultsFromGoogle = await signInWithPopup(auth, provider);
            console.log(resultsFromGoogle);
            const res = await fetch('https://famtree-1.onrender.com/api/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: resultsFromGoogle.user.displayName,
                    email: resultsFromGoogle.user.email,
                    googlePhotoURL: resultsFromGoogle.user.photoURL
                }),
                credentials: 'include'
            });
            const data = await res.json();
            if (res.ok) {
                dispatch(setUser(data));
                navigate('/');
            }
        } catch (error) {
            console.error(error);
        }finally {
            setLoading(false); // Ensure loading is set to false in all cases
        }
    }
    return (
        <Button 
            type='button' 
            gradientDuoTone='pinkToOrange' 
            outline 
            onClick={handleGoogleClick}
            disabled={loading}
        >
            {loading ? (
                <div className="flex items-center justify-center gap-2">
                    <CircularProgress size={20} color="inherit" />
                    <span>Processing...</span>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <AiFillGoogleCircle className='w-6 h-6' />
                    <span>Continue with Google</span>
                </div>
            )}
        </Button>
    )
}
