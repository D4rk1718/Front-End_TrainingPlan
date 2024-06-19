
import React from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Importar Bootstrap y Popper.js
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

// Configurar la URL base de Axios
axios.defaults.baseURL = 'http://localhost:8080';

// Crear el contenedor para React
const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
