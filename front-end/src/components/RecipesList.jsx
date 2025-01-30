import { useState, useEffect } from 'react';
import { Button, Image } from 'react-bootstrap';
import { useCommon } from '../contexts/CommonContext';

function RecipesList() {
  const { recipes } = useCommon();

  return (
    <>
      <div className='wrapper-recipes' style={{ width: '90%', margin: 'auto' }}>
        <div className=''></div>
        {recipes.map((recipe) => (
          <div
            key={recipe._id}
            className='wrapper-image-and-content'
            style={{
              display: 'grid',
              gridTemplateColumns: '300px 1fr',
              margin: '20px 0',
            }}
          >
            <Image
              src={recipe.imageUrl}
              style={{ width: '300px', margin: 'auto' }}
            />
            <div
              className='wrapper-content-recipe'
              style={{ margin: '10px 15px' }}
            >
              <div
                className='recipe-title'
                style={{
                  fontWeight: 'bolder',
                  color: '#528135',
                  textTransform: 'uppercase',
                  fontSize: 30,
                }}
              >
                {recipe.title}
              </div>
              <div className='recipe-description' style={{ margin: '10px 0' }}>
                {recipe.description}
              </div>
              <div
                className='recipe-actions'
                style={{ display: 'flex', justifyContent: 'end', gap: '10px' }}
              >
                <button className='button-save-recipe'>Save recipe</button>
                <button className='button-show-details'>Show details</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default RecipesList;
