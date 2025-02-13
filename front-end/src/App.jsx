import { useEffect, useState } from 'react';
import './App.css';
import RecipesList from './components/RecipesList';
import { Routes, Route } from 'react-router-dom';
import RecipeDetail from './components/RecipeDetail';

function App() {
  return (
    <>
      <Routes>
        <Route path='/recipe-list' element={<RecipesList />} />
        <Route
          path='/recipe-details/:recipeNameSlug'
          element={<RecipeDetail />}
        />
      </Routes>
    </>
  );
}

export default App;
