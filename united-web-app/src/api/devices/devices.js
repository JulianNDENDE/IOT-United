import { supabase } from '../../server/supabaseClient';

export const addDevice = async (chipId, userId, name) => {
  const { data, error } = await supabase
    .from('devices')
    .insert([{ chip_id: chipId, user_id: userId, name: name }])
    .single();

  if (error) {
    console.error("Error updating device:", error);
    return { data: null, error };
  }

  return { data, error: null };
};

export const getDevices = async (userId) => {
  const { data, error } = await supabase
    .from('devices')
    .select('*')
    .eq('user_id', userId);

  return { data, error };
};

export const desyncDevice = async (chipId, userId) => {
  const { data, error } = await supabase
    .from('devices')
    .delete()
    .eq('chip_id', chipId)
    .eq('user_id', userId);

  return { data, error };
};
