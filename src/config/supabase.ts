import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ciwlmdnmnsymiwmschej.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpd2xtZG5tbnN5bWl3bXNjaGVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQwNDY5NDUsImV4cCI6MjA0OTYyMjk0NX0.X8f1ZPQVqCf1dMcf0-dMVLJVGKQYHJr4FJjgEKUKx7Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);