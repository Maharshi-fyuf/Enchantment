import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import NavBar from './components/NavBar';
import Today from './pages/Today';
import Progress from './pages/Progress';
import History from './pages/History';
import StudyPlanTracker from './components/tracker/StudyPlanTracker';


function AppContent() {
  const location = useLocation();

  return (
    <>
      <NavBar />
      <main className="relative z-10 pb-20 md:pb-0">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Today />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/study" element={<StudyPlanTracker />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </AnimatePresence>
      </main>
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] font-sans">
        <AppContent />
      </div>
    </Router>
  );
}

export default App;
