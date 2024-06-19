import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TrainingPlanList from './components/TrainingPlanList';
import MesocycleList from './components/MesocyclesList';
import MicrocycleList from './components/MicrocyclesList';

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<TrainingPlanList />} />
      <Route path="/training-plans" element={<TrainingPlanList />} />
      <Route path="/mesocycles/:trainingPlanId" element={<MesocycleList />} />
      <Route path="/microcycles/:trainingPlanId" element={<MicrocycleList />} />
    </Routes>
  </Router>
);

export default App;
