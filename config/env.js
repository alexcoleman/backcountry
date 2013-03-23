function set(name, value) {
  if (!(name in process.env)) {
    process.env[name] = value;
  }
}


// ---------------------- //
// --  Server Settings -- //
// ---------------------- //

set('NODE_ENV', 'development');

// The port for the HTTP server to listen on
set('PORT', 9000);

// HTTP
set('HTTP_DOMAIN', null);

// DB
set('DB_NAME', 'DB_USER');
set('DB_USER', 'DB_PASS');