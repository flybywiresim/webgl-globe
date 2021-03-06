import React from 'react';
import './App.css';
import Globe from './globe/Globe';
import LogoComponent from './Components/LogoComponent';

function App(): JSX.Element {
    return (
        <div className="App" style={{ height: '100vh', width: '100vw' }}>
            <LogoComponent/>
            <Globe globeColor={'#131313'} speedFactor={0.5} enableZoom={false} enableRotate={false} />
        </div>
    );
}

export default App;
