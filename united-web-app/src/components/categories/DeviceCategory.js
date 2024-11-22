import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { getDeviceParameter, updateDeviceParameter } from '../../api/devices/parameters';
import { getWeatherInfo, upsertWeatherInfo } from '../../api/weather/weather';

const DeviceCategory = ({ chipId }) => {
  const [category, setCategory] = useState('');
  const [baseCategory, setBaseCategory] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [weatherInfo, setWeatherInfo] = useState({
    continent: '',
    country: '',
    city: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchDeviceParameter = async () => {
    try {
      const { data } = await getDeviceParameter(chipId);
      setCategory(data?.category || '');
      setBaseCategory(data?.category || '');
    } catch (err) {
      alert('Failed to fetch device settings');
    }
  };

  const fetchWeatherInfo = async () => {
    setIsLoading(true);
    try {
      const data = await getWeatherInfo(chipId);
      if (data) {
        setWeatherInfo({
          continent: data.continent || '',
          country: data.country || '',
          city: data.city || '',
        });
        setIsEditMode(false);
      } else {
        setIsEditMode(true);
      }
    } catch (err) {
      console.error('Error fetching weather info:', err.message);
      setIsEditMode(true);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserLocation = () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          const locationData = await response.json();
          setWeatherInfo({
            continent: locationData.continent || '',
            country: locationData.countryName || '',
            city: locationData.city || '',
          });
        } catch (err) {
          console.error('Error fetching user location:', err);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
      }
    );
  };

  useEffect(() => {
    fetchDeviceParameter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chipId]);

  useEffect(() => {
    if (category === 'weather') {
      fetchWeatherInfo();
      fetchUserLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const handleSaveChanges = async () => {
    try {
      await updateDeviceParameter(chipId, category);
      const { continent = '', country = '', city = '' } = weatherInfo;

      setBaseCategory(category);
      if (category === 'weather') {
        await upsertWeatherInfo(chipId, continent || 'Unknown', country || 'Unknown', city || 'Unknown');
      }

      setIsEditMode(false);
      alert('Device settings updated successfully!');
    } catch (err) {
      console.error('Error:', err.message);
      alert('Error saving device settings!');
    }
  };
  

  const handleCancelChanges = () => {
    setCategory(baseCategory);
    fetchWeatherInfo();
    setIsEditMode(false);
  };

  return (
    <div>
      <h6>Device Category</h6>
      <Row>
        <Col>
          <Form.Group controlId="formCategory">
            <Form.Label>Category</Form.Label>
            <Form.Control
              as="select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={!isEditMode}
            >
              <option value="room">Room</option>
              <option value="weather">Weather</option>
            </Form.Control>
          </Form.Group>
        </Col>
      </Row>

      {category === 'weather' && (
        <div className="mt-4">
          {isLoading ? (
            <Alert variant="info">Loading weather info...</Alert>
          ) : (
            <Form>
              <Form.Group controlId="formContinent">
                <Form.Label>Continent</Form.Label>
                <Form.Control
                  type="text"
                  value={weatherInfo.continent}
                  onChange={(e) =>
                    setWeatherInfo((prev) => ({ ...prev, continent: e.target.value }))
                  }
                  disabled={!isEditMode}
                />
              </Form.Group>
              <Form.Group controlId="formCountry" className="mt-3">
                <Form.Label>Country</Form.Label>
                <Form.Control
                  type="text"
                  value={weatherInfo.country}
                  onChange={(e) =>
                    setWeatherInfo((prev) => ({ ...prev, country: e.target.value }))
                  }
                  disabled={!isEditMode}
                />
              </Form.Group>
              <Form.Group controlId="formCity" className="mt-3">
                <Form.Label>City</Form.Label>
                <Form.Control
                  type="text"
                  value={weatherInfo.city}
                  onChange={(e) =>
                    setWeatherInfo((prev) => ({ ...prev, city: e.target.value }))
                  }
                  disabled={!isEditMode}
                />
              </Form.Group>
            </Form>
          )}
        </div>
      )}

      {isEditMode ? (
        <div className="mt-3">
          <Button variant="primary" onClick={handleSaveChanges}>
            Save Changes
          </Button>{' '}
          <Button variant="secondary" onClick={handleCancelChanges}>
            Cancel
          </Button>
        </div>
      ) : (
        <div className="mt-3">
          <Button variant="primary" onClick={() => setIsEditMode(true)}>
            Edit Settings
          </Button>
        </div>
      )}
    </div>
  );
};

export default DeviceCategory;
