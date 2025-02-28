import { createClient } from '@supabase/supabase-js'
import supabaseConfig from '../config/supabase.json'

const { SUPABASE_URL, SUPABASE_KEY} = supabaseConfig;

//Creating the Supabase Client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export default supabase;
