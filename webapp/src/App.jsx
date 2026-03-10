import { Routes, Route } from 'react-router-dom';
import TopNav from './components/TopNav';
import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';
import Intake from './pages/Intake';
import Analysis from './pages/Analysis';
import BloodBank from './pages/BloodBank';
import Maps from './pages/Maps';
import Queue from './pages/Queue';
import Alerts from './pages/Alerts';

export default function App() {
  return (
    <>
      <TopNav />
      <div className="app-body">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/intake" element={<Intake />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/blood-bank" element={<BloodBank />} />
          <Route path="/maps" element={<Maps />} />
          <Route path="/queue" element={<Queue />} />
          <Route path="/alerts" element={<Alerts />} />
        </Routes>
      </div>
    </>
  );
}
