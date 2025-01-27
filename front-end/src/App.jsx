import { useEffect, useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import axios from 'axios';
import { BiImageAdd } from 'react-icons/bi';

function App() {
  const [imageRecipe, setImageRecipe] = useState(null);
  const [previewImageRecipeUrl, setPreviewImageRecipeUrl] = useState(null);

  useEffect(() => {
    console.log('imageRecipe', imageRecipe);
    console.log('imageRecipe typeof', typeof imageRecipe);
    console.log('previewImageRecipeUrl typeof', previewImageRecipeUrl);
    console.log('previewImageRecipeUrl typeof', typeof previewImageRecipeUrl);
  }, [imageRecipe, previewImageRecipeUrl]);

  const handlePostRecipe = async () => {
    const formData = new FormData();
    formData.append('foodCategories', JSON.stringify(['món nộm']));
    formData.append('title', 'test');
    formData.append('description', 'test');
    formData.append('ingredients', JSON.stringify(['test']));
    formData.append(
      'steps',
      JSON.stringify([{ stepNumber: 1, description: 'test' }])
    );
    formData.append('owner', '679340974e7de09465f4c743');
    formData.append('sources', JSON.stringify(['test']));
    if (imageRecipe) {
      try {
        // Upload ảnh trực tiếp lên Cloudinary
        const uploadResponse = await uploadImageToCloudinary(imageRecipe);
        if (uploadResponse) {
          console.log('Upload image to cloudinary successfully!');
        }
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

        if (response.status === 200) {
          console.log('Create recipe post successfully!');
        } else {
          console.log('Create recipe post failed!');
        }
      } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
      }
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
      <div>
        <a href='https://vite.dev' target='_blank'>
          <img src={viteLogo} className='logo' alt='Vite logo' />
        </a>
        <a href='https://react.dev' target='_blank'>
          <img src={reactLogo} className='logo react' alt='React logo' />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className='card'>
        <div className='w-full sm2:w-[95%]'>
          {/* Display images before uploading to database */}

          <img
            // ref={postItemsUploadRef}
            src={previewImageRecipeUrl}
            className='w-[50%] sm2:w-[25%] h-auto rounded-lg'
            alt={'Preview'}
          />
        </div>
        <div className='' onClick={handleClickAddImageIcon}>
          <BiImageAdd />
        </div>
        <input
          id='bi-attachment-add'
          hidden
          accept='image/jpeg,image/png,video/mp4,video/quicktime'
          type='file'
          multiple
          onChange={(e) => handleFileChange(e)}
        />
        <button onClick={handlePostRecipe}>count is </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>

      <p className='read-the-docs'>
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
