import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Card, Image, Badge, Button, Row, Col, ListGroup } from "react-bootstrap";
const statusMapping = {
    "Pending_Approval": "Chờ duyệt",
    "Public": "Công khai",
    "Rejected": "Từ chối",
    "Private": "Riêng tư"
  };
const AdminRecipeDetails = () => {
  const { recipeId } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get(`http://localhost:3000/admin/recipes/${recipeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setRecipe(response.data.data))
      .catch((error) => console.error("Lỗi lấy chi tiết món ăn:", error));
  }, [recipeId]);

  if (!recipe) return <p className="text-center">Đang tải...</p>;
  console.log("Recipe Status:", recipe.status);
  console.log(recipe);
  
  return (
    <Container className="mt-4">
      {/* Nút quay lại */}
      <Button variant="secondary" onClick={() => navigate(-1)} className="mb-3">
        ← Quay lại
      </Button>

      <Card className="shadow-lg p-4">
        <Row>
          {/* Hình ảnh món ăn */}
          <Col md={4} className="text-center">
            <Image src={recipe.imageUrl} alt={recipe.title} fluid rounded />
          </Col>

          {/* Thông tin món ăn */}
          <Col md={8}>
            <h2 className="fw-bold text-success">{recipe.title}</h2>
            <p className="text-muted">{recipe.description}</p>
            <Badge bg={recipe.status === "active" ? "success" : "danger"} className="mb-2">
              {statusMapping[recipe.status]}
            </Badge>
            <p><strong>Người tạo:</strong> {recipe.owner?.username || "Unknown"}</p>
            <p><strong>Danh mục:</strong> {recipe.foodCategories.join(", ")}</p>
          </Col>
        </Row>
      </Card>

      {/* Nguyên liệu và Cách chế biến */}
      <Row className="mt-4">
        {/* Nguyên liệu */}
        <Col md={4}>
          <Card className="p-3 shadow-sm bg-light">
            <h5 className="text-success">Nguyên liệu</h5>
            <ListGroup>
              {recipe.ingredients.map((ingredient, index) => (
                <ListGroup.Item key={index}>{ingredient}</ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>

        {/* Cách chế biến */}
        <Col md={8}>
          <Card className="p-3 shadow-sm">
            <h5 className="text-success">Cách chế biến</h5>
            <ListGroup numbered>
              {recipe.steps.map((step, index) => (
                <ListGroup.Item key={index}>{step.description}</ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminRecipeDetails;
