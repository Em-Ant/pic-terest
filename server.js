require('dotenv').config({ silent: true });

const express = require('express');
const routes = require('./app/routes/index.js');
const mongoose = require('mongoose');
const session = require('express-session');

const compression = require('compression');

const bodyParser = require('body-parser');

const favicon = require('serve-favicon');

const app = express();

mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(favicon(process.cwd() + '/client/public/favicon.ico'));
app.use('/', express.static(process.cwd() + '/client/public'));

app.use(
  session({
    secret: process.env.SECRET_SESSION,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(compression());
app.use(routes);

const port = process.env.PORT || 8080;
app.listen(port, function () {
  console.log('Node.js listening on port ' + port + '...');
});
