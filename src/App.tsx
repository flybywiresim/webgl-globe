import React from 'react';
import './App.css';
import Globe from './globe/Globe';
import LogoComponent from './Components/LogoComponent';

function App() {
    return (
        <div className="App" style={{height: "100vh", width: "100vw"}}>
            <LogoComponent/>
            <Globe globeColor={'#131313'}/>
        </div>
    );
}

export default App;
