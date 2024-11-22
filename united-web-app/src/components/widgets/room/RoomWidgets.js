import React, { useEffect, useState } from 'react';
import { Card, Spinner, Alert } from 'react-bootstrap';
import { getSensorInfo } from '../../../api/sensor/sensor';
import RoomCard from './RoomCard';

import '../CustomCard.css';

const RoomWidgets = ({ devices }) => {
  const [roomData, setRoomData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoomData = async () => {
      setLoading(true);
      setError(null);

      try {
        const promises = devices.map((device) =>
          getSensorInfo(device.chip_id)
        );
        const data = await Promise.all(promises);

        const combinedData = data.map((room) => {
          const device = devices.find((d) => d.chip_id === room.chip_id);
          return {
            ...room,
            ...device,
          };
        });

        setRoomData(combinedData);
      } catch (err) {
        setError('Failed to fetch room data.');
      } finally {
        setLoading(false);
      }
    };

    if (devices?.length > 0) {
      fetchRoomData();
    } else {
      setRoomData([]);
      setLoading(false);
    }
  }, [devices]);

  if (loading) {
    return <Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner>;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (roomData.length === 0) {
    return <Alert variant="info">No room devices found.</Alert>;
  }

  return (
    <div>
      <h3>Room Devices</h3>
      {roomData.map((data) => (
        <Card key={data.chip_id} className="mb-4 mt-3 rounded-pill custom-card" style={{ border: 'none' }}>
          <RoomCard room={data} />
        </Card>
      ))}
    </div>
  );
};

export default RoomWidgets;
