import React from "react";
import './LogoComponent.css';
import logo from '../assets/svg/logo.svg';

function LogoComponent() {
    return (
        <div id="logo">
            <img src={logo} alt="logo" height="50"/>
        </div>
    );
}

export default LogoComponent;
