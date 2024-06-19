import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

const MicrocycleList = () => {
  const { trainingPlanId } = useParams();
  const [microcycles, setMicrocycles] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchMicrocycles();
  }, []);

  const fetchMicrocycles = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/training-plans/${trainingPlanId}/microcycles`);
      setMicrocycles(response.data);
    } catch (error) {
      console.error('Error fetching microcycles:', error);
      setErrorMessage('Error fetching microcycles');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este microciclo?')) {
      try {
        await axios.delete(`http://localhost:8080/microcycles/${id}`);
        fetchMicrocycles();
        setSuccessMessage(`Microciclo con ID ${id} eliminado`);
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('Error deleting microcycle:', error);
        setErrorMessage('Error deleting microcycle');
      }
    }
  };

  return (
    <div className="container mt-5">
      <h2>Lista de Microciclos</h2>
      {successMessage && (
        <div className="alert alert-success" role="alert">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="alert alert-danger" role="alert">
          {errorMessage}
        </div>
      )}
      <button type="button" className="btn btn-primary mb-3">
        <FaPlus /> Crear Nuevo Microciclo
      </button>

      <table className="table table-striped">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {microcycles.map(microcycle => (
            <tr key={microcycle.id}>
              <td>{microcycle.name}</td>
              <td>{microcycle.description}</td>
              <td>
                <button className="btn btn-secondary mr-2">
                  <FaEdit />
                </button>
                <button onClick={() => handleDelete(microcycle.id)} className="btn btn-danger">
                  <FaTrashAlt />
                </button>
              </td>
              
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MicrocycleList;
