import { useState, useMemo, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import {
  Button,
  Image,
  Form,
  InputGroup,
  Col,
  Row,
  Spinner,
} from 'react-bootstrap';
import { useCommon } from '../contexts/CommonContext';
import { Link } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import { Modal } from 'react-bootstrap';
import { BiPencil, BiImageAdd } from 'react-icons/bi';
import ReactPaginate from 'react-paginate';
import axios from 'axios';
import { HiMiniBellAlert } from 'react-icons/hi2';
import { FaRegCircleUser } from 'react-icons/fa6';
import { GiCook } from 'react-icons/gi';
import { PiChefHat } from 'react-icons/pi';
import { CiBookmarkCheck } from 'react-icons/ci';
import { IoHomeOutline } from 'react-icons/io5';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKitchenSet } from '@fortawesome/free-solid-svg-icons';

function ChefsCommunity() {
  const {
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
    handleSaveRecipe,
    handleUnsaveRecipe,
    handleSaveToggle,
    savedRecipeIds,
    setSavedRecipeIds,
    currentPage,
    setCurrentPage,
    generatePageNumbers,
    totalPages,
    handlePageChange,
    isLoading,
    searchRecipeInput,
    setSearchRecipeInput,
    navigate,
  } = useCommon();

  return <>ChefsCommunity</>;
}

export default ChefsCommunity;
