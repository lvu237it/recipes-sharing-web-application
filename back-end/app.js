//require - import các thư viện/cấu hình cần thiết cho app
const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
//utils
const AppError = require('./utils/appError');

//import routers
const recipeRouter = require('./routes/recipeRoutes');
const userRouter = require('./routes/userRoutes');
const authenticationRouter = require('./routes/authenticationRoutes');
const adminRouter = require('./routes/adminRoutes');
const commentRouter = require('./routes/commentRoutes');
const savedRecipeRouter = require('./routes/savedRecipeRoutes');

//các middleware phục vụ cho việc develop
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

//routing handlers
// --Định tuyến sẵn cho các request từ client với các domain như /recipes, /users
app.use('/recipes', recipeRouter);
app.use('/users', userRouter);
app.use('/comments', commentRouter);
app.use('/authentication', authenticationRouter);
app.use('/admin', adminRouter);
app.use('/saved-recipes', savedRecipeRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

module.exports = app;
