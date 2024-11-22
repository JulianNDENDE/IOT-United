import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import {
  FaMapMarkerAlt,
  FaThermometerHalf,
  FaTint,
  FaGlobe,
  FaLightbulb,
  FaClock,
  FaPalette
} from 'react-icons/fa';

const WeatherCard = ({ weather }) => {
  const { ledParams } = weather;

  return (
    <Card
      className="shadow-lg"
      style={{
        borderRadius: '20px',
        backgroundColor: ledParams?.is_on ? '#e3f2fd' : '#f8f9fa',
        border: '1px solid #dee2e6',
      }}
    >
      <Card.Body>
        <Card.Title
          style={{
            fontSize: '1.4rem',
            fontWeight: '700',
            color: '#343a40',
          }}
        >
          {weather.name || 'Unknown Device'}
        </Card.Title>
        <Card.Subtitle className="mb-3 text-muted">
          ID: {weather.chip_id}
        </Card.Subtitle>

        <Row>
          <Col>
            <div className="d-flex align-items-center">
              <FaLightbulb
                size={24}
                style={{
                  marginRight: '8px',
                  color: ledParams?.is_on ? '#4caf50' : '#9e9e9e',
                }}
              />
              <Card.Text
                style={{
                  fontSize: '1rem',
                  color: '#333',
                }}
              >
                LED: {ledParams?.is_on ? 'On' : 'Off'}
              </Card.Text>
            </div>
          </Col>
          <Col>
            <div className="d-flex align-items-center">
              <FaClock size={24} style={{ marginRight: '8px', color: '#ff9800' }} />
              <Card.Text style={{ fontSize: '1rem', color: '#333' }}>
                Timer: {ledParams?.timer || 'N/A'} seconds
              </Card.Text>
            </div>
          </Col>
        </Row>

        <Row className="mt-3">
          <Col>
            <div className="d-flex align-items-center mb-2">
              <FaThermometerHalf size={24} style={{ marginRight: '8px', color: '#ff5722' }} />
              <Card.Text style={{ fontSize: '1rem', color: '#333' }}>
                Temperature: {weather.temperature ? `${weather.temperature}°C` : 'N/A'}
              </Card.Text>
            </div>
          </Col>
          <Col>
            <div className="d-flex align-items-center mb-2">
              <FaTint size={24} style={{ marginRight: '8px', color: '#2196f3' }} />
              <Card.Text style={{ fontSize: '1rem', color: '#333' }}>
                Humidity: {weather.humidity ? `${weather.humidity}%` : 'N/A'}
              </Card.Text>
            </div>
          </Col>
        </Row>

        <Row className="mt-3">
          <Col>
            <div className="d-flex align-items-center mb-2">
              <FaGlobe size={20} style={{ marginRight: '8px', color: '#4caf50' }} />
              <Card.Text style={{ fontSize: '1rem', color: '#333' }}>
                Continent: {weather.continent || 'Unknown Continent'}
              </Card.Text>
            </div>
          </Col>
          <Col>
            <div className="d-flex align-items-center mb-2">
              <FaMapMarkerAlt size={20} style={{ marginRight: '8px', color: '#2196f3' }} />
              <Card.Text style={{ fontSize: '1rem', color: '#333' }}>
                Country: {weather.country || 'Unknown Country'}
              </Card.Text>
            </div>
          </Col>
          <Col>
            <div className="d-flex align-items-center mb-2">
              <FaMapMarkerAlt size={20} style={{ marginRight: '8px', color: '#ff9800' }} />
              <Card.Text style={{ fontSize: '1rem', color: '#333' }}>
                City: {weather.city || 'Unknown City'}
              </Card.Text>
            </div>
          </Col>
        </Row>

        <Row className="mt-3">
          <Col>
            <div className="d-flex align-items-center">
              <FaPalette size={24} style={{ marginRight: '8px', color: '#673ab7' }} />
              <Card.Text style={{ fontSize: '1rem', color: '#333' }}>
                RGB Max: <span style={{ color: `rgb(${ledParams?.rgb_max})` }}>{ledParams?.rgb_max || 'N/A'}</span>
              </Card.Text>
            </div>
          </Col>
          <Col>
            <Card.Text style={{ fontSize: '1rem', color: '#333' }}>
              RGB Mid: <span style={{ color: `rgb(${ledParams?.rgb_mid})` }}>{ledParams?.rgb_mid || 'N/A'}</span>
            </Card.Text>
          </Col>
          <Col>
            <Card.Text style={{ fontSize: '1rem', color: '#333' }}>
              RGB Min: <span style={{ color: `rgb(${ledParams?.rgb_min})` }}>{ledParams?.rgb_min || 'N/A'}</span>
            </Card.Text>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default WeatherCard;
