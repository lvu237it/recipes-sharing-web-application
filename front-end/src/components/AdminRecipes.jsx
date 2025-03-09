import { useEffect, useState } from "react";
import axios from "axios";
import { Table, Container, Image, Badge, Pagination } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import ReactPaginate from "react-paginate";

const AdminRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const limit = 5;
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Fetch API
  const fetchRecipes = (page) => {
    axios
      .get(`http://localhost:3000/admin/recipes?limit=${limit}&page=${page + 1}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setRecipes(response.data.data || []);
        setTotalPages(response.data.totalPages || 1);
      })
      .catch((error) => console.error("Lỗi lấy dữ liệu:", error));
  };

  useEffect(() => {
    fetchRecipes(currentPage);
  }, [currentPage]);

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  console.log(recipes);
  
  return (
    <Container>
      <h1 className="text-center my-4">Danh sách Recipes</h1>

      {/* Bảng danh sách món ăn */}
      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>Thứ tự</th>
            <th>Hình ảnh</th>
            <th>Tiêu đề</th>
            <th>Danh mục</th>
            <th>Người tạo</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {recipes.length > 0 ? (
            recipes.map((recipe, index) => (
              <tr key={recipe.id || recipe._id}>
                <td>{index + 1 + currentPage * limit}</td>
                <td>
                  <Image src={recipe.imageUrl} alt={recipe.title} width={100} height={100} rounded />
                </td>
                <td>{recipe.title}</td>
                <td>{recipe.foodCategories.join(", ")}</td>
                <td>{recipe.owner?.username || "Unknown"}</td>
                <td>
                  <Badge bg={recipe.status === "active" ? "success" : "danger"}>
                    {recipe.status}
                  </Badge>
                </td>
                <td>
                  <button
                    className="btn btn-info"
                    onClick={() => navigate(`/admin/recipes/${recipe._id}`)}
                  >
                    Xem chi tiết
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center text-muted">Không có dữ liệu.</td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Phân trang */}
      <div className="d-flex justify-content-center">
        <ReactPaginate
          previousLabel={"← Trước"}
          nextLabel={"Tiếp →"}
          breakLabel={"..."}
          pageCount={totalPages}
          marginPagesDisplayed={2}
          pageRangeDisplayed={3}
          onPageChange={handlePageClick}
          containerClassName={"pagination"}
          activeClassName={"active"}
          pageClassName={"page-item"}
          pageLinkClassName={"page-link"}
          previousClassName={"page-item"}
          previousLinkClassName={"page-link"}
          nextClassName={"page-item"}
          nextLinkClassName={"page-link"}
          breakClassName={"page-item"}
          breakLinkClassName={"page-link"}
        />
      </div>
    </Container>
  );
};

export default AdminRecipes;
