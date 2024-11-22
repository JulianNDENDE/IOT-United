import { supabase } from '../../server/supabaseClient';

export const updateUser = async (updates) => {
  const { data, error } = await supabase.auth.updateUser(updates);
  if (error) throw new Error(error.message);
  return data;
};
