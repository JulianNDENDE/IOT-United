import { supabase } from '../../server/supabaseClient';

export const getUser = async () => {
  const user = supabase.auth.getUser();
  if (!user) throw new Error('No user logged in');
  return user;
};
