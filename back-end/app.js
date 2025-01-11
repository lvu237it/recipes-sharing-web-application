//require - import các thư viện/cấu hình cần thiết cho app
const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
//utils
const AppError = require('./utils/appError');

//import routers
const recipeRouter = require('./routes/recipeRoutes');
const userRouter = require('./routes/userRoutes');

//các middleware phục vụ cho việc develop
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

//routing handlers
// --Định tuyến sẵn cho các request từ client với các domain như /recipes, /users
app.use('/recipes', recipeRouter);
app.use('/users', userRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

module.exports = app;
