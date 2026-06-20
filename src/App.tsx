import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import NavBar from './components/NavBar';
import Today from './pages/Today';
import StudyPlanTracker from './components/tracker/StudyPlanTracker';

// Placeholders for Phase 4
const ProgressPlaceholder = () => <div className="flex items-center justify-center h-[calc(100vh-100px)] text-neutral-500 font-mono">Progress: Coming soon</div>;
const HistoryPlaceholder = () => <div className="flex items-center justify-center h-[calc(100vh-100px)] text-neutral-500 font-mono">History: Coming soon</div>;

function AppContent() {
  const location = useLocation();

  return (
    <>
      <NavBar />
      <main className="relative z-10 pb-20 md:pb-0">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Today />} />
            <Route path="/progress" element={<ProgressPlaceholder />} />
            <Route path="/study" element={<StudyPlanTracker />} />
            <Route path="/history" element={<HistoryPlaceholder />} />
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
