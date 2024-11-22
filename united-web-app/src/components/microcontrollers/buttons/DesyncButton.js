import React, { useState } from 'react';
import { Button, Spinner, Toast, ToastContainer } from 'react-bootstrap';
import { useUser } from '../../../context/UserContext';
import { desyncDevice } from '../../../api/devices/devices';

const DesyncButton = ({ chipId, refresh }) => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('');

  const handleDesync = async () => {
    setLoading(true);
    setShowToast(false);

    try {
      const { error } = await desyncDevice(chipId, user.user.id);
      if (error) throw error;

      setToastMessage('Device successfully desynced.');
      setToastVariant('success');
      setShowToast(true);

      if (refresh) {
        refresh();
      }

    } catch (err) {
      setToastMessage('Failed to desync the device.');
      setToastVariant('danger');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="desync-button-container">
      <Button
        className='rounded-pill'
        variant="outline-danger"
        size="sm"
        onClick={handleDesync}
        disabled={loading}
      >
        {loading ? <Spinner as="span" animation="border" size="sm" /> : 'Desync'}
      </Button>

      <ToastContainer position="top-end" className="p-3">
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          bg={toastVariant}
          delay={3000}
          autohide
        >
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default DesyncButton;
