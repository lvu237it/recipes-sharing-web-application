import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCommon } from '../contexts/CommonContext';
import { Image, Table } from 'react-bootstrap';
import { RiArrowGoBackLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import { PiDotsThreeOutlineVerticalThin } from 'react-icons/pi';

import {
  BiArrowBack,
  BiBookmark,
  BiBookmarkMinus,
  BiChat,
  BiDotsHorizontalRounded,
  BiEdit,
  BiPencil,
  BiTrashAlt,
} from 'react-icons/bi';
import { FaChevronRight } from 'react-icons/fa';
import { AiOutlineComment } from 'react-icons/ai';

function RecipeDetail() {
  const { recipeNameSlug } = useParams();
  const { recipes } = useCommon();
  const [recipeViewDetails, setRecipeViewDetails] = useState(null);
  const [openImageRecipeDetailModal, setOpenImageRecipeDetailModal] =
    useState(false);
  const [openOptionsRecipeDetailModal, setOpenOptionsRecipeDetailModal] =
    useState(false);

  const modalOptionsRecipeDetailRef = useRef(null);

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

  // Thêm/xóa class `no-scroll` trên body khi modal mở/đóng
  useEffect(() => {
    if (openImageRecipeDetailModal) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }

    // Cleanup: Đảm bảo class `no-scroll` được xóa khi component unmount
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [openImageRecipeDetailModal]);

  // Hàm đóng options modal khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Kiểm tra nếu click bên ngoài modal và không phải là nút mở modal
      if (
        modalOptionsRecipeDetailRef.current &&
        !modalOptionsRecipeDetailRef.current.contains(event.target) &&
        !event.target.closest('.pi-dots-three-outline-vertical-thin') // Kiểm tra nếu click không phải là nút mở modal
      ) {
        setOpenOptionsRecipeDetailModal(false);
      }
    };

    // Thêm sự kiện lắng nghe click toàn bộ document
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup: Xóa sự kiện khi component unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      {openImageRecipeDetailModal && (
        <div
          className='background-black-open-image'
          onClick={(e) => {
            if (e.target.classList.contains('background-black-open-image')) {
              setOpenImageRecipeDetailModal(false);
            }
          }}
        >
          <Image
            className='image-recipe-detail-open'
            src={recipeViewDetails?.imageUrl}
            style={{
              width: '700px',
              boxShadow: '0px 4px 15px rgba(255, 255, 255, 0.15)',
            }}
          />
        </div>
      )}
      {!openImageRecipeDetailModal && (
        <div
          className=''
          style={{
            position: 'sticky',
            top: 0,
            left: 0,
            background: '#f7f0ed',
            zIndex: 1,
            borderBottom: '0.2px solid rgba(0, 0, 0, 0.1)', // Màu nhẹ với độ trong suốt
          }}
        >
          <div className='d-flex justify-content-between'>
            <Link to={'/recipe-list'}>
              <RiArrowGoBackLine
                title='Quay lại'
                className='ri-arrow-go-back-line-recipe-detail m-3'
                style={{
                  fontSize: 32,
                  padding: 5,
                  borderRadius: '99%',
                  color: 'black',
                }}
              />
            </Link>

            <div className='' style={{ position: 'relative' }}>
              <PiDotsThreeOutlineVerticalThin
                onClick={() =>
                  setOpenOptionsRecipeDetailModal(!openOptionsRecipeDetailModal)
                }
                title='Thao tác'
                className='pi-dots-three-outline-vertical-thin m-3'
                style={{
                  fontSize: 32,
                  padding: 5,
                  borderRadius: '99%',
                  color: 'black',
                }}
              />
              {openOptionsRecipeDetailModal && (
                <div
                  ref={modalOptionsRecipeDetailRef}
                  className='options-modal border shadow-sm'
                  style={{
                    position: 'absolute',
                    width: '190px',
                    top: 50,
                    right: 20,
                    backgroundColor: 'white',
                    borderRadius: '10px',
                  }}
                >
                  <div className='p-3'>
                    <div
                      className='p-2 options-modal-detail'
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '120px 1fr',
                      }}
                    >
                      <div className=''>Lưu công thức</div>
                      <BiBookmark style={{ margin: 'auto' }} />
                    </div>

                    {/* <div
                    className='p-2 options-modal-detail'
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '120px 1fr',
                    }}
                  >
                    <div className=''>Bỏ lưu</div>
                    <BiBookmarkMinus style={{ margin: 'auto' }} />
                  </div> */}

                    <div
                      className='p-2 options-modal-detail'
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '120px 1fr',
                      }}
                    >
                      <div className=''>Đổi trạng thái</div>
                      <FaChevronRight style={{ margin: 'auto' }} />
                    </div>

                    <div
                      className='p-2 options-modal-detail'
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '120px 1fr',
                      }}
                    >
                      <div className=''>Chỉnh sửa</div>
                      <BiEdit style={{ margin: 'auto' }} />
                    </div>

                    <div
                      className='p-2 options-modal-detail'
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '120px 1fr',
                        color: 'red',
                      }}
                    >
                      <div className=''>Xoá công thức</div>
                      <BiTrashAlt style={{ margin: 'auto' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div
        className='view-recipe-details-wrapper m-3'
        style={{ position: 'relative' }}
      >
        <div
          className='recipe-details-image-and-description gap-2'
          style={{
            display: 'grid',
            marginBottom: '30px',
          }}
        >
          <Image
            src={recipeViewDetails?.imageUrl}
            style={{
              width: '400px',
              maxWidth: '100%',
              margin: 'auto',
              borderRadius: '5px',
            }}
            className='recipe-details-image-on-top shadow p-2'
            onClick={() => setOpenImageRecipeDetailModal(true)}
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
