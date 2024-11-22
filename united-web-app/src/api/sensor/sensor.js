import { supabase } from '../../server/supabaseClient';

export const getSensorInfo = async (chipId) => {
  const { data, error } = await supabase
    .from('sensor_temps')
    .select('*')
    .eq('chip_id', chipId)
    .single();

  if (error) throw new Error(error.message);
  return data;
};
