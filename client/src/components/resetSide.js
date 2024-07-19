import React from 'react'
import logo from '../assets/logo.jpg';
import sl_logo from '../assets/sl_logo.png';
import ResetPass from '../pages/Reset-Password';
import '../resources/authentication.css';

function Resetside() {
    return (
        <div className="d-flex w-100 vh-100">
            <div className="d-none d-lg-flex flex-column position-relative h-100 w-50 align-items-center justify-content-center bg-custom-color">
            <div className="position-absolute top-0 start-0 mt-3 ms-3 d-flex align-items-center">
                <img className="rounded-circle me-2" src={sl_logo} alt="logo2" style={{ width: '40px' }} />
                <p className="text-white fw-semibold mb-0">BudgetTrackr</p>
            </div>
            <div className="d-flex flex-column align-items-center justify-content-center h-100 px-4 text-center">
                <h1 className='text-white display-6 fw-bold mb-4'>Track Your Finance With Us</h1>
                <img className="mb-4" src={logo} alt="logo" style={{ width: '24rem' }} />
                <p className='text-white fw-semibold mb-2'>Track your spending effortlessly, Explore Wisely</p>
                <p className='text-white fw-semibold'>with our expense management tool.</p>
            </div>
            </div>
    
            <div className="w-100 d-flex align-items-center justify-content-center bg-white" style={{ flex: '1' }}>
            <ResetPass />
            </div>
        </div>
    );
}

export default Resetside