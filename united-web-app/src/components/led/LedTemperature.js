import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import { getLedTemperatureParams, updateLedTemperatureParams } from '../../api/led/ledTemperature';

const LedTemperature = ({ chipId }) => {
  const [temperature, setTemperature] = useState({
    max: '',
    min: '',
  });
  const [baseTemperature, setBaseTemperature] = useState({
    max: '',
    min: '',
  });
  const [isEditMode, setIsEditMode] = useState(false);

  const fetchTemperatureSettings = async () => {
    try {
      const settings = await getLedTemperatureParams(chipId);
      const fetchedTemperature = {
        max: settings.tmp_max,
        min: settings.tmp_min,
      };
      setTemperature(fetchedTemperature);
      setBaseTemperature(fetchedTemperature);
    } catch (err) {
      alert('Failed to fetch temperature settings');
    }
  };

  useEffect(() => {
    fetchTemperatureSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chipId]);

  const handleSaveChanges = async () => {
    try {
      await updateLedTemperatureParams(chipId, temperature);
      setBaseTemperature(temperature);
      setIsEditMode(false);
      alert('Temperature settings updated!');
    } catch (err) {
      alert('Error updating temperature settings!');
    }
  };

  const handleCancelChanges = () => {
    setTemperature(baseTemperature);
    setIsEditMode(false);
  };

  return (
    <div>
      <h6>Temperature Settings</h6>

      <Form.Group controlId="formMaxTemp">
        <Form.Label>Max Temperature (°C)</Form.Label>
        <Form.Control
          type="number"
          value={temperature.max}
          onChange={(e) => setTemperature({ ...temperature, max: e.target.value })}
          disabled={!isEditMode}
        />
      </Form.Group>

      <Form.Group controlId="formMinTemp">
        <Form.Label>Min Temperature (°C)</Form.Label>
        <Form.Control
          type="number"
          value={temperature.min}
          onChange={(e) => setTemperature({ ...temperature, min: e.target.value })}
          disabled={!isEditMode}
        />
      </Form.Group>

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

export default LedTemperature;
