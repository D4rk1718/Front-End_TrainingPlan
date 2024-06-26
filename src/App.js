import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Cambiado de Switch a Routes
import TrainingPlanList from './components/TrainingPlanList';
import MesocyclesList from './components/MesocyclesList';
import MicrocyclesList from './components/MicrocyclesList';

const App = () => {
  return (
    <Router>
      <Routes> {}
        <Route path="/" element={<TrainingPlanList />} />
        <Route path="/training-plans" element={<TrainingPlanList />} />
        <Route path="/training-plans/:trainingPlanId/mesocycles" element={<MesocyclesList />} />
        <Route path="/training-plans/:trainingPlanId/mesocycles/:mesocycleId/microcycles" element={<MicrocyclesList />} />
      </Routes> {}
    </Router>
  );
};

export default App;
