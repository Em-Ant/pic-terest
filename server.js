'use strict';

var express = require('express');
var routes = require('./app/routes/index.js');
var mongoose = require('mongoose');
var passport = require('passport');
var session = require('express-session');

var compression = require('compression');

var bodyParser = require('body-parser');

var favicon = require('serve-favicon');

var app = express();
require('dotenv').config({ silent: true });

require('./app/config/passport')(passport);

mongoose.connect(process.env.DB_URI);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(favicon( process.cwd() + '/client/public/favicon.ico'));
app.use('/', express.static(process.cwd() + '/client/public'));

app.use(session({
	secret: process.env.SECRET_SESSION || 'secretClementine',
	resave: false,
	saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(compression());
routes(app, passport);

var port = process.env.PORT || 8080;
app.listen(port,  function () {
	console.log('Node.js listening on port ' + port + '...');
});
