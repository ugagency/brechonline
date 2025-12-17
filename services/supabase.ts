
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ojlovdhappbqccifkngj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qbG92ZGhhcHBicWNjaWZrbmdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5ODY4NTYsImV4cCI6MjA4MTU2Mjg1Nn0.86vPZsJjShGtuH2D5iDCPpptlX6Ee5J-6yXI1ZBOOQ4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
