import { useEffect, useState } from 'react';
import './App.css';
import RecipesList from './components/RecipesList';
import { Routes, Route } from 'react-router-dom';
import RecipeDetail from './components/RecipeDetail';
import AdminRecipes from './components/AdminRecipes';
import AdminRecipeDetail from './components/AdminRecipeDetails';
import Login from './components/Login';

function App() {
  return (
    <>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/recipe-list' element={<RecipesList />} />
        <Route
          path='/recipe-details/:recipeNameSlug'
          element={<RecipeDetail />}
        />
        <Route path='/admin/recipes' element={<AdminRecipes />} />
        <Route
          path='/admin/recipes/:recipeId'
          element={<AdminRecipeDetail />}
        />
      </Routes>
    </>
  );
}

export default App;
