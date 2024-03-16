const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
require('dotenv').config();


const indexRouter = require('./routes/index'); 
const swaggerDocs = require('./swagger');
const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', indexRouter); 

swaggerDocs(app, process.env.PORT);

module.exports = app;
