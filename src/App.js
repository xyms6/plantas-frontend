import React from 'react';
import './App.css';
import PlantList from './components/PlantList';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Catálogo de Plantas</h1>
      </header>
      <main>
        <PlantList />
      </main>
      <footer>
        <p>© 2024 Catálogo de Plantas</p>
      </footer>
    </div>
  );
}

export default App;