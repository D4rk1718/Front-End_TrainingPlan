import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { FaEdit, FaTrashAlt, FaPlus, FaEye } from 'react-icons/fa';
import { Modal, Button, Form, Alert, Table, Dropdown } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const MesocycleList = () => {
  const { trainingPlanId } = useParams();
  const [mesocycles, setMesocycles] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [modalData, setModalData] = useState({ name: '', description: '', type: '', state: '' });
  const [modalType, setModalType] = useState(''); // 'create' or 'edit'
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchMesocycles();
  }, []);

  const fetchMesocycles = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/training-plans/${trainingPlanId}/mesocycles`);
      setMesocycles(response.data);
    } catch (error) {
      console.error('Error fetching mesocycles:', error);
      setErrorMessage('Error fetching mesocycles');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este mesociclo?')) {
      try {
        await axios.delete(`http://localhost:8080/training-plans/${trainingPlanId}/mesocycles/${id}`);
        fetchMesocycles();
        setSuccessMessage(`Mesociclo con ID ${id} eliminado`);
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('Error deleting mesocycle:', error);
        setErrorMessage('Error deleting mesocycle');
      }
    }
  };

  const openModal = (type, mesocycle = { name: '', description: '', type: '', state: '' }) => {
    setModalType(type);
    setModalData(mesocycle);
    setModalTitle(type === 'create' ? 'Crear Nuevo Mesociclo' : 'Editar Mesociclo');
    setShowModal(true);
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setModalData({ ...modalData, [name]: value });
  };

  const handleModalSubmit = async () => {
    try {
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
      setErrorMessage('Error submitting form');
    }
  };

  const handleStateChange = async (id, newState) => {
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
  };

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

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th>Acciones</th>
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
              <td>
                <Button variant="secondary" className="mr-2" onClick={() => openModal('edit', mesocycle)}>
                  <FaEdit />
                </Button>
                <Button variant="danger" className="mr-2" onClick={() => handleDelete(mesocycle.id)}>
                  <FaTrashAlt />
                </Button>
                <Link to={`/training-plans/${trainingPlanId}/mesocycles/${mesocycle.id}/microcycles`} className="btn btn-info">
                  <FaEye />
                </Link>
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
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cerrar
          </Button>
          <Button variant="primary" onClick={handleModalSubmit}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MesocycleList;
