import https from 'https';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const name = process.argv[2] || 'Timothy';
const apiUrl = `${supabaseUrl}/rest/v1/invites?or=(first_name.eq.${name},last_name.ilike.%25${name}%25)&order=created_at.desc&limit=5&select=id,first_name,last_name,email,status,created_at,updated_at,expires_at`;

const options = new URL(apiUrl);
options.headers = {
  'apikey': supabaseKey,
  'Authorization': `Bearer ${supabaseKey}`,
  'Content-Type': 'application/json'
};

https.get(apiUrl, {
  headers: options.headers
}, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    if (res.statusCode === 200) {
      const invites = JSON.parse(data);
      console.log(`\n📧 Invite Records for "${name}":\n`);
      if (invites.length === 0) {
        console.log(`No invites found for "${name}"`);
      } else {
        invites.forEach((inv, i) => {
          console.log(`Invite #${i + 1}:`);
          console.log(`  ID: ${inv.id}`);
          console.log(`  Name: ${inv.first_name} ${inv.last_name}`);
          console.log(`  Email: ${inv.email || '❌ NO EMAIL'}`);
          console.log(`  Status: ${inv.status}`);
          console.log(`  Created: ${new Date(inv.created_at).toLocaleString()}`);
          console.log(`  Updated: ${new Date(inv.updated_at).toLocaleString()}`);
          console.log(`  Expires: ${inv.expires_at ? new Date(inv.expires_at).toLocaleString() : 'Not set'}`);
          console.log('');
        });
      }
    } else {
      console.log('❌ Error:', res.statusCode, data);
    }
  });
}).on('error', (e) => console.error('❌ Request error:', e.message));
