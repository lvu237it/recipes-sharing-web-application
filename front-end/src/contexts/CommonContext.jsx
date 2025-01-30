import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useMediaQuery } from 'react-responsive';

const CommonContext = createContext();

export const useCommon = () => useContext(CommonContext);

export const Common = ({ children }) => {
  const [recipes, setRecipes] = useState([]);

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
        setRecipes([]); // Xử lý lỗi: đặt `recipes` là mảng rỗng
      }
    }
    getRecipes();
  }, []);

  return (
    <CommonContext.Provider
      value={{
        recipes,
      }}
    >
      {children}
    </CommonContext.Provider>
  );
};
