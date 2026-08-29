const { createClient } = require('@libsql/client');

async function main() {
  console.log('Testing connection to Turso...');
  
  const db = createClient({
    url: 'libsql://jeff-studio-jeffstudiio.aws-us-east-1.turso.io',
    authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODgwMjExNjUsImlkIjoiMDFhMDQzZGMtMDEwMS03Y2FlLTk5OTQtMTk4NmJjN2MwNzFmIiwia2lkIjoieDNRaVZLUzJfc2kxTklVdjhEZDNaRlJPSUJqdGpBWGNqY2FuRTJ2bVp6OCIsInJpZCI6ImUwYWNhNzlhLTE5OTktNDM1Yy04ZTQ4LWJlZGM2Nzc0MjhjNiJ9.PYXQPzjBi1kqaZeyhQPqCzcaItTsSDEsdrL2zBOgRL6RehLgimgszAJWXN-HzHKykPGTPvEwyMRcweHcV14iBA',
  });

  try {
    const result = await db.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
    console.log('✅ Connection OK! Tables found:');
    result.rows.forEach(r => console.log('  -', r.name));
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    console.error('Full error:', JSON.stringify(err, null, 2));
  }
}

main();
