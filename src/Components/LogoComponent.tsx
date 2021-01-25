import React from 'react';
import './LogoComponent.scss';
import logo from '../assets/svg/logo.svg';

export default function Logo(): JSX.Element {
    return (
        <img id="logo" src={logo} alt="logo" height="50"/>
    );
}
