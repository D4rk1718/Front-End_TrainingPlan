import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrashAlt, FaPlus, FaEye } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { Modal } from 'bootstrap';
import moment from 'moment';  // Importing moment.js

const TrainingPlanList = () => {
  const [trainingPlans, setTrainingPlans] = useState([]);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', fechaInicio: '', fechaFin: '', mesocycles: [] });
  const [newPlanData, setNewPlanData] = useState({ name: '', description: '', fechaInicio: '', fechaFin: '' });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const createPlanModalRef = useRef(null);
  const modalInstance = useRef(null);

  useEffect(() => {
    fetchTrainingPlans();
  }, []);

  const fetchTrainingPlans = async () => {
    try {
      const response = await axios.get('http://localhost:8080/training-plans');
      setTrainingPlans(response.data);
    } catch (error) {
      console.error('Error fetching training plans:', error);
      setErrorMessage('Error fetching training plans');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este plan de entrenamiento?')) {
      try {
        await axios.delete(`http://localhost:8080/training-plans/${id}`);
        fetchTrainingPlans();
        setSuccessMessage(`Plan de entrenamiento con ID ${id} eliminado`);
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('Error deleting training plan:', error);
        setErrorMessage('Error deleting training plan');
      }
    }
  };

  const handleEditClick = (plan) => {
    setEditingPlanId(plan.id);
    setFormData({
      name: plan.name || '',
      description: plan.description || '',
      fechaInicio: plan.fechaInicio || '',
      fechaFin: plan.fechaFin || '',
      mesocycles: plan.mesocycles || []
    });
  };

  const handleEditChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const existingPlan = trainingPlans.find(plan => plan.name.toLowerCase() === formData.name.toLowerCase() && plan.id !== editingPlanId);
      if (existingPlan) {
        setErrorMessage('Ya existe un plan de entrenamiento con este nombre.');
        setTimeout(() => setErrorMessage(''), 3000);
        return;
      }
      const response = await axios.put(`http://localhost:8080/training-plans/${editingPlanId}`, formData);
      if (response.status === 200) {
        setEditingPlanId(null);
        setSuccessMessage('El plan de entrenamiento ha sido editado exitosamente');
        fetchTrainingPlans();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error('Error editing training plan');
      }
    } catch (error) {
      console.error('Error editing training plan:', error);
      setErrorMessage('Error editing training plan');
    }
  };

  const handleCancelEdit = () => {
    setEditingPlanId(null);
  };

  const handleCreateChange = (e) => {
    setNewPlanData({ ...newPlanData, [e.target.name]: e.target.value });
  };

  const handleCreateSubmit = async (e) => { 
    e.preventDefault();
    try {
      const existingPlan = trainingPlans.find(plan => plan.name.toLowerCase() === newPlanData.name.toLowerCase());
      if (existingPlan) {
        setErrorMessage('Ya existe un plan de entrenamiento con este nombre.');
        setTimeout(() => setErrorMessage(''), 3000);
        return;
      }
      const currentDate = moment().startOf('day');  // Getting the current date
      const startDate = moment(newPlanData.fechaInicio);

      if (startDate.isBefore(currentDate)) {
        setErrorMessage('La fecha de inicio no puede ser anterior a la fecha actual.');
        setTimeout(() => setErrorMessage(''), 3000);
        return;
      }

      const response = await axios.post('http://localhost:8080/training-plans', newPlanData);
      if (response.status === 200 || response.status === 201) {
        setNewPlanData({ name: '', description: '', fechaInicio: '', fechaFin: '' });
        fetchTrainingPlans();
        setSuccessMessage('Plan de entrenamiento creado exitosamente');
        setTimeout(() => setSuccessMessage(''), 3000);
        if (modalInstance.current) {
          modalInstance.current.hide();
        }
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => backdrop.remove());
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      } else {
        throw new Error('Error creating training plan: HTTP status ' + response.status);
      }
    } catch (error) {
      console.error('Error creating training plan:', error);
      setErrorMessage('Error creando plan de entrenamiento. Por favor, verifica los detalles y vuelve a intentarlo.');
    }
  };

  useEffect(() => {
    if (createPlanModalRef.current) {
      modalInstance.current = new Modal(createPlanModalRef.current);
    }
  }, []);

  return (
    <div className="container mt-5">
      <h2>Lista de Planes de Entrenamiento</h2>
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
      <button type="button" className="btn btn-primary mb-3" onClick={() => modalInstance.current.show()}>
        <FaPlus /> Crear Nuevo Plan de Entrenamiento
      </button>

      <table className="table table-striped">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Fecha Inicio</th>
            <th>Fecha Fin</th>
            <th>Acciones</th>
            <th>Ver</th>
          </tr>
        </thead>
        <tbody>
          {trainingPlans.map(plan => (
            <tr key={plan.id}>
              {editingPlanId === plan.id ? (
                <td colSpan="6">
                  <form onSubmit={handleEditSubmit}>
                    <div className="form-group">
                      <label htmlFor="name">Nombre</label>
                      <input type="text" className="form-control" id="name" name="name" value={formData.name} onChange={handleEditChange} required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="description">Descripción</label>
                      <input type="text" className="form-control" id="description" name="description" value={formData.description} onChange={handleEditChange} required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="fechaInicio">Fecha Inicio</label>
                      <input type="date" className="form-control" id="fechaInicio" name="fechaInicio" value={formData.fechaInicio} onChange={handleEditChange} required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="fechaFin">Fecha Fin</label>
                      <input type="date" className="form-control" id="fechaFin" name="fechaFin" value={formData.fechaFin} onChange={handleEditChange} required />
                    </div>
                    <button type="submit" className="btn btn-primary">Guardar</button>
                    <button type="button" className="btn btn-secondary ml-2" onClick={handleCancelEdit}>Cancelar</button>
                  </form>
                </td>
              ) : (
                <>
                  <td>{plan.name}</td>
                  <td>{plan.description}</td>
                  <td>{moment(plan.fechaInicio).format('YYYY-MM-DD')}</td> {/* Formatting date */}
                  <td>{moment(plan.fechaFin).format('YYYY-MM-DD')}</td> {/* Formatting date */}
                  <td>
                    <button onClick={() => handleEditClick(plan)} className="btn btn-secondary mr-2">
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDelete(plan.id)} className="btn btn-danger">
                      <FaTrashAlt />
                    </button>
                  </td>
                  <td>
                    <Link to={`/training-plans/${plan.id}/mesocycles`} className="btn btn-primary mr-2">
                      <FaEye /> View Mesocycles
                    </Link>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for creating a new training plan */}
      <div className="modal fade" ref={createPlanModalRef} tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">Crear Nuevo Plan de Entrenamiento</h5>
              <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreateSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Nombre</label>
                  <input type="text" className="form-control" id="name" name="name" value={newPlanData.name} onChange={handleCreateChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="description">Descripción</label>
                  <input type="text" className="form-control" id="description" name="description" value={newPlanData.description} onChange={handleCreateChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="fechaInicio">Fecha Inicio</label>
                  <input type="date" className="form-control" id="fechaInicio" name="fechaInicio" value={newPlanData.fechaInicio} onChange={handleCreateChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="fechaFin">Fecha Fin</label>
                  <input type="date" className="form-control" id="fechaFin" name="fechaFin" value={newPlanData.fechaFin} onChange={handleCreateChange} required />
                </div>
                <button type="submit" className="btn btn-primary">Crear</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingPlanList;
