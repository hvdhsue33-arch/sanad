// Turso Database Configuration
// Replace these values with your actual Turso database credentials

export default {
  // Turso Cloud Database URL
  url: 'libsql://ibrahemaccounting-hvdhsue33-arch.aws-eu-west-1.turso.io',
  
  // Turso Auth Token
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTY3NzUxNTMsImlkIjoiMGRhNWIyNGYtZjc5Yi00ZmZkLTlmNzEtZTZlMjkxYzAyOTJlIiwicmlkIjoiMTBhNjUxOTktMDYwMS00ZDEwLTk0OWMtNWMzM2JlN2ZlOWRiIn0.YjfLAPUKJhxjshc6S6tPfu9BB-5tKzSnnxx-W-gF8AtIc9hM0F5nCAw0IUhUHkIX-vuAeOWWYXURTJlQCp7WDg',
  
  // Local SQLite file (for development)
  localFile: './database.sqlite',
  
  // Sync settings
  sync: {
    enabled: true,
    interval: 1000 // sync every second
  }
};

// How to get your InfinityFree database credentials:
// 1. Go to https://infinityfree.net
// 2. Create an account or login
// 3. Go to "Control Panel" > "MySQL Databases"
// 4. Create a new database
// 5. Note down the database name, username, and password
// 6. Replace the values above with your actual credentials
