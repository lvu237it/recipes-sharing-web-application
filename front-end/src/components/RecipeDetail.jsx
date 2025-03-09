// /src/components/RecipeDetail.jsx
import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCommon } from "../contexts/CommonContext";
import { Image, Table } from "react-bootstrap";
import { RiArrowGoBackLine } from "react-icons/ri";
import { PiDotsThreeOutlineVerticalThin } from "react-icons/pi";
import axios from "axios";
import { DateTime } from "luxon";
import {
  BiPencil,
  BiBookmark,
  BiBookmarkMinus,
  BiTrashAlt,
} from "react-icons/bi";
import { FaChevronRight } from "react-icons/fa";

// Import CommentSection component
import CommentSection from "./CommentSection";

function RecipeDetail() {
  const { recipeNameSlug } = useParams();
  const {
    recipes,
    setRecipes,
    Toaster,
    toast,
    navigate,
    handleSaveToggle,
    savedRecipeIds,
    openOptionsRecipeDetailModal,
    setOpenOptionsRecipeDetailModal,
    setSearchRecipeInput,
  } = useCommon();

  const [recipeViewDetails, setRecipeViewDetails] = useState(null);
  const [openImageRecipeDetailModal, setOpenImageRecipeDetailModal] =
    useState(false);
  const [authorRecipeDetails, setAuthorRecipeDetails] = useState(null);

  const modalOptionsRecipeDetailRef = useRef(null);

  useEffect(() => {
    if (recipeNameSlug) {
      const foundRecipe = recipes.find(
        (recipe) => recipe.slug === recipeNameSlug
      );
      if (foundRecipe) {
        setRecipeViewDetails(foundRecipe);
      }
    }
  }, [recipeNameSlug, recipes]);

  useEffect(() => {
    if (recipeViewDetails) {
      const getAuthorRecipeDetails = async () => {
        try {
          const response = await axios.get(
            `http://localhost:3000/recipes/${recipeViewDetails._id}/populate`
          );
          setAuthorRecipeDetails(response.data.data[0].owner);
        } catch (error) {
          console.error("Error getting populated recipe:", error);
        }
      };
      getAuthorRecipeDetails();
    }
  }, [recipeViewDetails]);

  useEffect(() => {
    if (openImageRecipeDetailModal) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, [openImageRecipeDetailModal]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        modalOptionsRecipeDetailRef.current &&
        !modalOptionsRecipeDetailRef.current.contains(event.target) &&
        !event.target.closest(".pi-dots-three-outline-vertical-thin")
      ) {
        setOpenOptionsRecipeDetailModal(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDeleteRecipe = async (recipeId) => {
    try {
      const response = await axios.patch(
        `http://localhost:3000/recipes/delete-recipe/${recipeId}`
      );
      setOpenOptionsRecipeDetailModal(false);
      if (response.status === 200) {
        const promise = () =>
          new Promise((resolve) =>
            setTimeout(
              () => resolve({ name: "my-toast-deleting-recipe" }),
              2000
            )
          );
        toast.promise(promise, {
          loading: "Vui lòng chờ...",
          success: () => {
            setRecipes((prevRecipes) =>
              prevRecipes.filter((recipe) => recipe._id !== recipeId)
            );
            setTimeout(() => {
              navigate("/recipe-list");
            }, 1000);
            return `Xoá công thức thành công!`;
          },
          error: "Đã có lỗi xảy ra. Vui lòng thử lại.",
        });
      }
    } catch (error) {
      console.error("Error deleting recipe:", error);
      toast.error("Có lỗi xảy ra khi xóa công thức! Vui lòng thử lại.");
    }
  };

  return (
    <>
      <Toaster richColors />
      {openImageRecipeDetailModal && (
        <div
          className="background-black-open-image"
          onClick={(e) => {
            if (e.target.classList.contains("background-black-open-image")) {
              setOpenImageRecipeDetailModal(false);
            }
          }}
        >
          <Image
            className="image-recipe-detail-open"
            src={recipeViewDetails?.imageUrl}
            style={{
              width: "700px",
              boxShadow: "0px 4px 15px rgba(255, 255, 255, 0.15)",
            }}
          />
        </div>
      )}
      {!openImageRecipeDetailModal && (
        <div
          className="recipe-detail-header"
          style={{
            position: "sticky",
            top: 0,
            left: 0,
            background: "#f7f0ed",
            zIndex: 1,
            borderBottom: "0.2px solid rgba(0, 0, 0, 0.1)",
          }}
        >
          <div className="d-flex justify-content-between">
            <Link to={"/recipe-list"}>
              <RiArrowGoBackLine
                title="Quay lại"
                className="ri-arrow-go-back-line-recipe-detail m-3"
                style={{
                  fontSize: 32,
                  padding: 5,
                  borderRadius: "99%",
                  color: "black",
                }}
              />
            </Link>
            <div style={{ position: "relative" }}>
              <PiDotsThreeOutlineVerticalThin
                onClick={() =>
                  setOpenOptionsRecipeDetailModal(!openOptionsRecipeDetailModal)
                }
                title="Thao tác"
                className="pi-dots-three-outline-vertical-thin m-3"
                style={{
                  fontSize: 32,
                  padding: 5,
                  borderRadius: "99%",
                  color: "black",
                }}
              />
              {openOptionsRecipeDetailModal && (
                <div
                  ref={modalOptionsRecipeDetailRef}
                  className="options-modal border shadow-sm"
                  style={{
                    position: "absolute",
                    width: "190px",
                    top: 50,
                    right: 20,
                    backgroundColor: "white",
                    borderRadius: "10px",
                  }}
                >
                  <div className="p-3">
                    <div
                      className="p-2 options-modal-detail"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "120px 1fr",
                      }}
                      onClick={() => handleSaveToggle(recipeViewDetails?._id)}
                    >
                      <div>
                        {savedRecipeIds.includes(recipeViewDetails?._id)
                          ? "Bỏ lưu"
                          : "Lưu công thức"}
                      </div>
                      {savedRecipeIds.includes(recipeViewDetails?._id) ? (
                        <BiBookmarkMinus style={{ margin: "auto" }} />
                      ) : (
                        <BiBookmark style={{ margin: "auto" }} />
                      )}
                    </div>
                    <div
                      className="p-2 options-modal-detail"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "120px 1fr",
                      }}
                    >
                      <div>Đổi trạng thái</div>
                      <FaChevronRight style={{ margin: "auto" }} />
                    </div>
                    <div
                      className="p-2 options-modal-detail"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "120px 1fr",
                      }}
                    >
                      <div>Chỉnh sửa</div>
                      <BiPencil style={{ margin: "auto" }} />
                    </div>
                    <div
                      className="p-2 options-modal-detail"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "120px 1fr",
                        color: "red",
                      }}
                      onClick={() => handleDeleteRecipe(recipeViewDetails?._id)}
                    >
                      <div>Xoá công thức</div>
                      <BiTrashAlt style={{ margin: "auto" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div style={{ position: "absolute", right: 0 }}>
            <PiDotsThreeOutlineVerticalThin
              onClick={() =>
                setOpenOptionsRecipeDetailModal(!openOptionsRecipeDetailModal)
              }
              title="Thao tác"
              className="pi-dots-three-outline-vertical-thin m-3 "
              style={{
                fontSize: 32,
                padding: 5,
                borderRadius: "99%",
                color: "black",
              }}
            />
            {openOptionsRecipeDetailModal && (
              <div
                ref={modalOptionsRecipeDetailRef}
                className="options-modal border shadow-sm"
                style={{
                  position: "absolute",
                  width: "190px",
                  top: 50,
                  right: 20,
                  backgroundColor: "white",
                  borderRadius: "10px",
                }}
              >
                <div className="p-3">
                  <div
                    className="p-2 options-modal-detail"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "120px 1fr",
                    }}
                    onClick={() => handleSaveToggle(recipeViewDetails?._id)}
                  >
                    <div>
                      {savedRecipeIds.includes(recipeViewDetails?._id)
                        ? "Bỏ lưu"
                        : "Lưu công thức"}
                    </div>
                    {savedRecipeIds.includes(recipeViewDetails?._id) ? (
                      <BiBookmarkMinus style={{ margin: "auto" }} />
                    ) : (
                      <BiBookmark style={{ margin: "auto" }} />
                    )}
                  </div>
                  <div
                    className="p-2 options-modal-detail"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "120px 1fr",
                    }}
                  >
                    <div>Đổi trạng thái</div>
                    <FaChevronRight style={{ margin: "auto" }} />
                  </div>
                  <div
                    className="p-2 options-modal-detail"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "120px 1fr",
                    }}
                  >
                    <div>Chỉnh sửa</div>
                    <BiPencil style={{ margin: "auto" }} />
                  </div>
                  <div
                    className="p-2 options-modal-detail"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "120px 1fr",
                      color: "red",
                    }}
                    onClick={() => handleDeleteRecipe(recipeViewDetails?._id)}
                  >
                    <div>Xoá công thức</div>
                    <BiTrashAlt style={{ margin: "auto" }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div
        className="view-recipe-details-wrapper m-3 p-md-4 p-3 border"
        style={{
          position: "relative",
          minHeight: "100%",
          borderRadius: "10px",
          borderColor: "rgba(169, 169, 169, 0.1)",
        }}
      >
        <div
          className="recipe-details-image-and-description gap-2"
          style={{
            display: "grid",
            marginBottom: "30px",
          }}
        >
          <Image
            src={recipeViewDetails?.imageUrl}
            style={{
              width: "400px",
              maxWidth: "100%",
              margin: "auto",
              borderRadius: "5px",
            }}
            className="recipe-details-image-on-top shadow p-2"
            onClick={() => setOpenImageRecipeDetailModal(true)}
          />
          <div
            className="recipe-details-description"
            style={{ margin: "15px 20px" }}
          >
            <div
              className="avatar-information mb-3"
              style={{ display: "grid", gridTemplateColumns: "65px 1fr" }}
            >
              <Image
                className="avatar-image my-auto"
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "100%",
                  objectFit: "cover",
                }}
                src="https://media.gettyimages.com/id/2156062809/photo/headshot-closeup-portrait-middle-eastern-israel-businesswoman-business-lady-standing-isolated.jpg?b=1&s=612x612&w=0&k=20&c=mPEqaET5s98W_40DmBTRbYY5z0F-_1YkqdC4TCHJeig="
              />
              <div>
                <div
                  className="author-name"
                  style={{ fontSize: 22, fontWeight: 600 }}
                >
                  {authorRecipeDetails?.username}
                </div>
                <div className="bi-pencil-and-created-at d-flex gap-2 align-items-center">
                  <BiPencil />
                  <div className="created-at">
                    {DateTime.fromISO(recipeViewDetails?.createdAt).toFormat(
                      "HH:mm dd/MM/yyyy"
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div
              className="recipe-details-title"
              style={{
                fontWeight: "bolder",
                color: "#528135",
                textTransform: "uppercase",
                fontSize: 32,
              }}
            >
              {recipeViewDetails?.title}
            </div>
            <div
              className="recipe-details-description"
              style={{ margin: "10px 0", fontSize: 14 }}
              dangerouslySetInnerHTML={{
                __html: recipeViewDetails?.description,
              }}
            ></div>
          </div>
        </div>
        <div
          className="recipe-ingredients-and-steps"
          style={{
            display: "grid",
          }}
        >
          <div
            className="recipe-details-ingredients"
            style={{
              backgroundColor: "#f7f0ed",
              padding: "10px 20px",
            }}
          >
            <Table bordered responsive>
              <th
                className="py-2"
                style={{
                  color: "#528135",
                  fontSize: 24,
                }}
              >
                Nguyên liệu
              </th>
              {recipeViewDetails?.ingredients.map((ingredient, index) => (
                <tr key={index} style={{ fontSize: 14 }}>
                  <td style={{ padding: "8px 0" }}>{ingredient}</td>
                </tr>
              ))}
            </Table>
          </div>
          <div className="recipe-details-steps" style={{ margin: "0 20px" }}>
            <div
              className="details-recipe-how-to-cook"
              style={{
                fontWeight: "bolder",
                color: "#528135",
                fontSize: 24,
                margin: "10px",
              }}
            >
              Cách chế biến
            </div>
            <hr />
            {recipeViewDetails?.steps.map((step, index) => (
              <div
                key={index}
                className="step-details"
                style={{
                  display: "grid",
                  gridTemplateColumns: "45px 1fr",
                  margin: "15px 0",
                }}
              >
                <div
                  className="details-recipe-step-number"
                  style={{ margin: "0 auto" }}
                >
                  <div
                    style={{
                      border: "0.5px solid gray",
                      borderRadius: 100,
                      padding: "5px 10px",
                      fontSize: 10,
                    }}
                  >
                    {index + 1}
                  </div>
                </div>
                <div
                  className="details-recipe-step-description"
                  style={{ fontSize: 14 }}
                >
                  {step.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Minimal modification: Append CommentSection at the end */}
        <div
          style={{
            marginTop: "40px",
            padding: "20px",
            backgroundColor: "#fdf7f4",
            borderRadius: "10px",
            border: "1px solid rgba(169, 169, 169, 0.1)",
          }}
        >
          <h3
            style={{ color: "#528135", fontSize: "24px", marginBottom: "20px" }}
          >
            Comments
          </h3>
          <CommentSection recipeId={recipeViewDetails?._id} />
        </div>
      </div>
    </>
  );
}

export default RecipeDetail;
