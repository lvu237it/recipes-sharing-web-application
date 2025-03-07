import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useMediaQuery } from 'react-responsive';
import { Toaster, toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const CommonContext = createContext();

export const useCommon = () => useContext(CommonContext);

export const Common = ({ children }) => {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState('latest');
  const navigate = useNavigate();

  const listOfCategories = [
    'món chính',
    'món ăn nhẹ',
    'món xào',
    'món luộc',
    'món nướng',
    'món chiên',
    'món canh',
    'món nộm',
    'món gỏi',
    'món lẩu',
    'món nước',
    'món nhậu',
    'món hấp',
    'món trộn',
    'món chay',
    'món bánh',
    'món kho',
    'món cháo',
    'món ăn vặt',
    'món cuốn',
    'món dịp đặc biệt',
    'món giò',
    'món khai vị',
    'món salad',
    'món hầm',
    'món súp',
  ];

  // const location = useLocation();
  // const navigate = useNavigate();
  // const { from } = location.state || { from: '/' }; // Nếu không có thông tin from thì mặc định về trang chủ

  // Đổi sang biến env tương ứng (VITE_API_BASE_URL_DEVELOPMENT hoặc VITE_API_BASE_URL_PRODUCTION)
  // và build lại để chạy server frontend trên môi trường dev hoặc production
  const frontEndUrl = import.meta.env.VITE_API_BASE_URL_DEVELOPMENT;

  const [savedRecipeIds, setSavedRecipeIds] = useState([]);

  useEffect(() => {
    async function getRecipes() {
      try {
        const response = await axios.get('http://localhost:3000/recipes');
        setRecipes(response.data.data);
      } catch (error) {
        console.error('Failed to fetch recipes:', error);
        setRecipes([]);
      }
    }
    getRecipes();
  }, []);

  const saverId = '67bf0492b8e677402c59129c';

  // Fetch saved recipes khi mount và khi saverId thay đổi
  useEffect(() => {
    const fetchSavedRecipes = async () => {
      try {
        const response = await axios.get(
          'http://localhost:3000/saved-recipes',
          {
            params: { saverId },
          }
        );
        const savedIds = response.data.map((recipe) => recipe._id);
        setSavedRecipeIds(savedIds);

        // Lưu vào localStorage để duy trì khi reload
        localStorage.setItem('savedRecipes', JSON.stringify(savedIds));
      } catch (error) {
        console.error('Lỗi tải danh sách đã lưu:', error);
      }
    };

    // Kiểm tra cache trước khi fetch
    const cached = localStorage.getItem('savedRecipes');
    if (cached) {
      setSavedRecipeIds(JSON.parse(cached));
    }

    fetchSavedRecipes();
  }, [saverId]);

  // Hàm xử lý toggle trạng thái lưu
  const handleSaveToggle = async (recipeId) => {
    const isSaved = savedRecipeIds.includes(recipeId);

    try {
      // Optimistic update
      // setSavedRecipeIds((prev) =>
      //   isSaved ? prev.filter((id) => id !== recipeId) : [...prev, recipeId]
      // );
      const newSavedIds = isSaved
        ? savedRecipeIds.filter((id) => id !== recipeId)
        : [...savedRecipeIds, recipeId];
      setSavedRecipeIds(newSavedIds);
      localStorage.setItem('savedRecipes', JSON.stringify(newSavedIds));

      // Gọi API tương ứng
      const endpoint = isSaved ? 'unsave' : 'save';

      if (endpoint === 'unsave') {
        await axios.delete(
          `http://localhost:3000/saved-recipes/unsave-from-favorite-list/${recipeId}`,
          { data: { saverId } }
        );
        toast.success('Đã bỏ lưu công thức!');
      } else {
        await axios.post(
          `http://localhost:3000/saved-recipes/save-to-my-favorite-recipes/${recipeId}`,
          { saverId }
        );
        toast.success('Đã lưu công thức!');
      }
    } catch (error) {
      // Rollback state và cache
      setSavedRecipeIds((prev) => [...prev]);
      localStorage.setItem('savedRecipes', JSON.stringify([...savedRecipeIds]));
      toast.error(
        `Lỗi: ${error.response?.data?.message || 'Thao tác thất bại'}`
      );
    }
  };

  const handleSaveRecipe = async (recipeId) => {
    try {
      const response = await axios.post(
        `http://localhost:3000/saved-recipes/save-to-my-favorite-recipes/${recipeId}`,
        {
          saverId: '67bf0492b8e677402c59129c', // Đưa saverId vào đây
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (Number(response.status) === 201) {
        console.log('Save recipe successfully!');
        toast.success('Đã lưu công thức vào danh sách yêu thích của bạn!');
      }
    } catch (error) {
      console.error('Error saving recipe to your favorite list:', error);
      toast.error('Có lỗi xảy ra khi lưu công thức! Vui lòng thử lại.');
    }
  };

  //Bỏ lưu công thức khỏi danh sách yêu thích
  const handleUnsaveRecipe = async (recipeId) => {
    try {
      const response = await axios.delete(
        `http://localhost:3000/saved-recipes/unsave-from-favorite-list/${recipeId}`,
        {
          data: { saverId: '67bf0492b8e677402c59129c' },
        }
      );

      if (response.status === 200) {
        console.log('Recipe unsaved successfully!');
        toast.success('Đã bỏ lưu công thức khỏi danh sách yêu thích của bạn!');
      }
    } catch (error) {
      console.error('Error unsaving recipe:', error);
      toast.error('Có lỗi xảy ra khi bỏ lưu công thức! Vui lòng thử lại.');
    }
  };

  return (
    <CommonContext.Provider
      value={{
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
        navigate,
        handleSaveRecipe,
        handleUnsaveRecipe,
        handleSaveToggle,
        savedRecipeIds,
        setSavedRecipeIds,
      }}
    >
      {children}
    </CommonContext.Provider>
  );
};
