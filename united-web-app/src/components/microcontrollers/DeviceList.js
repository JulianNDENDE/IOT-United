import React, { useState } from 'react';
import { ListGroup, Button } from 'react-bootstrap';
import Device from './Device';
import DeviceSettings from './DeviceSettings';

const DeviceList = ({ devices, refresh }) => {
  const [selectedDevice, setSelectedDevice] = useState(null);

  const handleDeviceClick = (device) => {
    setSelectedDevice(device);
  };

  const handleGoBack = () => {
    setSelectedDevice(null);
  };

  if (!selectedDevice) {
    if (devices.length === 0) {
      return <p>No devices found.</p>;
    }

    return (
      <ListGroup>
        {devices.map((device) => (
          <Device
            key={device.chip_id}
            device={device}
            onClick={() => handleDeviceClick(device)}
            refresh={refresh}
          />
        ))}
      </ListGroup>
    );
  }

  return (
    <div>
      <Button
        variant="link"
        onClick={handleGoBack}
        style={{
          fontSize: '1.5rem',
          color: '#007bff',
          paddingLeft: '0.5rem',
          paddingRight: '0.5rem',
          fontWeight: 'bold',
        }}
      >
        &larr; Back
      </Button>
      <DeviceSettings device={selectedDevice} />
    </div>
  );
};

export default DeviceList;
