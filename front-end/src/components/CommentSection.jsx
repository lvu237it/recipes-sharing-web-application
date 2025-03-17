import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // for redirection
import axios from "axios";
import { DateTime } from "luxon";
import { Button, Form, Modal, Dropdown } from "react-bootstrap";
import { useCommon } from "../contexts/CommonContext";
import { FaEllipsisH } from "react-icons/fa";

const CommentSection = ({ recipeId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState("");

  const { toast } = useCommon();
  const navigate = useNavigate();

  // Get accessToken from localStorage and decode it for user id and role
  const accessToken = localStorage.getItem("accessToken");
  let currentUserId = null;
  let currentUserRole = "user"; // default role

  if (accessToken) {
    try {
      const payload = JSON.parse(atob(accessToken.split(".")[1]));
      currentUserId = payload._id;
      currentUserRole = payload.role || "user";
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }

  useEffect(() => {
    if (!recipeId) return;
    const fetchComments = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/comments/recipe/${recipeId}/comments`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        setComments(response.data);
      } catch (error) {
        console.error("Error fetching comments:", error);
        toast.error("Không thể tải bình luận.");
      }
    };
    fetchComments();
  }, [recipeId, toast, accessToken]);

  // Add new comment
  const handleAddComment = async () => {
    if (!currentUserId) {
      setShowLoginModal(true);
      return;
    }
    if (!newComment.trim()) {
      toast.warning("Nội dung bình luận không được để trống.");
      return;
    }
    try {
      const endpoint =
        currentUserRole === "admin"
          ? `http://localhost:3000/comments/admin/recipe/${recipeId}/add-comment`
          : `http://localhost:3000/comments/user/recipe/${recipeId}/add-comment`;

      const response = await axios.post(
        endpoint,
        { content: newComment },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setComments((prev) => [...prev, response.data]);
      setNewComment("");
      toast.success("Đăng bình luận thành công!");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Đăng bình luận thất bại.");
    }
  };

  // Save edited comment
  const handleSaveEdit = async (commentId, commentUserId) => {
    if (commentUserId !== currentUserId) {
      toast.error("Bạn không có quyền sửa bình luận này.");
      return;
    }
    if (!editingContent.trim()) {
      toast.warning("Nội dung bình luận không được để trống.");
      return;
    }
    try {
      const endpoint =
        currentUserRole === "admin"
          ? `http://localhost:3000/comments/admin/recipe/${recipeId}/edit-comment/${commentId}`
          : `http://localhost:3000/comments/user/recipe/${recipeId}/edit-comment/${commentId}`;

      const response = await axios.patch(
        endpoint,
        { content: editingContent },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? response.data : c))
      );
      setEditingCommentId(null);
      setEditingContent("");
      toast.success("Cập nhật bình luận thành công!");
    } catch (error) {
      console.error("Error editing comment:", error);
      toast.error("Cập nhật bình luận thất bại.");
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId, commentUserId) => {
    if (commentUserId !== currentUserId && currentUserRole !== "admin") {
      toast.error("Bạn không có quyền xóa bình luận này.");
      return;
    }
    try {
      const endpoint =
        currentUserRole === "admin"
          ? `http://localhost:3000/comments/admin/recipe/${recipeId}/delete-comment/${commentId}`
          : `http://localhost:3000/comments/user/recipe/${recipeId}/delete-comment/${commentId}`;

      await axios.patch(
        endpoint,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      toast.success("Xóa bình luận thành công!");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Xóa bình luận thất bại.");
    }
  };

  return (
    <div className="comment-section">
      <div className="comments-list">
        {comments.length === 0 ? (
          <p>Chưa có bình luận nào. Hãy là người đầu tiên!</p>
        ) : (
          comments.map((comment) => {
            const isOwner = comment.user === currentUserId;
            const isEditing = editingCommentId === comment._id;

            return (
              <div
                key={comment._id}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "10px",
                  marginBottom: "15px",
                  backgroundColor: "#fff",
                  position: "relative",
                }}
              >
                <strong style={{ color: "#528135" }}>
                  {comment.authorUsername || "Người dùng ẩn danh"}
                </strong>
                {isEditing ? (
                  <>
                    <Form.Group className="mt-2">
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        style={{
                          border: "none",
                          boxShadow: "none",
                          outline: "none",
                        }}
                      />
                    </Form.Group>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        marginTop: "8px",
                      }}
                    >
                      <Button
                        variant="primary"
                        onClick={() =>
                          handleSaveEdit(comment._id, comment.user)
                        }
                        style={{ marginRight: "8px" }}
                      >
                        Lưu
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setEditingCommentId(null);
                          setEditingContent("");
                        }}
                      >
                        Hủy
                      </Button>
                    </div>
                  </>
                ) : (
                  <p style={{ margin: "5px 0" }}>{comment.content}</p>
                )}
                <small style={{ color: "#666" }}>
                  {DateTime.fromISO(comment.createdAt).toFormat(
                    "HH:mm dd/MM/yyyy"
                  )}
                </small>
                {!isEditing && (
                  <div
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      border: "none",
                    }}
                  >
                    <Dropdown align="end" style={{ border: "none" }}>
                      <Dropdown.Toggle
                        as={Button}
                        style={{
                          background: "none",
                          border: "none",
                          boxShadow: "none",
                          outline: "none",
                          color: "#888",
                          padding: 0,
                          margin: 0,
                          cursor: "pointer",
                        }}
                        className="no-outline-toggle"
                      >
                        <FaEllipsisH size={20} />
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        {isOwner && (
                          <Dropdown.Item
                            onClick={() => {
                              setEditingCommentId(comment._id);
                              setEditingContent(comment.content);
                            }}
                          >
                            Sửa bình luận
                          </Dropdown.Item>
                        )}
                        {(isOwner || currentUserRole === "admin") && (
                          <Dropdown.Item
                            onClick={() =>
                              handleDeleteComment(comment._id, comment.user)
                            }
                          >
                            Xóa bình luận
                          </Dropdown.Item>
                        )}
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      <div
        className="d-flex align-items-center mt-3"
        style={{
          border: "1px solid #ccc",
          borderRadius: "50px",
          padding: "8px 12px",
          backgroundColor: "#fff",
        }}
      >
        <Form.Group className="flex-grow-1 m-0">
          <Form.Control
            as="textarea"
            rows={1}
            placeholder="Viết bình luận…"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            style={{
              border: "none",
              resize: "none",
              boxShadow: "none",
              outline: "none",
              height: "36px",
              paddingTop: "6px",
            }}
          />
        </Form.Group>
        <Button
          variant="link"
          style={{ textDecoration: "none", marginLeft: "8px" }}
          onClick={handleAddComment}
        >
          Đăng
        </Button>
      </div>
      <Modal show={showLoginModal} onHide={() => setShowLoginModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Bạn phải đăng nhập để đăng bình luận</Modal.Title>
        </Modal.Header>
        <Modal.Body>Vui lòng đăng nhập để có thể thêm bình luận.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLoginModal(false)}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              navigate("/");
            }}
          >
            Đăng nhập
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CommentSection;
