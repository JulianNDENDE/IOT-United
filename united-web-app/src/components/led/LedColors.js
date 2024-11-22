import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, ToggleButton, ButtonGroup } from 'react-bootstrap';
import { SketchPicker } from 'react-color';
import { getLedColorParams, updateLedColorParams } from '../../api/led/ledColors';

const LedColors = ({ chipId }) => {
  const [settings, setSettings] = useState({
    rgb_max: 'rgb(255, 255, 255)',
    rgb_mid: 'rgb(255, 255, 255)',
    rgb_min: 'rgb(255, 255, 255)',
    is_on: false,
    timer: 0,
  });
  const [baseSettings, setBaseSettings] = useState({ ...settings });
  const [isEditMode, setIsEditMode] = useState(false);

  // Fetch LED settings
  const fetchSettings = async () => {
    try {
      const fetchedSettings = await getLedColorParams(chipId);
      setSettings({
        rgb_max: fetchedSettings.rgb_max || 'rgb(255, 255, 255)',
        rgb_mid: fetchedSettings.rgb_mid || 'rgb(255, 255, 255)',
        rgb_min: fetchedSettings.rgb_min || 'rgb(255, 255, 255)',
        is_on: fetchedSettings.is_on || false,
        timer: fetchedSettings.timer || 0,
      });
      setBaseSettings(fetchedSettings);
    } catch (err) {
      alert('Failed to fetch LED settings');
    }
  };

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chipId]);

  const handleSaveChanges = async () => {
    try {
      const formattedSettings = {
        ...settings,
        rgb_max: settings.rgb_max.replace('rgb(', '').replace(')', ''),
        rgb_mid: settings.rgb_mid.replace('rgb(', '').replace(')', ''),
        rgb_min: settings.rgb_min.replace('rgb(', '').replace(')', ''),
      };
      await updateLedColorParams(chipId, formattedSettings);
      setBaseSettings(settings);
      setIsEditMode(false);
      alert('LED settings updated!');
    } catch (err) {
      alert('Error updating LED settings!');
    }
  };

  const handleCancelChanges = () => {
    setSettings(baseSettings);
    setIsEditMode(false);
  };

  const handleColorChange = (colorKey, color) => {
    const rgbColor = `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
    setSettings((prevSettings) => ({ ...prevSettings, [colorKey]: rgbColor }));
  };

  const handleToggleIsOn = () => {
    setSettings((prevSettings) => ({ ...prevSettings, is_on: !prevSettings.is_on }));
  };

  const handleTimerChange = (e) => {
    const timerValue = parseInt(e.target.value, 10) || 0;
    setSettings((prevSettings) => ({ ...prevSettings, timer: timerValue }));
  };

  return (
    <div>
      <h6>LED Colors Settings</h6>
      <Row className="align-items-start">
        <Col>
          <Form.Group controlId="formRgbMax">
            <Form.Label>Max RGB</Form.Label>
            <div style={{ pointerEvents: isEditMode ? 'auto' : 'none' }}>
              <SketchPicker
                color={settings.rgb_max}
                onChange={(color) => isEditMode && handleColorChange('rgb_max', color)}
                disableAlpha
              />
            </div>
          </Form.Group>
        </Col>

        <Col>
          <Form.Group controlId="formRgbMid">
            <Form.Label>Mid RGB</Form.Label>
            <div style={{ pointerEvents: isEditMode ? 'auto' : 'none' }}>
              <SketchPicker
                color={settings.rgb_mid}
                onChange={(color) => isEditMode && handleColorChange('rgb_mid', color)}
                disableAlpha
              />
            </div>
          </Form.Group>
        </Col>

        <Col>
          <Form.Group controlId="formRgbMin">
            <Form.Label>Min RGB</Form.Label>
            <div style={{ pointerEvents: isEditMode ? 'auto' : 'none' }}>
              <SketchPicker
                color={settings.rgb_min}
                onChange={(color) => isEditMode && handleColorChange('rgb_min', color)}
                disableAlpha
              />
            </div>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mt-3">
        <Col>
          <Form.Group controlId="formIsOn">
            <Form.Label>LED Status</Form.Label>
            <div>
              {isEditMode ? (
                <ButtonGroup>
                  <ToggleButton
                    type="radio"
                    variant="success"
                    checked={settings.is_on}
                    onClick={handleToggleIsOn}
                  >
                    On
                  </ToggleButton>
                  <ToggleButton
                    type="radio"
                    variant="danger"
                    checked={!settings.is_on}
                    onClick={handleToggleIsOn}
                  >
                    Off
                  </ToggleButton>
                </ButtonGroup>
              ) : (
                <p>{settings.is_on ? 'On' : 'Off'}</p>
              )}
            </div>
          </Form.Group>
        </Col>

        <Col>
          <Form.Group controlId="formTimer">
            <Form.Label>Timer (seconds)</Form.Label>
            {isEditMode ? (
              <Form.Control
                type="number"
                value={settings.timer}
                onChange={handleTimerChange}
              />
            ) : (
              <p>{settings.timer} seconds</p>
            )}
          </Form.Group>
        </Col>
      </Row>

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

export default LedColors;
