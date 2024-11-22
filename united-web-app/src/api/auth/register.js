import { supabase } from '../../server/supabaseClient';

export const register = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw new Error(error.message);
  return data;
};
