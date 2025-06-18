import React from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import BdayNotify from './BdayNotify';
import { useSelector } from 'react-redux';

const BootstrapButton = styled(Button)({
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.5)',
    textTransform: 'none',
    fontSize: 20,
    padding: '8px 20px',
    lineHeight: 1.5,
    backgroundColor: '#a7eb30',
    borderColor: '#0063cc',
    color: 'black',
    '&:hover': {
        backgroundColor: '#83b923',
        boxShadow: 'none',
        color: '#ffffff',
    },
    '&:active': {
        boxShadow: 'none',
        backgroundColor: '#0062cc',
        borderColor: '#005cbf',
    },
    '&:focus': {
        boxShadow: '0 0 0 0.2rem rgba(0,123,255,.5)',
    },
});

export default function HomePg() {
    const currentUser = useSelector((state) => state.user);
    return (
        <div className="flex flex-col lg:flex-row min-h-screen p-6">
            {/* Left Section */}
            <div className="w-full lg:w-1/2 flex items-center justify-center mb-10 lg:mb-0">
                <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                    <div className="mb-10">
                        <h1 className="font-semibold text-2xl sm:text-3xl md:text-4xl">Manage your</h1>
                        <div className="font-bold text-5xl sm:text-6xl md:text-7xl">Family</div>
                        <div className="font-bold text-6xl sm:text-7xl md:text-8xl text-green-700">Heritage</div>
                    </div>
                    <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                        {currentUser ? (
                            <>
                                <BootstrapButton variant="contained" href="/family-tree">Create Family Tree</BootstrapButton>
                            </>
                        ) : (
                            <>
                                <BootstrapButton variant="contained" href='/sign-in'>Sign In</BootstrapButton>
                                <BootstrapButton variant="contained" href='/sign-up'>Sign Up</BootstrapButton>
                                <BootstrapButton variant="contained" href="/family-tree">Create Family Tree</BootstrapButton>
                            </>
                        )}

                    </div>
                </div>
            </div>

            {/* Right Section */}
            <div className="w-full lg:w-1/2 flex items-center justify-center">
                <img
                    src="/family-7610392_1920.png"
                    alt="Family Tree"
                    className="max-w-full h-auto"
                />
            </div>
        </div>
    );
}
