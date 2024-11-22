import { supabase } from '../../server/supabaseClient';

export const getLedTemperatureParams = async (chipId) => {
  const { data, error } = await supabase
    .from('led_parameters')
    .select('*')
    .eq('chip_id', chipId)
    .single();

  if (error) {
    throw new Error('Failed to fetch device settings');
  }

  return data;
};

export const updateLedTemperatureParams = async (chipId, settings) => {
  const { data, error } = await supabase
    .from('led_parameters')
    .update({
      tmp_max: settings.max,
      tmp_min: settings.min,
    })
    .eq('chip_id', chipId);

  if (error) {
    throw new Error('Failed to update device settings');
  }

  return data;
};
