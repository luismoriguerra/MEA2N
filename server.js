var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    passport = require('passport'),
    session = require('express-session'),
    LocalStrategy = require('passport-local').Strategy,
    connection = require('./server/core/database.js'),
    path = require('path'),
    multipart = require('connect-multiparty'),
    fs = require('fs'),
    mime = require('mime');


// Set global function to avoid using console.log
global.printLog = function (msg) {
  'use strict';
  console.log(msg);
};

// config file
require('./server/core/config.js')(app, express, bodyParser, multipart);
//Authentication module
require('./server/core/authentication.js')(app, passport, LocalStrategy, cookieParser, session, connection);

// Show the main html in the app
app.get('/', function (req, res) {
  'use strict';
  try {
    if (!req.user) return res.redirect('/signInPug');

    res.sendFile(path.join(__dirname+'/dist/_index.html'));
  } catch (err){
    res
      .status(500)
      .send({code: 500, msg: 'Internal Server Error', dev: err});
  }
});

// Verify Session
app.use(function (req, res, next) {
  'use strict';
  printLog('CALL: ' + req.url + '\tMETHOD: ' + req.method + '\tAT:' + new Date());

  if (req.user) {
    if (req.user.status == 2) {
      return res.redirect('/login.html?s=2');
    }
    next();
  } else {
    return res.redirect('/login.html?s=2');
    // res
    //   .status(401)
    //   .json({
    //     error: 401,
    //     message: 'La session ha expirado, por favor refresque la página'
    //   });
  }
});

// Rutas de api
var records = require('./server/features/records.js')(app, connection, fs),
    clientRoutes = require('./server/features/clients.js'),
    usersRoutes = require('./server/features/users.js'),
    authRoutes = require('./server/features/auth.js'),
    internalClientRoutes = require('./server/features/internalClients.js'),
    officesRoutes = require('./server/features/offices.js'),
    areasRoutes = require('./server/features/areas.js'),
    documentTypesRoutes = require('./server/features/documentTypes.js'),
    ubigeoRoutes = require('./server/features/ubigeo.js'),
    employeesRoutes = require('./server/features/employees.js'),
    entityRoutes = require('./server/features/entities.js'),
    zonesRoutes = require('./server/features/zonesService.js');

// Add routes over a prefix
app.use('/Api/Clients', clientRoutes);
app.use('/Api/Users', usersRoutes);
app.use('/Api/Auth', authRoutes);
app.use('/Api/InternalClients', internalClientRoutes);
app.use('/Api/Offices', officesRoutes);
app.use('/Api/Areas', areasRoutes);
app.use('/Api/DocumentTypes', documentTypesRoutes);
app.use('/Api/Ubigeo', ubigeoRoutes);
app.use('/Api/Employees', employeesRoutes);
app.use('/Api/Entities', entityRoutes);
app.use('/Api/Zones', zonesRoutes);


app.get('*', function(req, res){
   if (!req.user) return res.redirect('/signInPug');
    res.sendFile(path.join(__dirname+'/dist/_index.html'));
});

app.listen(1234, function () {
  'use strict';

  console.log('Public server  running at port 1234');
  console.log('http://localhost:1234');
  console.log('\tAT:' + new Date());
});
