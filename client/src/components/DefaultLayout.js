import React from 'react';
import '../resources/default-layout.css';
import { Button, Dropdown, Menu } from 'antd';
import { NavLink, useNavigate } from 'react-router-dom';

function DefaultLayout(props) {
    const user = JSON.parse(localStorage.getItem('users'));
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('users');
        navigate('/login');
    };

    const handleProfile = () => {
        // Handle the profile option
        // You can navigate to the user's profile page or perform other actions
    };

    const menu = (
        <Menu>
            <Menu.Item key="logout" onClick={handleLogout}>
                Logout
            </Menu.Item>
        </Menu>
    );

    return (
        <div className='layout'>
            <div className='header d-flex justify-content-between align-items-center'>
                <div className="logo-container mx-2">
                    {/* Logo placeholder */}
                    <h1 className='logo'>AtomSpend</h1>
                </div>
                <div>
                    <h1 className='navbar'>
                        <NavLink className="mx-2 mt-4" to='/' exact activeClassName="active">Home</NavLink>
                        <NavLink className="mx-2 mt-4" to='/Set-budget' activeClassName="active">Budget</NavLink>
                        <NavLink className="mx-2 mt-4" to='/goals' activeClassName="active">Goals</NavLink>
                        <NavLink className="mx-2 mt-4" to='/plan' activeClassName="active">Plan</NavLink>
                        <NavLink className="mx-2 mt-4" to='/Export' activeClassName="active">Export</NavLink>
                    </h1>
                </div>
                <div>
                    <Dropdown overlay={menu} placement='bottomLeft'>
                        <Button className='setting primary2'>{user.name}</Button>
                    </Dropdown>
                </div>
            </div>
            <div className='content'>{props.children}</div>
        </div>
    );
}

export default DefaultLayout;
