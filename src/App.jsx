import React from 'react';
import Antalya from './pages/Antalya';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>DG Stok Yönetimi</h1>
      </header>
      <main>
        <Antalya />
      </main>
      <footer>
        <p>&copy; 2023 City App</p>
      </footer>
    </div>
  );
}

export default App;