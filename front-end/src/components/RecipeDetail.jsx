import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCommon } from '../contexts/CommonContext';
import { Image, Table } from 'react-bootstrap';

function RecipeDetail() {
  const { recipeNameSlug } = useParams();
  const { recipes } = useCommon();
  const [recipeViewDetails, setRecipeViewDetails] = useState(null);

  useEffect(() => {
    if (recipeNameSlug) {
      const foundRecipe = recipes.find(
        (recipe) => recipe.slug === recipeNameSlug
      );
      if (foundRecipe) {
        setRecipeViewDetails(foundRecipe);
      }
    }
  }, [recipeNameSlug]);

  return (
    <>
      <div className='view-recipe-details-wrapper'>
        <div
          className='recipe-details-image-and-description gap-2'
          style={{
            display: 'grid',
            gridTemplateColumns: '400px 1fr',
            marginBottom: '30px',
          }}
        >
          <Image
            src={recipeViewDetails?.imageUrl}
            style={{
              width: '400px',
              margin: 'auto',
              padding: '10px',
              border: '0.1px solid whitesmoke',
              backgroundColor: 'white',
            }}
            className='recipe-details-image shadow'
          />
          <div
            className='recipe-details-description'
            style={{ margin: '15px 20px' }}
          >
            <div
              className='recipe-details-title'
              style={{
                fontWeight: 'bolder',
                color: '#528135',
                textTransform: 'uppercase',
                fontSize: 32,
              }}
            >
              {recipeViewDetails?.title}
            </div>
            <div
              className='recipe-details-description'
              style={{ margin: '10px 0', fontSize: 14 }}
              dangerouslySetInnerHTML={{
                __html: recipeViewDetails?.description,
              }}
            ></div>
          </div>
        </div>
        <div
          className='recipe-ingredients-and-steps'
          style={{
            display: 'grid',
            gridTemplateColumns: '280px 1fr',
          }}
        >
          <div
            className='recipe-details-ingredients'
            style={{
              backgroundColor: '#f7f0ed',
              padding: '10px 20px',
            }}
          >
            <Table bordered responsive hover>
              <th
                style={{
                  color: '#528135',
                  fontSize: 24,
                }}
              >
                Nguyên liệu
              </th>
              {recipeViewDetails?.ingredients.map((ingredient, index) => (
                <tr
                  style={{
                    fontSize: 14,
                  }}
                  key={index}
                >
                  <td style={{ padding: '8px 0' }}>{ingredient}</td>
                </tr>
              ))}
            </Table>
          </div>
          <div className='recipe-details-steps' style={{ margin: '0 20px' }}>
            <div
              className='details-recipe-how-to-cook'
              style={{
                fontWeight: 'bolder',
                color: '#528135',
                fontSize: 24,
                margin: '10px',
              }}
            >
              Cách chế biến
            </div>
            <hr />
            {recipeViewDetails?.steps.map((step, index) => (
              <div
                className='step-details'
                style={{
                  display: 'grid',
                  gridTemplateColumns: '45px 1fr',
                  margin: '15px 0',
                }}
              >
                <div
                  className='details-recipe-step-number'
                  style={{
                    margin: '0 auto',
                  }}
                >
                  <div
                    className=''
                    style={{
                      border: '0.5px solid gray',
                      borderRadius: 100,
                      padding: '5px 10px',
                      fontSize: 10,
                    }}
                  >
                    {index + 1}
                  </div>
                </div>
                <div
                  className='details-recipe-step-description'
                  style={{
                    fontSize: 14,
                  }}
                >
                  {step.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default RecipeDetail;
