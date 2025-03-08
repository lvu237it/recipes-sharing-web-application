import { useState, useMemo, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { Button, Image, Form, InputGroup, Col, Row } from 'react-bootstrap';
import { useCommon } from '../contexts/CommonContext';
import { Link } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import { Modal } from 'react-bootstrap';
import { BiPencil, BiImageAdd } from 'react-icons/bi';
import axios from 'axios';
import { HiMiniBellAlert } from 'react-icons/hi2';

function RecipesList() {
  const {
    recipes,
    setRecipes,
    selectedCategory,
    setSelectedCategory,
    filteredRecipes,
    setFilteredRecipes,
    listOfCategories,
    sortOrder,
    setSortOrder,
    Toaster,
    toast,
    handleSaveRecipe,
    handleUnsaveRecipe,
    handleSaveToggle,
    savedRecipeIds,
    setSavedRecipeIds,
    currentPage,
    setCurrentPage,
    generatePageNumbers,
    totalPages,
  } = useCommon();

  // Modal for creating new recipe
  const [showCreateRecipeModal, setShowCreateRecipeModal] = useState(false);
  useState(false);

  // Details for creating new recipe
  const [inputFoodCategory, setInputFoodCategory] = useState('');
  const [foodCategoriesListForNewRecipe, setFoodCategoriesListForNewRecipe] =
    useState([]);
  const [inputRecipeName, setInputRecipeName] = useState('');
  const [inputRecipeDescription, setInputRecipeDescription] = useState('');
  const [imageRecipe, setImageRecipe] = useState(null);
  const [previewImageRecipeUrl, setPreviewImageRecipeUrl] = useState(null);
  const [inputIngredient, setInputIngredient] = useState('');
  const [ingredientsListForNewRecipe, setIngredientsListForNewRecipe] =
    useState([]);
  const [inputStep, setInputStep] = useState('');
  const [stepsListForNewRecipe, setStepsListForNewRecipe] = useState([]);
  const [inputSource, setInputSource] = useState('');
  const [sourcesListForNewRecipe, setSourcesListForNewRecipe] = useState([]);

  // Searching recipe by recipe name or ingredients
  const [searchRecipeInput, setSearchRecipeInput] = useState('');
  // Thêm hook debounce
  const [debouncedSearchTerm] = useDebounce(searchRecipeInput, 300);

  const filterRecipesResultFinal = useMemo(() => {
    let updatedRecipes = [...recipes];

    // 1. Category filter
    if (selectedCategory !== 'all') {
      updatedRecipes = updatedRecipes.filter((recipe) =>
        recipe.foodCategories.includes(selectedCategory)
      );
    }

    // 2. Sorting
    const sorted = [...updatedRecipes];
    if (sortOrder === 'latest') {
      sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } else if (sortOrder === 'oldest') {
      sorted.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    }
    updatedRecipes = sorted;

    // 3. Search
    if (debouncedSearchTerm.trim()) {
      const searchTerm = debouncedSearchTerm.toLowerCase().trim();
      updatedRecipes = updatedRecipes.filter((recipe) => {
        const titleMatch = recipe.title.toLowerCase().includes(searchTerm);
        const ingredientMatch = recipe.ingredients.some((ingredient) =>
          ingredient.toLowerCase().includes(searchTerm)
        );
        return titleMatch || ingredientMatch;
      });
    }

    return updatedRecipes;
  }, [selectedCategory, sortOrder, debouncedSearchTerm, recipes]);

  useEffect(() => {
    setFilteredRecipes(filterRecipesResultFinal);
  }, [filterRecipesResultFinal, setFilteredRecipes]);

  const handleCancelCreateRecipe = () => {
    setShowCreateRecipeModal(false);
    setPreviewImageRecipeUrl(null);
    setInputFoodCategory('');
    setInputRecipeName('');
    setInputRecipeDescription('');
    setFoodCategoriesListForNewRecipe([]);
    setInputIngredient('');
    setIngredientsListForNewRecipe([]);
    setInputStep('');
    setStepsListForNewRecipe([]);
    setInputSource('');
    setSourcesListForNewRecipe([]);
  };
  useEffect(() => {
    if (!showCreateRecipeModal) {
      setPreviewImageRecipeUrl(null);
      setInputFoodCategory('');
      setFoodCategoriesListForNewRecipe([]);
      setInputIngredient('');
      setIngredientsListForNewRecipe([]);
      setInputStep('');
      setStepsListForNewRecipe([]);
      setInputSource('');
      setSourcesListForNewRecipe([]);
    }
  }, [showCreateRecipeModal]);

  const handlePostRecipe = async () => {
    if (
      foodCategoriesListForNewRecipe.length === 0 ||
      inputRecipeName.trim() === '' ||
      inputRecipeDescription.trim() === '' ||
      ingredientsListForNewRecipe.length === 0 ||
      stepsListForNewRecipe.length === 0 ||
      imageRecipe === null
    ) {
      toast.warning(
        <>
          <div className=''>Hãy bổ sung đầy đủ các thông tin cần thiết!</div>
        </>
      );
      return;
    }

    const formData = new FormData();
    formData.append(
      'foodCategories',
      JSON.stringify(foodCategoriesListForNewRecipe)
    );
    formData.append('title', inputRecipeName);
    formData.append('description', inputRecipeDescription);
    formData.append('ingredients', JSON.stringify(ingredientsListForNewRecipe));
    formData.append('steps', JSON.stringify(stepsListForNewRecipe));
    formData.append('owner', '679340974e7de09465f4c743');
    formData.append('sources', JSON.stringify(sourcesListForNewRecipe));

    try {
      setShowCreateRecipeModal(false);

      const promise = () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ name: 'my-toast-creating-recipe' }), 2000)
        );

      // Upload ảnh trực tiếp lên Cloudinary
      const uploadResponse = await uploadImageToCloudinary(imageRecipe);
      // toast.promise(promise, {
      //   loading: 'Đang tải ảnh lên, vui lòng chờ...',
      //   success: () => {
      //     if (uploadResponse) {
      //       console.log('Upload image to cloudinary successfully!');
      //       return `Tải ảnh thành công!`;
      //     }
      //   },
      //   error: 'Đã có lỗi xảy ra trong quá trình tải ảnh lên.',
      // });

      formData.append('imageUrl', uploadResponse); // Đính kèm URL ảnh đã upload

      // Tiến hành gửi yêu cầu POST đến backend với ảnh đã upload
      const response = await axios.post(
        'http://localhost:3000/recipes/create-new-recipe',
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      toast.promise(promise, {
        loading: 'Vui lòng chờ quá trình tải lên hoàn tất...',
        success: () => {
          if (response.status === 200) {
            setRecipes((preRecipes) => [response.data.data, ...preRecipes]);
            console.log('Create recipe post successfully!');
          } else {
            console.log('Create recipe post failed!');
          }

          return `Tạo công thức mới thành công!`;
        },
        error: 'Đã có lỗi xảy ra trong quá trình tải lên.',
      });
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageRecipe(file);

    if (file) {
      // Tạo URL blob cho ảnh để xem trước
      const previewBlobImage = URL.createObjectURL(file);
      setPreviewImageRecipeUrl(previewBlobImage); // Cập nhật URL blob
    }
  };

  const handleClickAddImageIcon = () => {
    const fileInput = document.getElementById('bi-attachment-add');
    fileInput.click();
  };

  // Hàm upload ảnh lên Cloudinary
  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append(
      'upload_preset',
      'sdn302-recipes-sharing-web-single-image-for-recipe'
    );

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUDINARY_NAME
        }/image/upload`,
        formData
      );
      return response.data.secure_url; // Trả về URL ảnh đã upload
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw new Error('Upload to Cloudinary failed');
    }
  };

  return (
    <>
      <Toaster richColors />
      <div className='' style={{ position: 'relative' }}>
        <div
          className='wrapper-recipes'
          style={{ width: '90%', minHeight: '100vh', margin: 'auto' }}
        >
          <Row className='wrapper-header-recipes-list mb-3'>
            <Col
              lg={3}
              md={3}
              id='title-header-recipe-list'
              className='text-center mb-4'
              style={{ fontSize: 26 }}
            >
              Các công thức nấu ăn từ cộng đồng
            </Col>

            <Col
              lg={4}
              md={3}
              className='search-input-recipe-name d-flex justify-content-center align-items-center mb-3 mb-md-0'
            >
              <Form.Control
                type='text'
                id='search-input-recipe-name-id'
                placeholder='Nhập tên món hoặc nguyên liệu'
                className='w-75 w-md-100'
                value={searchRecipeInput}
                onChange={(e) => setSearchRecipeInput(e.target.value)}
              />
            </Col>

            <Col
              lg={5}
              md={6}
              className='d-flex flex-column flex-lg-row gap-2 justify-content-lg-end justify-content-center align-items-center'
            >
              <Dropdown>
                <Dropdown.Toggle variant='success'>
                  Lọc theo:{' '}
                  {selectedCategory === 'all'
                    ? 'Tất cả các món'
                    : selectedCategory}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setSelectedCategory('all')}>
                    Tất cả các món
                  </Dropdown.Item>
                  {listOfCategories.map((category, index) => (
                    <Dropdown.Item
                      key={index}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>

              <Dropdown>
                <Dropdown.Toggle variant='success'>
                  Sắp xếp theo:{' '}
                  {sortOrder === 'latest' ? 'Mới nhất' : 'Cũ nhất'}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setSortOrder('latest')}>
                    Mới nhất
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => setSortOrder('oldest')}>
                    Cũ nhất
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Col>
          </Row>

          <BiPencil
            title='Chia sẻ công thức'
            onClick={() => setShowCreateRecipeModal(true)}
            className='icon-add-recipe-bi-plus-pencil'
          />

          {/* Modal for creating new recipe */}
          <Modal show={showCreateRecipeModal} onHide={handleCancelCreateRecipe}>
            <Modal.Header closeButton>
              <Modal.Title>Chia sẻ công thức nấu ăn</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className='' style={{ width: '100%' }}>
                {/* Details information for recipe */}
                <Form>
                  {/* food categories */}
                  <Form.Group>
                    <Form.Label style={{ fontWeight: 'bolder' }}>
                      Loại món ăn (<span style={{ color: 'red' }}>*</span>)
                    </Form.Label>
                  </Form.Group>

                  <Form.Select
                    className='mb-3'
                    value={
                      foodCategoriesListForNewRecipe.length === 0
                        ? 'Chọn loại món ăn'
                        : inputFoodCategory
                    }
                    onChange={(e) => {
                      const selectedCategory = e.target.value;

                      // Kiểm tra xem có phải giá trị mặc định không
                      if (selectedCategory !== '') {
                        setInputFoodCategory(selectedCategory);

                        // Kiểm tra xem category có nằm trong danh sách chưa
                        if (
                          !foodCategoriesListForNewRecipe.includes(
                            selectedCategory
                          )
                        ) {
                          setFoodCategoriesListForNewRecipe(
                            (prevCategories) => {
                              return [...prevCategories, selectedCategory]; // Thêm category vào danh sách
                            }
                          );
                        }
                      }
                    }}
                  >
                    {foodCategoriesListForNewRecipe.length === 0 && (
                      <option value=''>Chọn loại món ăn</option>
                    )}
                    {listOfCategories.map((category, index) => (
                      <option key={index} value={category}>
                        {category}
                      </option>
                    ))}
                  </Form.Select>

                  <Form.Group className=''>
                    {/* List of food categories */}
                    {foodCategoriesListForNewRecipe.length > 0 &&
                      foodCategoriesListForNewRecipe.map(
                        (foodCategory, index) => (
                          <InputGroup
                            key={index}
                            style={{ margin: '10px 0' }}
                            className=''
                          >
                            <Form.Control
                              className=''
                              style={{ width: '75%' }}
                              value={foodCategory}
                              disabled
                            />

                            <Button
                              variant='danger'
                              onClick={() => {
                                setFoodCategoriesListForNewRecipe(
                                  (prevCategories) =>
                                    prevCategories.filter(
                                      (c) => c !== foodCategory
                                    )
                                );
                              }}
                            >
                              Xoá
                            </Button>
                          </InputGroup>
                        )
                      )}
                  </Form.Group>

                  {/* title - food's name */}
                  <Form.Group className='mb-3'>
                    <Form.Label style={{ fontWeight: 'bolder' }}>
                      Tên món ăn (<span style={{ color: 'red' }}>*</span>)
                    </Form.Label>
                    <Form.Control
                      type='text'
                      value={inputRecipeName}
                      onChange={(e) => setInputRecipeName(e.target.value)}
                    />
                  </Form.Group>

                  {/* food description */}
                  <Form.Group className='mb-3'>
                    <Form.Label style={{ fontWeight: 'bolder' }}>
                      Mô tả (<span style={{ color: 'red' }}>*</span>)
                    </Form.Label>
                    <Form.Control
                      as='textarea'
                      rows={3}
                      value={inputRecipeDescription}
                      onChange={(e) =>
                        setInputRecipeDescription(e.target.value)
                      }
                    />
                  </Form.Group>
                  {/* ingredients */}
                  <Form.Group className=''>
                    <Form.Label style={{ fontWeight: 'bolder' }}>
                      Nguyên liệu (<span style={{ color: 'red' }}>*</span>)
                    </Form.Label>
                    <InputGroup style={{}} className='mb-3'>
                      <Form.Control
                        value={inputIngredient}
                        onChange={(e) => setInputIngredient(e.target.value)}
                        placeholder='Các nguyên liệu cần có...'
                      />
                      <Button
                        variant='success'
                        onClick={() => {
                          if (
                            inputIngredient &&
                            !ingredientsListForNewRecipe.includes(
                              inputIngredient
                            )
                          ) {
                            setIngredientsListForNewRecipe([
                              ...ingredientsListForNewRecipe,
                              inputIngredient,
                            ]);
                          }

                          setInputIngredient('');
                        }}
                      >
                        Thêm
                      </Button>
                    </InputGroup>

                    {/* List of ingredients */}
                    {ingredientsListForNewRecipe.length > 0 &&
                      ingredientsListForNewRecipe.map((ingredient, index) => (
                        <InputGroup
                          key={index}
                          style={{ margin: '10px 0' }}
                          className=''
                        >
                          <Form.Control
                            className=''
                            style={{ width: '75%' }}
                            value={ingredient}
                            disabled
                          />
                          <Button
                            variant='danger'
                            onClick={() => {
                              setIngredientsListForNewRecipe((preIngredients) =>
                                preIngredients.filter(
                                  (ingredientCurrent) =>
                                    ingredientCurrent !== ingredient
                                )
                              );
                            }}
                          >
                            Xoá
                          </Button>
                        </InputGroup>
                      ))}
                  </Form.Group>

                  {/* steps for recipe */}
                  <Form.Group className=''>
                    <Form.Label style={{ fontWeight: 'bolder' }}>
                      Các bước thực hiện (
                      <span style={{ color: 'red' }}>*</span>)
                    </Form.Label>
                    <InputGroup style={{}} className='mb-3'>
                      <Form.Control
                        value={inputStep}
                        onChange={(e) => setInputStep(e.target.value)}
                        placeholder='Mô tả chi tiết cách thực hiện...'
                      />
                      <Button
                        variant='success'
                        onClick={() => {
                          if (
                            inputStep.trim() &&
                            !stepsListForNewRecipe.some(
                              (step) => step.description === inputStep.trim()
                            )
                          ) {
                            setStepsListForNewRecipe([
                              ...stepsListForNewRecipe,
                              {
                                stepNumber: stepsListForNewRecipe.length + 1,
                                description: inputStep,
                              },
                            ]);
                          }

                          setInputStep('');
                        }}
                      >
                        Thêm
                      </Button>
                    </InputGroup>

                    {/* List of steps */}
                    {stepsListForNewRecipe.length > 0 &&
                      stepsListForNewRecipe.map((step, index) => (
                        <InputGroup key={index} style={{ margin: '10px 0' }}>
                          <Button variant='secondary'>{step.stepNumber}</Button>

                          <Form.Control
                            style={{ width: '75%' }}
                            value={step.description}
                            disabled
                          />
                          <Button
                            variant='danger'
                            onClick={() => {
                              setStepsListForNewRecipe(
                                (prevSteps) =>
                                  prevSteps
                                    .filter(
                                      (prestep) =>
                                        prestep.stepNumber !== step.stepNumber
                                    ) // Xóa bước
                                    .map((prestep, index) => ({
                                      ...prestep,
                                      stepNumber: index + 1,
                                    })) // Cập nhật lại stepNumber
                              );
                            }}
                          >
                            Xoá
                          </Button>
                        </InputGroup>
                      ))}
                  </Form.Group>

                  {/* references - documents */}
                  <Form.Group className=''>
                    <Form.Label style={{ fontWeight: 'bolder' }}>
                      Tài liệu tham khảo (không bắt buộc)
                    </Form.Label>

                    <InputGroup style={{}} className='mb-3'>
                      <Form.Control
                        value={inputSource}
                        onChange={(e) => setInputSource(e.target.value)}
                        type='text'
                        placeholder='Bất kì tài liệu chi tiết, hoặc liên kết...v.v'
                      />

                      <Button
                        variant='success'
                        onClick={() => {
                          if (
                            inputSource &&
                            !sourcesListForNewRecipe.includes(inputSource)
                          ) {
                            setSourcesListForNewRecipe([
                              ...sourcesListForNewRecipe,
                              inputSource,
                            ]);
                          }

                          setInputSource('');
                        }}
                      >
                        Thêm
                      </Button>
                    </InputGroup>

                    {/* List of sources */}
                    {sourcesListForNewRecipe.length > 0 &&
                      sourcesListForNewRecipe.map((source, index) => (
                        <InputGroup
                          key={index}
                          style={{ margin: '10px 0' }}
                          className=''
                        >
                          <Form.Control
                            className=''
                            style={{ width: '75%' }}
                            value={source}
                            disabled
                          />
                          <Button
                            variant='danger'
                            onClick={() => {
                              setSourcesListForNewRecipe((preSources) =>
                                preSources.filter(
                                  (sourceCurrent) => sourceCurrent !== source
                                )
                              );
                            }}
                          >
                            Xoá
                          </Button>
                        </InputGroup>
                      ))}
                  </Form.Group>

                  <Form.Group className=''>
                    <Form.Label style={{ fontWeight: 'bolder' }}>
                      Ảnh món ăn (<span style={{ color: 'red' }}>*</span>)
                    </Form.Label>
                  </Form.Group>
                </Form>
                {/* Image for recipe */}
                <img
                  style={{
                    width: '100%',
                    borderRadius: '5px',
                    display: `${previewImageRecipeUrl ? 'block' : 'none'}`,
                  }}
                  src={previewImageRecipeUrl}
                  className=''
                  alt={'preview-image-recipe'}
                />
              </div>
              <div>
                <BiImageAdd
                  title='Chọn ảnh'
                  style={{
                    fontSize: 26,
                    marginTop: '10px',
                    cursor: 'pointer',
                  }}
                  onClick={handleClickAddImageIcon}
                />
              </div>
              <input
                id='bi-attachment-add'
                hidden
                accept='image/jpeg,image/png,video/mp4,video/quicktime'
                type='file'
                multiple
                onChange={(e) => handleFileChange(e)}
              />
            </Modal.Body>
            <Modal.Footer>
              <Button variant='secondary' onClick={handleCancelCreateRecipe}>
                Huỷ
              </Button>
              <Button variant='success' onClick={() => handlePostRecipe()}>
                Lưu
              </Button>
            </Modal.Footer>
          </Modal>

          {recipes.length === 0 ? (
            // Loading recipes
            <div className=''>Đang tải công thức...</div>
          ) : filteredRecipes.length === 0 && selectedCategory !== 'all' ? (
            // Not found recipes with selected category
            <div className=''>Không tìm thấy {selectedCategory} phù hợp</div>
          ) : filteredRecipes.length === 0 && searchRecipeInput !== '' ? (
            // Not found recipes with search input
            <div className=''>
              Không tìm thấy công thức hoặc nguyên liệu nào trùng với "
              {searchRecipeInput}"
            </div>
          ) : (
            <div
              className='recipe-list-wrapper-border border'
              style={{
                borderRadius: '10px',
                backgroundColor: '#fdf7f4',
                borderColor: 'rgba(169, 169, 169, 0.1)', // Màu xám với độ mờ 50%
              }}
            >
              {filteredRecipes.map((recipe) => {
                const isSaved = savedRecipeIds.includes(recipe._id);

                return (
                  <div className='p-4' key={recipe._id}>
                    <div
                      key={recipe._id}
                      className='wrapper-image-and-content d-md-grid d-flex flex-column gap-3'
                    >
                      <Image
                        className='an-image-in-recipe-list p-2 shadow'
                        src={recipe.imageUrl}
                        style={{
                          margin: 'auto',
                          border: '0.1px solid whitesmoke',
                          backgroundColor: 'white',
                          maxWidth: '100%',
                        }}
                      />
                      <div
                        className='wrapper-content-recipe'
                        style={{ margin: '0px 15px' }}
                      >
                        <div
                          className='recipe-title text-center text-md-start'
                          style={{
                            fontWeight: 'bolder',
                            color: '#528135',
                            textTransform: 'uppercase',
                            fontSize: 32,
                          }}
                        >
                          {recipe.title}
                        </div>
                        <div
                          className='recipe-description'
                          style={{ margin: '10px 0', fontSize: 14 }}
                          dangerouslySetInnerHTML={{
                            __html: recipe.description,
                          }}
                        ></div>
                        <div
                          className='recipe-actions d-flex gap-2 justify-content-md-end justify-content-center'
                          style={{
                            justifyContent: 'end',
                            gap: '10px',
                          }}
                        >
                          <button
                            className='button-save-unsave-recipe'
                            onClick={() => handleSaveToggle(recipe._id)}
                          >
                            {isSaved ? 'Bỏ lưu' : 'Lưu công thức'}
                          </button>

                          <Link to={`/recipe-details/${recipe.slug}`}>
                            <button className='button-show-details'>
                              Xem chi tiết
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className='d-flex justify-content-center gap-3 m-3'>
            {/* Hiển thị các nút phân trang */}
            {currentPage > 1 && (
              <button
                className='button-clicked-pagination rounded px-3 py-2'
                style={
                  {
                    // borderWidth: 0.1,
                    // borderColor: 'rgba(169, 169, 169, 0.1)', // Màu xám với độ mờ 50%
                  }
                }
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Trang trước
              </button>
            )}

            {generatePageNumbers().map((page) => (
              <button
                className='button-clicked-pagination rounded rounded px-3 py-2'
                key={page}
                onClick={() => setCurrentPage(page)}
                disabled={page === currentPage}
              >
                {page}
              </button>
            ))}

            {currentPage < totalPages && (
              <button
                className='button-clicked-pagination rounded rounded px-3 py-2'
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Trang sau
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default RecipesList;
