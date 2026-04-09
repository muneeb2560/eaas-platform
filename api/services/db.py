import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load explicitly from the Next.js parent environment block
env_path = os.path.join(os.path.dirname(__file__), '../../.env.local')
load_dotenv(env_path)

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "")
# Prioritize the backend service role key to bypass frontend RLS rules during background processing
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", ""))

if not SUPABASE_URL or not SUPABASE_KEY:
    print("WARNING: Supabase URL or Key not found in .env.local")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
