import { useState, useEffect } from "react";
import { getDevices } from "../api/devices/devices";
import { useUser } from "../context/UserContext";
import { getDeviceParameter } from "../api/devices/parameters";
import { getLedColorParams } from "../api/led/ledColors";

const useGetWidgets = () => {
  const { user } = useUser();

  const [devices, setDevices] = useState([]);
  const [devicesParameters, setDevicesParameters] = useState([]);
  const [weatherDevices, setWeatherDevices] = useState([]);
  const [roomDevices, setRoomDevices] = useState([]);
  const [widgets, setWidgets] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDevices = async (userId) => {
    try {
      const { data: devicesData } = await getDevices(userId);
      return devicesData || [];
    } catch (err) {
      console.error("Error fetching devices:", err);
      throw new Error("Failed to fetch devices");
    }
  };

  const fetchLedParams = async (devices) => {
    try {
      const promises = devices.map((device) => getLedColorParams(device.chip_id));
      const results = await Promise.allSettled(promises);
      return devices.map((device, index) => ({
        ...device,
        ledParams:
          results[index].status === "fulfilled" ? results[index].value || {} : {},
      }));
    } catch (err) {
      console.error("Error fetching LED parameters:", err);
      throw new Error("Failed to fetch LED parameters");
    }
  };

  const fetchDeviceParameters = async (devices) => {
    try {
      const promises = devices.map((device) => getDeviceParameter(device.chip_id));
      const results = await Promise.all(promises);
      return results;
    } catch (err) {
      console.error("Error fetching device parameters:", err);
      throw new Error("Failed to fetch device parameters");
    }
  };

  const categorizeDevices = (devices, parameters) => {
    const weather = parameters.filter((param) => param.data?.category === "weather");
    const room = parameters.filter((param) => param.data?.category === "room");

    const weatherDevicesFiltered = devices.filter((device) =>
      weather.some((w) => w.data?.chip_id === device.chip_id)
    );

    const roomDevicesFiltered = devices.filter((device) =>
      room.some((r) => r.data?.chip_id === device.chip_id)
    );

    return { weatherDevicesFiltered, roomDevicesFiltered };
  };

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!user?.user?.id) throw new Error("User ID is required");

      // Fetch devices
      const devicesData = await fetchDevices(user.user.id);
      setDevices(devicesData);

      if (devicesData.length === 0) {
        setWidgets([]);
        setDevicesParameters([]);
        setWeatherDevices([]);
        setRoomDevices([]);
        return;
      }

      // Fetch LED parameters
      const devicesWithLedParams = await fetchLedParams(devicesData);

      // Fetch device parameters
      const parameters = await fetchDeviceParameters(devicesWithLedParams);
      setDevicesParameters(parameters);

      // Categorize devices
      const { weatherDevicesFiltered, roomDevicesFiltered } = categorizeDevices(
        devicesWithLedParams,
        parameters
      );
      setWeatherDevices(weatherDevicesFiltered);
      setRoomDevices(roomDevicesFiltered);

      // Create widgets
      const widgets = [
        {
          category: "weather",
          devices: weatherDevicesFiltered.map((device) => ({
            ...device,
            category: "weather",
          })),
        },
        {
          category: "room",
          devices: roomDevicesFiltered.map((device) => ({
            ...device,
            category: "room",
          })),
        },
      ];
      setWidgets(widgets);
    } catch (err) {
      console.error("Error in fetchAllData:", err);
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return {
    devices,
    devicesParameters,
    weatherDevices,
    roomDevices,
    widgets,
    loading,
    error,
  };
};

export default useGetWidgets;
