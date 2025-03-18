// /src/components/RecipeDetail.jsx
import { useEffect, useRef, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useCommon } from '../contexts/CommonContext';
import { Image, Table, Spinner } from 'react-bootstrap';
import { RiArrowGoBackLine } from 'react-icons/ri';
import { PiDotsThreeOutlineVerticalThin } from 'react-icons/pi';
import axios from 'axios';
import { DateTime } from 'luxon';
import {
  BiPencil,
  BiBookmark,
  BiBookmarkMinus,
  BiTrashAlt,
} from 'react-icons/bi';
import { FaChevronRight } from 'react-icons/fa';
import defaultAvatar from '../assets/user-avatar-default.png';

// Import CommentSection component
import CommentSection from './CommentSection';

function RecipeDetail() {
  const { recipeNameSlug } = useParams();
  const {
    recipes,
    setRecipes,
    Toaster,
    toast,
    navigate,
    handleSaveToggle,
    savedRecipeIds,
    openOptionsRecipeDetailModal,
    setOpenOptionsRecipeDetailModal,
    setSearchRecipeInput,
    listOfCategories,
    userDataLocal,
    accessToken,
  } = useCommon();

  const location = useLocation();

  const previousPage = location.state?.from || '/'; // Mặc định về trang chủ nếu không có state

  const [recipeViewDetails, setRecipeViewDetails] = useState(null);
  const [openImageRecipeDetailModal, setOpenImageRecipeDetailModal] =
    useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authorRecipeDetails, setAuthorRecipeDetails] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    foodCategories: [],
    ingredients: [],
    sources: [],
    steps: [],
  });

  const modalOptionsRecipeDetailRef = useRef(null);
  const statusModalRef = useRef(null);
  const editModalRef = useRef(null);

  // Add status options based on the model
  const statusOptions = [
    { value: 'Public', label: 'Công khai' },
    { value: 'Private', label: 'Riêng tư' },
    { value: 'Pending_Approval', label: 'Chờ duyệt' },
    { value: 'Rejected', label: 'Từ chối' },
  ];

  const loadRecipeData = async () => {
    setIsLoading(true);
    try {
      if (recipeNameSlug) {
        const foundRecipe = recipes.find(
          (recipe) => recipe.slug === recipeNameSlug
        );
        if (foundRecipe) {
          setRecipeViewDetails(foundRecipe);
          // Fetch author details
          const response = await axios.get(
            `http://localhost:3000/recipes/${foundRecipe._id}/populate`
          );
          const authorData = response.data.data[0].owner;

          // Only set loading to false when we have both recipe and author data
          if (authorData && authorData.username) {
            setAuthorRecipeDetails(authorData);
            setIsLoading(false);
          } else {
            throw new Error('Không thể tải thông tin tác giả');
          }
        } else {
          throw new Error('Không tìm thấy công thức');
        }
      }
    } catch (error) {
      console.error('Error loading recipe data:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecipeData();
  }, [recipeNameSlug, recipes]);

  useEffect(() => {
    if (openImageRecipeDetailModal) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [openImageRecipeDetailModal]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        modalOptionsRecipeDetailRef.current &&
        !modalOptionsRecipeDetailRef.current.contains(event.target) &&
        !event.target.closest('.pi-dots-three-outline-vertical-thin')
      ) {
        setOpenOptionsRecipeDetailModal(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle status change
  const handleStatusChange = async (newStatus) => {
    try {
      setShowStatusModal(false);

      const promise = () =>
        new Promise(async (resolve, reject) => {
          try {
            const response = await axios.patch(
              `http://localhost:3000/recipes/update-recipe/${recipeViewDetails._id}`,
              { status: newStatus }, // ✅ Dữ liệu cập nhật phải nằm ở tham số thứ hai
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  'Content-Type': 'application/json',
                },
              }
            );

            if (response.status === 200) {
              // Update local recipe data
              setRecipeViewDetails(response.data.data);
              setRecipes((prevRecipes) =>
                prevRecipes.map((recipe) =>
                  recipe._id === recipeViewDetails._id
                    ? response.data.data
                    : recipe
                )
              );
              resolve();
            } else {
              reject(new Error('Cập nhật không thành công'));
            }
          } catch (error) {
            reject(error);
          }
        });

      toast.promise(promise, {
        loading: 'Đang cập nhật trạng thái...',
        success: 'Cập nhật trạng thái thành công!',
        error: 'Có lỗi xảy ra khi cập nhật trạng thái!',
      });
    } catch (error) {
      console.error('Error updating recipe status:', error);
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái!');
    }
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        statusModalRef.current &&
        !statusModalRef.current.contains(event.target)
      ) {
        setShowStatusModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDeleteRecipe = async (recipeId) => {
    try {
      const response = await axios.patch(
        `http://localhost:3000/recipes/delete-recipe/${recipeId}`,
        {}, // 👈 Không có dữ liệu cần cập nhật, để trống {}
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setOpenOptionsRecipeDetailModal(false);
      if (response.status === 200) {
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
            setRecipes((prevRecipes) =>
              prevRecipes.filter((recipe) => recipe._id !== recipeId)
            );
            setTimeout(() => {
              setSearchRecipeInput('');
              navigate('/');
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

  // Initialize edit form data when opening modal
  const handleOpenEditModal = () => {
    setEditFormData({
      title: recipeViewDetails?.title || '',
      description:
        recipeViewDetails?.description
          .replace(/<div>|<\/div>/g, '\\n')
          .replace(/\\n/g, '\n') || '',
      foodCategories: recipeViewDetails?.foodCategories || [],
      ingredients: recipeViewDetails?.ingredients || [],
      sources: recipeViewDetails?.sources || [],
      steps: recipeViewDetails?.steps || [],
    });
    setShowEditModal(true);
    setOpenOptionsRecipeDetailModal(false);
  };

  // Handle edit form submission
  const handleEditSubmit = async () => {
    try {
      setShowEditModal(false);

      const promise = () =>
        new Promise(async (resolve, reject) => {
          try {
            // Only include fields that have been modified
            const updateData = {};
            if (editFormData.title !== recipeViewDetails.title) {
              updateData.title = editFormData.title;
            }
            if (
              editFormData.description !==
              recipeViewDetails.description
                .replace(/<div>|<\/div>/g, '\\n')
                .replace(/\\n/g, '\n')
            ) {
              updateData.description = editFormData.description;
            }
            if (
              JSON.stringify(editFormData.foodCategories) !==
              JSON.stringify(recipeViewDetails.foodCategories)
            ) {
              updateData.foodCategories = editFormData.foodCategories;
            }
            if (
              JSON.stringify(editFormData.ingredients) !==
              JSON.stringify(recipeViewDetails.ingredients)
            ) {
              updateData.ingredients = editFormData.ingredients;
            }
            if (
              JSON.stringify(editFormData.sources) !==
              JSON.stringify(recipeViewDetails.sources)
            ) {
              updateData.sources = editFormData.sources;
            }
            if (
              JSON.stringify(editFormData.steps) !==
              JSON.stringify(recipeViewDetails.steps)
            ) {
              updateData.steps = editFormData.steps;
            }

            const response = await axios.patch(
              `http://localhost:3000/recipes/update-recipe/${recipeViewDetails._id}`,
              updateData,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  'Content-Type': 'application/json',
                },
              }
            );

            if (response.status === 200) {
              setRecipeViewDetails(response.data.data);
              setRecipes((prevRecipes) =>
                prevRecipes.map((recipe) =>
                  recipe._id === recipeViewDetails._id
                    ? response.data.data
                    : recipe
                )
              );
              resolve();
            } else {
              reject(new Error('Cập nhật không thành công'));
            }
          } catch (error) {
            reject(error);
          }
        });

      toast.promise(promise, {
        loading: 'Đang cập nhật công thức...',
        success: 'Cập nhật công thức thành công!',
        error: 'Có lỗi xảy ra khi cập nhật công thức!',
      });
    } catch (error) {
      console.error('Error updating recipe:', error);
      toast.error('Có lỗi xảy ra khi cập nhật công thức!');
    }
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        editModalRef.current &&
        !editModalRef.current.contains(event.target)
      ) {
        setShowEditModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Add check for required data
  const isDataReady = recipeViewDetails && authorRecipeDetails?.username;

  useEffect(() => {
    console.log('recipeViewDetails', recipeViewDetails);
    console.log('userDataLocal?._id', userDataLocal?._id);
    console.log('recipeViewDetails?.owner', recipeViewDetails?.owner);
  }, [recipeViewDetails, userDataLocal]);

  return (
    <>
      <Toaster richColors />

      {isLoading || !isDataReady ? (
        <div
          className='d-flex justify-content-center align-items-center'
          style={{ minHeight: '100vh' }}
        >
          <div className='text-center'>
            <Spinner
              animation='border'
              role='status'
              variant='success'
              style={{ width: '3rem', height: '3rem' }}
            >
              <span className='visually-hidden'>Đang tải...</span>
            </Spinner>
            <div className='mt-3' style={{ color: '#528135' }}>
              Đang tải dữ liệu...
            </div>
          </div>
        </div>
      ) : (
        <>
          {openImageRecipeDetailModal && (
            <div
              className='background-black-open-image'
              onClick={(e) => {
                if (
                  e.target.classList.contains('background-black-open-image')
                ) {
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
              className='recipe-detail-header'
              style={{
                position: 'sticky',
                top: 0,
                left: 0,
                background: '#f7f0ed',
                zIndex: 1,
                borderBottom: '0.2px solid rgba(0, 0, 0, 0.1)',
              }}
            >
              <div style={{ position: 'relative' }}>
                {/* <Link to={'/'}> */}
                <button onClick={() => navigate(previousPage)}>
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
                </button>
                {/* </Link> */}
              </div>
              {userDataLocal && (
                <div style={{ position: 'absolute', right: 0 }}>
                  <PiDotsThreeOutlineVerticalThin
                    onClick={() =>
                      setOpenOptionsRecipeDetailModal(
                        !openOptionsRecipeDetailModal
                      )
                    }
                    title='Thao tác'
                    className='pi-dots-three-outline-vertical-thin m-3 '
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
                          onClick={() =>
                            handleSaveToggle(recipeViewDetails?._id)
                          }
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

                        {/* Chỉ có người sở hữu công thức của họ mới được update */}
                        {/* Nếu người đang login xem chi tiết công thức của họ thì hiển thị update */}
                        {userDataLocal?._id === recipeViewDetails?.owner && (
                          <div
                            className='p-2 options-modal-detail'
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '120px 1fr',
                            }}
                            onClick={handleOpenEditModal}
                          >
                            <div>Chỉnh sửa</div>
                            <BiPencil style={{ margin: 'auto' }} />
                          </div>
                        )}

                        {userDataLocal?._id === recipeViewDetails?.owner && (
                          <div
                            className='p-2 options-modal-detail'
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '120px 1fr',
                              color: 'red',
                            }}
                            onClick={() =>
                              handleDeleteRecipe(recipeViewDetails?._id)
                            }
                          >
                            <div>Xoá công thức</div>
                            <BiTrashAlt style={{ margin: 'auto' }} />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div
            className='view-recipe-details-wrapper m-3 p-md-4 p-3 border'
            style={{
              position: 'relative',
              minHeight: '100%',
              borderRadius: '10px',
              borderColor: 'rgba(169, 169, 169, 0.1)',
              opacity: isLoading || !isDataReady ? 0 : 1,
              transition: 'opacity 0.3s ease-in-out',
            }}
          >
            <div
              className='recipe-details-image-and-description gap-2'
              style={{
                display: 'grid',
                marginBottom: '20px',
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
                    src={authorRecipeDetails?.avatar || defaultAvatar}
                    alt='avatar-author-recipe-details'
                  />
                  <div>
                    <div
                      className='author-name'
                      style={{ fontSize: 22, fontWeight: 600 }}
                    >
                      {authorRecipeDetails?.username}
                    </div>
                    <div className='bi-pencil-and-created-at d-flex gap-2 align-items-center'>
                      <BiPencil />
                      <div className='created-at'>
                        {DateTime.fromISO(
                          recipeViewDetails?.createdAt
                        ).toFormat('HH:mm dd/MM/yyyy')}
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

            {recipeViewDetails.sources.length > 0 && (
              <div
                className=''
                style={{
                  width: '100%',
                  fontStyle: 'italic',
                  textAlign: 'end',
                  marginBottom: '10px',
                }}
              >
                <span style={{ fontWeight: 'bolder' }}>Trích: </span>
                {recipeViewDetails?.sources.map((source, index) => (
                  <span key={index}>
                    {source}
                    {index < recipeViewDetails.sources.length - 1 && ', '}
                  </span>
                ))}
              </div>
            )}

            <div
              className='recipe-ingredients-and-steps'
              style={{
                display: 'grid',
                position: 'relative',
                marginTop: 30,
              }}
            >
              <div
                className='recipe-details-ingredients'
                style={{
                  backgroundColor: '#f7f0ed',
                  padding: '10px 20px',
                }}
              >
                <Table bordered responsive>
                  <th
                    className='py-2'
                    style={{
                      color: '#528135',
                      fontSize: 24,
                    }}
                  >
                    Nguyên liệu
                  </th>
                  {recipeViewDetails?.ingredients.map((ingredient, index) => (
                    <tr key={index} style={{ fontSize: 14 }}>
                      <td style={{ padding: '8px 0' }}>{ingredient}</td>
                    </tr>
                  ))}
                </Table>
              </div>
              <div
                className='recipe-details-steps'
                style={{ margin: '0 20px' }}
              >
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
                    key={index}
                    className='step-details'
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '45px 1fr',
                      margin: '15px 0',
                    }}
                  >
                    <div
                      className='details-recipe-step-number'
                      style={{ margin: '0 auto' }}
                    >
                      <div
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
                      style={{ fontSize: 14 }}
                    >
                      {step.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Minimal modification: Append CommentSection at the end */}
            <div
              style={{
                marginTop: '40px',
                padding: '20px',
                backgroundColor: '#fdf7f4',
                borderRadius: '10px',
                border: '1px solid rgba(169, 169, 169, 0.1)',
              }}
            >
              <h3
                style={{
                  color: '#528135',
                  fontSize: '24px',
                  marginBottom: '20px',
                }}
              >
                Comments
              </h3>
              <CommentSection recipeId={recipeViewDetails?._id} />
            </div>
          </div>

          {/* Status Change Modal */}
          {showStatusModal && (
            <div className='status-modal-overlay'>
              <div ref={statusModalRef} className='status-modal'>
                <div className='status-modal-header'>Chọn trạng thái</div>
                {statusOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`status-option ${
                      recipeViewDetails?.status === option.value ? 'active' : ''
                    }`}
                    onClick={() => handleStatusChange(option.value)}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Edit Modal */}
          {showEditModal && (
            <div className='edit-modal-overlay'>
              <div ref={editModalRef} className='edit-modal'>
                <div className='edit-modal-header'>Chỉnh sửa công thức</div>

                <div className='edit-form-group'>
                  <div className='edit-form-label'>Tên món</div>
                  <input
                    type='text'
                    className='edit-form-input'
                    value={editFormData.title}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        title: e.target.value,
                      })
                    }
                    placeholder='Nhập tên món...'
                  />
                </div>

                <div className='edit-form-group'>
                  <div className='edit-form-label'>Mô tả</div>
                  <textarea
                    className='edit-form-input edit-form-textarea'
                    value={editFormData.description}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        description: e.target.value,
                      })
                    }
                    placeholder='Nhập mô tả...'
                  />
                </div>

                <div className='edit-form-group'>
                  <div className='edit-form-label'>Loại món ăn</div>
                  <select
                    className='edit-form-input'
                    value=''
                    onChange={(e) => {
                      if (
                        e.target.value &&
                        !editFormData.foodCategories.includes(e.target.value)
                      ) {
                        setEditFormData({
                          ...editFormData,
                          foodCategories: [
                            ...editFormData.foodCategories,
                            e.target.value,
                          ],
                        });
                      }
                    }}
                  >
                    <option value=''>Chọn loại món ăn...</option>
                    {listOfCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <div className='edit-form-tag-container'>
                    {editFormData.foodCategories.map((category, index) => (
                      <div key={index} className='edit-form-tag'>
                        {category}
                        <button
                          onClick={() =>
                            setEditFormData({
                              ...editFormData,
                              foodCategories:
                                editFormData.foodCategories.filter(
                                  (_, i) => i !== index
                                ),
                            })
                          }
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className='edit-form-group'>
                  <div className='edit-form-label'>Nguyên liệu</div>
                  <div
                    className='input-group'
                    style={{ display: 'flex', gap: '10px' }}
                  >
                    <input
                      type='text'
                      className='edit-form-input'
                      placeholder='Nhập nguyên liệu...'
                      id='ingredientInput'
                      style={{ flex: 1 }}
                    />
                    <button
                      onClick={() => {
                        const input =
                          document.getElementById('ingredientInput');
                        const inputValue = input.value.trim();
                        if (inputValue) {
                          setEditFormData((prev) => ({
                            ...prev,
                            ingredients: [...prev.ingredients, inputValue],
                          }));
                          input.value = '';
                        }
                      }}
                      className='edit-form-button save'
                      style={{ padding: '8px 16px', fontSize: '14px' }}
                    >
                      Thêm
                    </button>
                  </div>
                  <div className='edit-form-tag-container'>
                    {editFormData.ingredients.map((ingredient, index) => (
                      <div key={index} className='edit-form-tag'>
                        {ingredient}
                        <button
                          onClick={() =>
                            setEditFormData((prev) => ({
                              ...prev,
                              ingredients: prev.ingredients.filter(
                                (_, i) => i !== index
                              ),
                            }))
                          }
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className='edit-form-group'>
                  <div className='edit-form-label'>Nguồn tham khảo</div>
                  <div
                    className='input-group'
                    style={{ display: 'flex', gap: '10px' }}
                  >
                    <input
                      type='text'
                      className='edit-form-input'
                      placeholder='Nhập nguồn tham khảo, phân cách bằng dấu phẩy...'
                      id='sourceInput'
                      style={{ flex: 1 }}
                    />
                    <button
                      onClick={() => {
                        const input = document.getElementById('sourceInput');
                        const inputValue = input.value.trim();
                        if (inputValue) {
                          const newSources = inputValue
                            .split(',')
                            .map((item) => item.trim())
                            .filter((item) => item.length > 0);

                          if (newSources.length > 0) {
                            setEditFormData((prev) => ({
                              ...prev,
                              sources: [...prev.sources, ...newSources],
                            }));
                            input.value = '';
                          }
                        }
                      }}
                      className='edit-form-button save'
                      style={{ padding: '8px 16px', fontSize: '14px' }}
                    >
                      Thêm
                    </button>
                  </div>
                  <div className='edit-form-tag-container'>
                    {editFormData.sources.map((source, index) => (
                      <div key={index} className='edit-form-tag'>
                        {source}
                        <button
                          onClick={() =>
                            setEditFormData((prev) => ({
                              ...prev,
                              sources: prev.sources.filter(
                                (_, i) => i !== index
                              ),
                            }))
                          }
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className='edit-form-group'>
                  <div className='edit-form-label'>Các bước thực hiện</div>
                  {editFormData.steps.map((step, index) => (
                    <div
                      key={index}
                      className='step-edit-container'
                      style={{ marginBottom: '15px' }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '10px',
                          marginBottom: '8px',
                        }}
                      >
                        <span style={{ fontWeight: '500' }}>
                          Bước {index + 1}
                        </span>
                        <button
                          onClick={() => {
                            const newSteps = [...editFormData.steps];
                            newSteps.splice(index, 1);
                            setEditFormData({
                              ...editFormData,
                              steps: newSteps,
                            });
                          }}
                          className='edit-form-button cancel'
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                        >
                          Xóa
                        </button>
                      </div>
                      <textarea
                        className='edit-form-input edit-form-textarea'
                        value={step.description}
                        onChange={(e) => {
                          const newSteps = [...editFormData.steps];
                          newSteps[index] = {
                            ...step,
                            description: e.target.value,
                          };
                          setEditFormData({
                            ...editFormData,
                            steps: newSteps,
                          });
                        }}
                        placeholder='Nhập mô tả bước thực hiện...'
                        style={{ minHeight: '60px' }}
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      // Kiểm tra bước cuối cùng nếu có
                      const lastStep =
                        editFormData.steps[editFormData.steps.length - 1];
                      if (!lastStep || lastStep.description.trim()) {
                        setEditFormData({
                          ...editFormData,
                          steps: [...editFormData.steps, { description: '' }],
                        });
                      } else {
                        toast.error(
                          'Vui lòng nhập nội dung cho bước hiện tại trước khi thêm bước mới!'
                        );
                      }
                    }}
                    className='edit-form-button save'
                    style={{ marginTop: '10px', width: '100%' }}
                  >
                    + Thêm bước mới
                  </button>
                </div>

                <div className='edit-form-actions'>
                  <button
                    className='edit-form-button cancel'
                    onClick={() => setShowEditModal(false)}
                  >
                    Hủy
                  </button>
                  <button
                    className='edit-form-button save'
                    onClick={handleEditSubmit}
                  >
                    Lưu thay đổi
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}

export default RecipeDetail;
