import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { FaEdit, FaPlus } from 'react-icons/fa';
import { Modal, Button, Form, Alert, Table, Dropdown } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const MicrocycleList = () => {
  const { trainingPlanId, mesocycleId } = useParams();
  const [microcycles, setMicrocycles] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [modalData, setModalData] = useState({
    name: '',
    description: '',
    cantidadDeSeries: '',
    cantidadDeRepeticiones: '',
    tiempoDeDescanso: '',
    state: 'PLANNED', // Estado por defecto
  });
  const [modalType, setModalType] = useState(''); // 'create' or 'edit'
  const [showModal, setShowModal] = useState(false);

  const fetchMicrocycles = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:8080/training-plans/${trainingPlanId}/mesocycles/${mesocycleId}/microcycles`);
      setMicrocycles(response.data);
    } catch (error) {
      console.error('Error fetching microcycles:', error);
      setErrorMessage('Error fetching microcycles');
    }
  }, [trainingPlanId, mesocycleId]);

  useEffect(() => {
    if (mesocycleId) {
      fetchMicrocycles();
    }
  }, [mesocycleId, fetchMicrocycles]);

  const openModal = (type, microcycle = { // Añadí default
    name: '',
    description: '',
    cantidadDeSeries: '',
    cantidadDeRepeticiones: '',
    tiempoDeDescanso: '',
    state: 'PLANNED'
  }) => {
    setModalType(type);
    setModalData(microcycle);
    setModalTitle(type === 'create' ? 'Crear Nuevo Microciclo' : 'Editar Microciclo');
    setShowModal(true);
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setModalData({ ...modalData, [name]: value });
  };

  const handleStateChange = async (id, newState) => {
    try {
      const updatedMicrocycle = microcycles.find(microcycle => microcycle.id === id);
      updatedMicrocycle.state = newState;
      await axios.put(`http://localhost:8080/training-plans/${trainingPlanId}/mesocycles/${mesocycleId}/microcycles/${id}`, updatedMicrocycle);
      
      // Actualizar la lista desde el servidor
      fetchMicrocycles();

      setSuccessMessage(`Estado del microciclo con ID ${id} cambiado a ${newState}`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error changing microcycle state:', error);
      setErrorMessage('Error al cambiar el estado del microciclo');
    }
  };

  const handleModalSubmit = async () => {
    try {
        // Validación para evitar crear microciclos con el mismo nombre
        const existingMicrocycle = microcycles.find(microcycle => microcycle.name === modalData.name);
      if (existingMicrocycle) {
        setErrorMessage(`Ya existe un microciclo con el nombre "${modalData.name}". Por favor, elija un nombre diferente.`);
        return;
      }
      if (modalType === 'create') {
        await axios.post(`http://localhost:8080/training-plans/${trainingPlanId}/mesocycles/${mesocycleId}/microcycles`, modalData);
      } else {
        await axios.put(`http://localhost:8080/training-plans/${trainingPlanId}/mesocycles/${mesocycleId}/microcycles/${modalData.id}`, modalData);
      }
      fetchMicrocycles();
      setShowModal(false);
      setSuccessMessage(modalType === 'create' ? 'Microciclo creado exitosamente' : 'Microciclo editado exitosamente');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrorMessage('Error al enviar el formulario');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Lista de Microciclos</h2>
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
        <FaPlus /> Crear Nuevo Microciclo
      </Button>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Cantidad de Series</th>
            <th>Cantidad de Repeticiones</th>
            <th>Tiempo de Descanso (segundos)</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {microcycles.map(microcycle => (
            <tr key={microcycle.id}>
              <td>{microcycle.name}</td>
              <td>{microcycle.description}</td>
              <td>{microcycle.cantidadDeSeries}</td>
              <td>{microcycle.cantidadDeRepeticiones}</td>
              <td>{microcycle.tiempoDeDescanso}</td>
              <td>
                <Dropdown>
                  <Dropdown.Toggle variant="info" id="dropdown-basic">
                    {microcycle.state}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {['PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELED'].map(state => (
                      <Dropdown.Item key={state} onClick={() => handleStateChange(microcycle.id, state)}>
                        {state}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </td>
              <td>
                <Button variant="secondary" className="mr-2" onClick={() => openModal('edit', microcycle)}>
                  <FaEdit />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={modalData.name}
                onChange={handleModalChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="description">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={modalData.description}
                onChange={handleModalChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="cantidadDeSeries">
              <Form.Label>Cantidad de Series</Form.Label>
              <Form.Control
                type="number"
                name="cantidadDeSeries"
                value={modalData.cantidadDeSeries}
                onChange={handleModalChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="cantidadDeRepeticiones">
              <Form.Label>Cantidad de Repeticiones</Form.Label>
              <Form.Control
                type="number"
                name="cantidadDeRepeticiones"
                value={modalData.cantidadDeRepeticiones}
                onChange={handleModalChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="tiempoDeDescanso">
              <Form.Label>Tiempo de Descanso (segundos)</Form.Label>
              <Form.Control
                type="number"
                name="tiempoDeDescanso"
                value={modalData.tiempoDeDescanso}
                onChange={handleModalChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="state">
              <Form.Label>Estado</Form.Label>
              <Form.Control
                as="select"
                name="state"
                value={modalData.state}
                onChange={handleModalChange}
              >
                <option value="PLANNED">Planificado</option>
                <option value="ACTIVE">Activo</option>
                <option value="COMPLETED">Completado</option>
                <option value="CANCELED">Cancelado</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cerrar
          </Button>
          <Button variant="primary" onClick={handleModalSubmit}>
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MicrocycleList;
