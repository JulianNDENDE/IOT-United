import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import Navbar from '../../components/navigation/Navbar';
import DeviceList from '../../components/microcontrollers/DeviceList';
import { getDevices } from '../../api/devices/devices';
import { useUser } from '../../context/UserContext';
import AddMicrocontroller from '../../components/microcontrollers/buttons/AddMicroController';

export default function Devices() {
  const { user } = useUser();
  const [devices, setDevices] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchDevices = async () => {
    if (!user?.user?.id) return;

    setLoading(true);

    try {
      const { data, error } = await getDevices(user.user.id);

      if (error) {
        setError(error.message || 'Something went wrong');
      } else {
        setDevices(data || []);
      }
    } catch (err) {
      setError('Failed to fetch devices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <>
      <Navbar />
      <Container className="mt-5">
        <Row className="align-items-center mb-4">
          <Col>
            <h1>Your Devices</h1>
          </Col>
          <Col xs="auto">
            <AddMicrocontroller refresh={fetchDevices} />
          </Col>
        </Row>
        <Row>
          <Col>
            {error && <Alert variant="danger">{error}</Alert>}
            {loading ? (
              <div className="d-flex justify-content-center">
                <Spinner animation="border" />
              </div>
            ) : devices && devices.length === 0 ? (
              <Alert variant="info">No devices found. Add your first device!</Alert>
            ) : (
              <DeviceList devices={devices} refresh={fetchDevices} />
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
}
