import React, { useState } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { useUser } from '../../../context/UserContext';
import { addDevice } from '../../../api/devices/devices';

const AddMicrocontroller = ({ refresh }) => {
  const [show, setShow] = useState(false);
  const [chipId, setChipId] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useUser();

  const handleClose = () => {
    setShow(false);
    setChipId('');
    setName('');
    setError('');
    setSuccess('');
    setLoading(false);
  };

  const handleShow = () => setShow(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
  
    if (!chipId.trim()) {
      setError('Chip ID is required.');
      setLoading(false);
      return;
    }
  
    try {
      const { data, error } = await addDevice(chipId, user.user.id, name);
      console.log(data);
  
      if (error) throw error;
  
      setSuccess('Microcontroller linked successfully!');
      setChipId('');
      setName('');

      if (refresh) {
        refresh();
      }
  
      setLoading(false);
      setShow(false);
    } catch (err) {
      setError('Failed to link microcontroller.');
      setLoading(false);
    }
  };
  
  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        Link Microcontroller
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Link a New Microcontroller</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formMicroController">
              <Form.Label className='mt-3'>Chip ID</Form.Label>
              <br />
              <Form.Text className="text-muted">
                The Chip ID is a unique identifier for your microcontroller.
              </Form.Text>
              <Form.Control
                type="text"
                placeholder="Enter Chip ID"
                value={chipId}
                onChange={(e) => setChipId(e.target.value)}
                required
              />

              <Form.Label className="mt-3">Name</Form.Label>
              <br />
              <Form.Text className="text-muted">
                The name is a friendly name for your microcontroller.
              </Form.Text>
              <Form.Control
                type="text"
                placeholder="Enter Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
              disabled={loading}
              className="mt-3"
            >
              {loading ? (
                <>
                  <Spinner
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />{' '}
                  Linking...
                </>
              ) : (
                'Add Microcontroller'
              )}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AddMicrocontroller;
