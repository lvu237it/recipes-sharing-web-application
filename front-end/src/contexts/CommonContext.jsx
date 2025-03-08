import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useMediaQuery } from 'react-responsive';

const CommonContext = createContext();

export const useCommon = () => useContext(CommonContext);

export const Common = ({ children }) => {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState('latest');

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
      }}
    >
      {children}
    </CommonContext.Provider>
  );
};
