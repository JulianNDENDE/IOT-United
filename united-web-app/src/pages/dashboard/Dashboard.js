import React, { useState } from 'react';
import { Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import Navbar from '../../components/navigation/Navbar';
import FilterButtons from '../../components/filters/FilterButtons';
import { useUser } from '../../context/UserContext';
import useGetWidgets from '../../utils/useGetWidgets';
import WeatherWidgets from '../../components/widgets/weather/WeatherWidgets';
import RoomWidgets from '../../components/widgets/room/RoomWidgets';

const Dashboard = () => {
  const { user } = useUser();
  const [categoryType, setCategoryType] = useState('all');
  const { widgets, loading, error } = useGetWidgets();

  const weatherDevices = widgets.find((w) => w.category === 'weather')?.devices || [];
  const roomDevices = widgets.find((w) => w.category === 'room')?.devices || [];

  const renderWidgets = () => {
    if (categoryType === 'weather') {
      return <WeatherWidgets devices={weatherDevices} />;
    }
    if (categoryType === 'room') {
      return <RoomWidgets devices={roomDevices} />;
    }
    return (
      <>
        <RoomWidgets devices={roomDevices} />
        <WeatherWidgets devices={weatherDevices} />
      </>
    );
  };

  return (
    <>
      <Navbar />
      <Container className="mt-5">
        <Row>
          <Col>
            <h1>Welcome, {user?.user?.email || 'Guest'}!</h1>
          </Col>
        </Row>
        <Row>
          <Col>
            <Card className="mt-3">
              <Card.Body>
                <Card.Title>Welcome to the Dashboard</Card.Title>
                <Card.Text>
                  This is your dashboard. You can see your device's widget here.
                </Card.Text>
              </Card.Body>
            </Card>

            {loading && (
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            )}
            {error && <Alert variant="danger">{error}</Alert>}
            {!loading && !error && (
              <>
                <Row className="mt-3">
                  <Col>
                    <FilterButtons
                      filters={['all', 'room', 'weather']}
                      selectedFilter={categoryType}
                      onFilterChange={setCategoryType}
                    />
                  </Col>
                </Row>
                <Row className="mt-3">
                  <Col>{renderWidgets()}</Col>
                </Row>
              </>
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Dashboard;
