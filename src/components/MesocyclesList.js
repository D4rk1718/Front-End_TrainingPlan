import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { FaEdit,  FaPlus, FaEye } from 'react-icons/fa';
import { Modal, Button, Form, Alert, Table, Dropdown } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const MesocycleList = () => {
  const { trainingPlanId } = useParams();
  const [mesocycles, setMesocycles] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [modalData, setModalData] = useState({
    name: '',
    description: '',
    type: '',
    state: '',
    periodoDeEntrenamiento: '',
    objetivosEspecificos: '',
    objetivosGenerales: ''
  });
  const [modalType, setModalType] = useState(''); // 'create' or 'edit'
  const [showModal, setShowModal] = useState(false);

  const fetchMesocycles = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:8080/training-plans/${trainingPlanId}/mesocycles`);
      setMesocycles(response.data);
    } catch (error) {
      console.error('Error fetching mesocycles:', error);
      setErrorMessage('Error fetching mesocycles');
    }
  }, [trainingPlanId]);

  useEffect(() => {
    fetchMesocycles();
  }, [fetchMesocycles]);

 

  const openModal = useCallback((type, mesocycle = {
    name: '',
    description: '',
    type: 'FUERZA',
    state: 'PLANNED',
    periodoDeEntrenamiento: '',
    objetivosEspecificos: '',
    objetivosGenerales: ''
  }) => {
    setModalType(type);
    setModalData(mesocycle);
    setModalTitle(type === 'create' ? 'Crear Nuevo Mesociclo' : 'Editar Mesociclo');
    setShowModal(true);
  }, []);

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setModalData({ ...modalData, [name]: value });
  };

  const handleModalSubmit = useCallback(async () => {
    try {
         // Verificar si el nombre ya existe
    const exists = mesocycles.some(m => m.name === modalData.name);
    if (exists) {
      setErrorMessage('Ya existe un mesociclo con este nombre');
      return;
    }
      if (modalType === 'create') {
        await axios.post(`http://localhost:8080/training-plans/${trainingPlanId}/mesocycles`, modalData);
      } else {
        await axios.put(`http://localhost:8080/training-plans/${trainingPlanId}/mesocycles/${modalData.id}`, modalData);
      }
      fetchMesocycles();
      setShowModal(false);
      setSuccessMessage(modalType === 'create' ? 'Mesociclo creado exitosamente' : 'Mesociclo editado exitosamente');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error submitting form:', error);
      if (error.response) {
        console.error('Server Error:', error.response.data);
        console.error('Status Code:', error.response.status);
        console.error('Headers:', error.response.headers);
      } else if (error.request) {
        console.error('Request Error:', error.request);
      } else {
        console.error('Error:', error.message);
      }
      setErrorMessage('Error submitting form');
    }
  }, [fetchMesocycles, modalData, modalType, trainingPlanId]);

  const handleStateChange = useCallback(async (id, newState) => {
    try {
      const updatedMesocycle = mesocycles.find(mesocycle => mesocycle.id === id);
      updatedMesocycle.state = newState;
      await axios.put(`http://localhost:8080/training-plans/${trainingPlanId}/mesocycles/${id}`, updatedMesocycle);
      fetchMesocycles();
      setSuccessMessage(`Estado del mesociclo con ID ${id} cambiado a ${newState}`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error changing mesocycle state:', error);
      setErrorMessage('Error changing mesocycle state');
    }
  }, [fetchMesocycles, mesocycles, trainingPlanId]);

  return (
    <div className="container mt-5">
      <h2>Lista de Mesociclos</h2>
      {successMessage && (
        <Alert variant="success">
          {successMessage}
        </Alert>
      )}
      {errorMessage && (
        <Alert variant="danger">
          {errorMessage}
        </Alert>
      )}
      <Button variant="primary" className="mb-3" onClick={() => openModal('create')}>
        <FaPlus /> Crear Nuevo Mesociclo
      </Button>

      {mesocycles.length === 0 ? (
        <p>No hay mesociclos disponibles. Crea un nuevo mesociclo para comenzar.</p>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Periodo de Entrenamiento</th>
              <th>Objetivos Específicos</th>
              <th>Objetivos Generales</th>
              <th>Acciones</th>
              <th>Ver</th>
            </tr>
          </thead>
          <tbody>
            {mesocycles.map(mesocycle => (
              <tr key={mesocycle.id}>
                <td>{mesocycle.name}</td>
                <td>{mesocycle.description}</td>
                <td>{mesocycle.type}</td>
                <td>
                  <Dropdown>
                    <Dropdown.Toggle variant="info" id="dropdown-basic">
                      {mesocycle.state}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      {['PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELED'].map(state => (
                        <Dropdown.Item key={state} onClick={() => handleStateChange(mesocycle.id, state)}>
                          {state}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                </td>
                <td>{mesocycle.periodoDeEntrenamiento}</td>
                <td>{mesocycle.objetivosEspecificos}</td>
                <td>{mesocycle.objetivosGenerales}</td>
                <td>
                  <Button variant="secondary" className="mr-2" onClick={() => openModal('edit', mesocycle)}>
                    <FaEdit />
                  </Button>
                  </td>
                  <td>
                  <Link to={`/training-plans/${trainingPlanId}/mesocycles/${mesocycle.id}/microcycles`} className="btn btn-primary mr-2">
                      <FaEye /> View Microcycles
                    </Link>
                 
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formName">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese el nombre"
                name="name"
                value={modalData.name}
                onChange={handleModalChange}
              />
            </Form.Group>
            <Form.Group controlId="formDescription">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Ingrese la descripción"
                name="description"
                value={modalData.description}
                onChange={handleModalChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="type">
              <Form.Label>Tipo</Form.Label>
              <Form.Control
                as="select"
                name="type"
                value={modalData.type}
                onChange={handleModalChange}
              >
                <option value="FUERZA">FUERZA</option>
                <option value="RESISTENCIA">RESISTENCIA</option>
              </Form.Control>
            </Form.Group>
            <Form.Group className="mb-3" controlId="state">
              <Form.Label>Estado</Form.Label>
              <Form.Control
                as="select"
                name="state"
                value={modalData.state}
                onChange={handleModalChange}
              >
                <option value="PLANNED">PLANNED</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELED">CANCELED</option>
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="formPeriodoDeEntrenamiento">
              <Form.Label>Periodo de Entrenamiento</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese el periodo de entrenamiento"
                name="periodoDeEntrenamiento"
                value={modalData.periodoDeEntrenamiento}
                onChange={handleModalChange}
              />
            </Form.Group>
            <Form.Group controlId="formObjetivosEspecificos">
              <Form.Label>Objetivos Específicos</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Ingrese los objetivos específicos"
                name="objetivosEspecificos"
                value={modalData.objetivosEspecificos}
                onChange={handleModalChange}
              />
            </Form.Group>
            <Form.Group controlId="formObjetivosGenerales">
              <Form.Label>Objetivos Generales</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Ingrese los objetivos generales"
                name="objetivosGenerales"
                value={modalData.objetivosGenerales}
                onChange={handleModalChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleModalSubmit}>
            {modalType === 'create' ? 'Crear' : 'Guardar Cambios'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MesocycleList;
