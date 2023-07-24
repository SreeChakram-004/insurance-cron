require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var { notFound, errorHandler } = require('./middlewares/errorMiddleware');
const { connectDB } = require('./config/db');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var csvUpload = require('./routes/uploadCsv')
var userAgentApi = require('./routes/userAgentPolicy')

connectDB();

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/upload',csvUpload);
app.use('/api',userAgentApi);
// app.use('/users', usersRouter);

app.use(notFound);
app.use(errorHandler)


module.exports = app;
