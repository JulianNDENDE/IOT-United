import { supabase } from '../../server/supabaseClient';

export const getDeviceParameter = async (chipId) => {
  const { data, error } = await supabase
    .from('chip_parameter')
    .select('*')
    .eq('chip_id', chipId)
    .single();

  if (error) {
    throw new Error('Failed to fetch device settings');
  }

  return { data, error };
}

export const updateDeviceParameter = async (chipId, category) => {
  const { data, error } = await supabase
    .from('chip_parameter')
    .update({
      category: category,
    })
    .eq('chip_id', chipId);

  if (error) {
    throw new Error('Failed to update device settings');
  }

  return { data, error };
}