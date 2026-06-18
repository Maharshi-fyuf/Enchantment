import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Feed from './pages/Feed';
import Log from './pages/Log';
import Study from './pages/Study';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-neutral-900 text-white font-sans selection:bg-cyber-green selection:text-neutral-900">
        <NavBar />
        <main>
          <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/log" element={<Log />} />
            <Route path="/study" element={<Study />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
