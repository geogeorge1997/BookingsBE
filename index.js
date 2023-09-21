
// Entry Point of the API Server

// which psql 
// psql -U postgres

const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));

const route = require('./routing')
app.use('/', route)

// Require the Routes API 
// Create a Server and run it on the port 3000
const server = app.listen(3000, function () {
    let host = server.address().address
    let port = server.address().port
    // Starting the Server at the port 3000
})