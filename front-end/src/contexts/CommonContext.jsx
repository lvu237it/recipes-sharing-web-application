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

  const [openOptionsRecipeDetailModal, setOpenOptionsRecipeDetailModal] =
    useState(false);

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
  const [nextCursor, setNextCursor] = useState(null); // State để lưu trữ cursor tiếp theo
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const [totalPages, setTotalPages] = useState(0); // Tổng số trang

  // Fetch recipes
  useEffect(() => {
    async function getRecipes(page) {
      try {
        const limit = 10; // Số lượng công thức mỗi trang
        const cursor = (page - 1) * limit; // Tính toán giá trị cursor dựa trên trang hiện tại
        const response = await axios.get('http://localhost:3000/recipes', {
          params: { limit, cursor },
        });

        setRecipes(response.data.data);
        setTotalPages(response.data.totalPages); // Lưu tổng số trang
      } catch (error) {
        console.error('Failed to fetch recipes:', error);
      }
    }

    getRecipes(currentPage); // Gọi API khi trang thay đổi
  }, [currentPage]);

  // Tạo một mảng chứa các page buttons (tối đa 5 trang)
  const generatePageNumbers = () => {
    const pageNumbers = [];
    let start = Math.max(currentPage - 2, 1);
    let end = Math.min(currentPage + 2, totalPages);

    for (let i = start; i <= end; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  const saverId = '67bf0492b8e677402c59129c';

  // Fetch saved recipes khi mount và khi saverId thay đổi
  useEffect(() => {
    const fetchSavedRecipes = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/saved-recipes/all-saved-recipes-by-user-id/${saverId}`
        );

        // Lấy danh sách `recipe` từ response.data
        const savedRecipeIdsList = response.data.map((item) => item.recipe);
        setSavedRecipeIds(savedRecipeIdsList);
      } catch (error) {
        console.error('Lỗi tải danh sách đã lưu:', error);
      }
    };

    fetchSavedRecipes();
  }, [saverId]);

  // Hàm xử lý toggle trạng thái lưu
  const handleSaveToggle = async (recipeId) => {
    const isSaved = savedRecipeIds.includes(recipeId);

    try {
      // Tạo bản sao của savedRecipeIds để cập nhật đúng
      let newSavedIds;
      if (isSaved) {
        newSavedIds = savedRecipeIds.filter((id) => id !== recipeId);
      } else {
        if (!savedRecipeIds.includes(recipeId)) {
          newSavedIds = [...savedRecipeIds, recipeId];
        } else {
          newSavedIds = [...savedRecipeIds]; // Không thay đổi nếu đã tồn tại
        }
      }

      setSavedRecipeIds(newSavedIds);

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
        openOptionsRecipeDetailModal,
        setOpenOptionsRecipeDetailModal,
        currentPage,
        setCurrentPage,
        generatePageNumbers,
        totalPages,
      }}
    >
      {children}
    </CommonContext.Provider>
  );
};
