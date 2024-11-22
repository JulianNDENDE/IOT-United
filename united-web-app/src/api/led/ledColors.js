import { supabase } from '../../server/supabaseClient';

export const getLedColorParams = async (chipId) => {
  const { data, error } = await supabase
    .from('led_parameters')
    .select('rgb_max, rgb_mid, rgb_min, is_on, timer, chip_id')
    .eq('chip_id', chipId)
    .single();

  if (error) {
    throw new Error('Failed to fetch LED color settings');
  }

  return data;
};

export const updateLedColorParams = async (chipId, settings) => {
  const { data, error } = await supabase
    .from('led_parameters')
    .update({
      rgb_max: settings.rgb_max,
      rgb_mid: settings.rgb_mid,
      rgb_min: settings.rgb_min,
      is_on: settings.is_on,
      timer: settings.timer,
    })
    .eq('chip_id', chipId);

  if (error) {
    throw new Error('Failed to update LED color settings');
  }

  return data;
};
