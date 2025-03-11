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
  // Searching recipe by recipe name or ingredients
  const [searchRecipeInput, setSearchRecipeInput] = useState('');

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
  const [currentPage, setCurrentPage] = useState(0); // Changed to 0-based for react-paginate
  const [totalPages, setTotalPages] = useState(0);
  const [itemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  const isMobile = useMediaQuery({ maxWidth: 768 });

  // Get recipes with all possible filters
  const getRecipes = async (page = 0) => {
    setIsLoading(true);
    try {
      const cursor = page * itemsPerPage;
      let response;

      const params = {
        limit: itemsPerPage,
        cursor,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        sortOrder,
      };

      if (searchRecipeInput) {
        // Search case
        response = await axios.get(`http://localhost:3000/recipes/search`, {
          params: {
            ...params,
            query: searchRecipeInput,
          },
        });
      } else {
        // Normal case
        response = await axios.get('http://localhost:3000/recipes', {
          params,
        });
      }

      if (response.data.status === 200) {
        setRecipes(response.data.data);
        setTotalPages(response.data.totalPages);
        setFilteredRecipes(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch recipes:', error);
      toast.error('Có lỗi xảy ra khi tải dữ liệu! Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to handle pagination and filters
  useEffect(() => {
    getRecipes(currentPage);
  }, [currentPage, searchRecipeInput, selectedCategory, sortOrder]);

  // Handle page change
  const handlePageChange = (selectedItem) => {
    setCurrentPage(selectedItem.selected);
    window.scrollTo(0, 0); // Scroll to top when page changes
  };

  // Reset pagination when filters change
  useEffect(() => {
    if (currentPage !== 0) {
      setCurrentPage(0);
    }
  }, [searchRecipeInput, selectedCategory, sortOrder]);

  // SaverId là id của user đã lưu công thức
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

  // Lưu công thức vào danh sách yêu thích
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
        totalPages,
        searchRecipeInput,
        setSearchRecipeInput,
        isLoading,
        handlePageChange,
        itemsPerPage,
      }}
    >
      {children}
    </CommonContext.Provider>
  );
};
