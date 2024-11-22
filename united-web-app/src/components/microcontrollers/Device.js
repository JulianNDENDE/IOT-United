import React, { useState, useEffect } from 'react';
import { ListGroup, Badge } from 'react-bootstrap';
import { FaCogs, FaMicrochip, FaCalendarAlt } from 'react-icons/fa';
import { getDeviceParameter } from '../../api/devices/parameters';
import DesyncButton from './buttons/DesyncButton';

import './Device.css';

const Device = ({ device, onClick, refresh }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [deviceParams, setDeviceParams] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDeviceParams = async () => {
    try {
      const { data } = await getDeviceParameter(device.chip_id);
      setDeviceParams(data);
    } catch (err) {
      console.error('Error fetching device parameters:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeviceParams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device.chip_id]);

  return (
    <ListGroup.Item
      className={`device-card d-flex justify-content-between mb-3 align-items-center ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div onClick={onClick} style={{ flex: 1 }}>
        <h5 className="device-title">
          <FaCogs className="device-icon" /> {device.name || 'Unnamed Device'}
        </h5>
        <p className="mb-0">
          <FaMicrochip className="device-icon" /> <strong>Chip ID:</strong> {device.chip_id}
        </p>
        <p className="mb-0">
          <FaCalendarAlt className="device-icon" /> <strong>Created At:</strong> {new Date(device.created_at).toLocaleDateString()}
        </p>
      </div>
      {isLoading ? (
        <Badge bg="info">Loading...</Badge>
      ) : (
        <div className="d-flex align-items-center gap-2">
          <Badge bg="secondary">{deviceParams.category}</Badge>
          <DesyncButton chipId={device.chip_id} refresh={refresh} />
        </div>
      )}
    </ListGroup.Item>
  );
};

export default Device;
