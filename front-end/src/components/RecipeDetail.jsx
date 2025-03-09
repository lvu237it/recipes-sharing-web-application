import { useEffect, useRef, useState } from 'react';
import { useNavigation, useParams } from 'react-router-dom';
import { useCommon } from '../contexts/CommonContext';
import { Image, Table } from 'react-bootstrap';
import { RiArrowGoBackLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import { PiDotsThreeOutlineVerticalThin } from 'react-icons/pi';
import axios from 'axios';
import { DateTime } from 'luxon';
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
  const {
    recipes,
    setRecipes,
    Toaster,
    toast,
    navigate,
    handleSaveRecipe,
    handleUnsaveRecipe,
    handleSaveToggle,
    savedRecipeIds,
    openOptionsRecipeDetailModal,
    setOpenOptionsRecipeDetailModal,
  } = useCommon();

  const [recipeViewDetails, setRecipeViewDetails] = useState(null);
  const [openImageRecipeDetailModal, setOpenImageRecipeDetailModal] =
    useState(false);
  const [authorRecipeDetails, setAuthorRecipeDetails] = useState(null);

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

  // const now = DateTime.now().setZone('Asia/Ho_Chi_Minh'); // Thiết lập múi giờ VN
  // const formattedDate = now.toFormat('hh:mm a dd/MM/yyyy'); // 12h format
  // const formattedDate24h = now.toFormat('HH:mm dd/MM/yyyy'); // 24h format

  useEffect(() => {
    console.log(recipeViewDetails);

    const getAuthorRecipeDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/recipes/${recipeViewDetails?._id}/populate`
        );
        console.log('response.data.data[0].owner', response.data.data[0].owner);
        setAuthorRecipeDetails(response.data.data[0].owner);
      } catch (error) {
        console.error('Error getting populated recipe:', error);
      }
    };
    getAuthorRecipeDetails();
  }, [recipeViewDetails]);

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

  //Xoá công thức
  const handleDeleteRecipe = async (recipeId) => {
    try {
      const response = await axios.patch(
        `http://localhost:3000/recipes/delete-recipe/${recipeId}`
      );
      setOpenOptionsRecipeDetailModal(false);

      if (response.status === 200) {
        console.log('Delete recipe successfully!');
        const promise = () =>
          new Promise((resolve) =>
            setTimeout(
              () => resolve({ name: 'my-toast-deleting-recipe' }),
              2000
            )
          );

        toast.promise(promise, {
          loading: 'Vui lòng chờ...',
          success: () => {
            //Đặt lại recipes list
            setRecipes((prevRecipes) =>
              prevRecipes.filter((recipe) => recipe._id !== recipeId)
            );
            // Thêm setTimeout để chuyển hướng sau 2 giây
            setTimeout(() => {
              navigate('/recipe-list'); // Chuyển hướng đến trang danh sách công thức
            }, 1000);

            return `Xoá công thức thành công!`;
          },
          error: 'Đã có lỗi xảy ra. Vui lòng thử lại.',
        });
      }
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast.error('Có lỗi xảy ra khi xóa công thức! Vui lòng thử lại.');
    }
  };

  return (
    <>
      <Toaster richColors />
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
                      onClick={() => handleSaveToggle(recipeViewDetails?._id)}
                    >
                      <div>
                        {savedRecipeIds.includes(recipeViewDetails?._id)
                          ? 'Bỏ lưu'
                          : 'Lưu công thức'}
                      </div>
                      {savedRecipeIds.includes(recipeViewDetails?._id) ? (
                        <BiBookmarkMinus style={{ margin: 'auto' }} />
                      ) : (
                        <BiBookmark style={{ margin: 'auto' }} />
                      )}
                    </div>

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
                      onClick={() => handleDeleteRecipe(recipeViewDetails?._id)}
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
        className='view-recipe-details-wrapper m-3 p-md-4 p-3 border'
        style={{
          position: 'relative',
          minHeight: '100%',
          borderRadius: '10px',
          borderColor: 'rgba(169, 169, 169, 0.1)', // Màu xám với độ mờ 50%
        }}
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
              className='avatar-information mb-3'
              style={{ display: 'grid', gridTemplateColumns: '65px 1fr' }}
            >
              <Image
                className='avatar-image my-auto'
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '100%',
                  objectFit: 'cover',
                }}
                src='https://media.gettyimages.com/id/2156062809/photo/headshot-closeup-portrait-middle-eastern-israel-businesswoman-business-lady-standing-isolated.jpg?b=1&s=612x612&w=0&k=20&c=mPEqaET5s98W_40DmBTRbYY5z0F-_1YkqdC4TCHJeig='
              />
              <div className=''>
                <div
                  className='author-name'
                  style={{ fontSize: 22, fontWeight: 600 }}
                >
                  {authorRecipeDetails?.username}
                </div>
                <div className='bi-pencil-and-created-at d-flex gap-2 align-items-center'>
                  <BiPencil />
                  <div className='created-at'>
                    {DateTime.fromISO(recipeViewDetails?.createdAt).toFormat(
                      'HH:mm dd/MM/yyyy'
                    )}
                  </div>
                </div>
              </div>
            </div>
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
