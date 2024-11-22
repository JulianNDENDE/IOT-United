import React from 'react';
import LedTemperature from '../led/LedTemperature';
import LedColors from '../led/LedColors';
import DeviceCategory from '../categories/DeviceCategory';

const DeviceSettings = ({ device }) => {
  return (
    <div className='mt-4 mb-4'>
      <h4 className='mb-3'>Device Settings for {device.name}</h4>
      <hr />
      <DeviceCategory chipId={device.chip_id} />
      <hr />
      <LedTemperature chipId={device.chip_id} />
      <hr />
      <LedColors chipId={device.chip_id} />
    </div>
  );
};

export default DeviceSettings;
