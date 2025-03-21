import { useEffect, useState } from 'react';
import './App.css';
import RecipesList from './components/RecipesList';
import { Routes, Route } from 'react-router-dom';
import RecipeDetail from './components/RecipeDetail';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPass';
import ResetPassword from './components/ResetPass';

function App() {
  return (
    <>
      <Routes>
        <Route path='/recipe-list' element={<RecipesList />} />
        <Route
          path='/recipe-details/:recipeNameSlug'
          element={<RecipeDetail />}
        />
         <Route path='/login' element={<Login />} />
         <Route path='/forgot' element={<ForgotPassword />} />
         <Route path='/reset/:token' element={<ResetPassword />} />

      </Routes>
    </>
  );
}

export default App;
