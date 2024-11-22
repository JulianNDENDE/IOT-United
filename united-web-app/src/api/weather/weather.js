import { supabase } from '../../server/supabaseClient';

export const getWeatherInfo = async (chipId) => {
  const { data, error } = await supabase
    .from('weather_info')
    .select('*')
    .eq('chip_id', chipId)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const upsertWeatherInfo = async (chipId, continent, country, city) => {  
  const { data, error } = await supabase
    .from('weather_info')
    .upsert(
      { chip_id: chipId, continent, country, city },
      { onConflict: 'chip_id' }
    );

  if (error) {
    console.error('Supabase error:', error.message);
    throw new Error(error.message);
  }
  
  return data;
};
