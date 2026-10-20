import axios from 'axios';
import { Category, Course } from '../models/types';

const BASE_URL = 'https://6ad6ddadf71f154ac48739b1.mockapi.io';

// --- COURSES API ---
export const getCourses = async (): Promise<Course[]> => {
  const res = await axios.get(`${BASE_URL}/courses`);
  return res.data;
};

export const getCourseById = async (id: string): Promise<Course> => {
  const res = await axios.get(`${BASE_URL}/courses/${id}`);
  return res.data;
};

export const createCourse = async (course: Omit<Course, 'id'>): Promise<Course> => {
  const res = await axios.post(`${BASE_URL}/courses`, course);
  return res.data;
};

export const updateCourse = async (id: string, course: Partial<Course>): Promise<Course> => {
  const res = await axios.put(`${BASE_URL}/courses/${id}`, course);
  return res.data;
};

export const deleteCourse = async (id: string): Promise<void> => {
  await axios.delete(`${BASE_URL}/courses/${id}`);
};

// --- CATEGORIES API ---
export const getCategories = async (): Promise<Category[]> => {
  const res = await axios.get(`${BASE_URL}/categories`);
  return res.data;
};

export const createCategory = async (category: Omit<Category, 'id'>): Promise<Category> => {
  const res = await axios.post(`${BASE_URL}/categories`, category);
  return res.data;
};

export const updateCategory = async (id: string, category: Partial<Category>): Promise<Category> => {
  const res = await axios.put(`${BASE_URL}/categories/${id}`, category);
  return res.data;
};

export const deleteCategory = async (id: string, courses: Course[]): Promise<boolean> => {
  // Ràng buộc: Không cho xóa danh mục đang có khóa học
  const hasCourse = courses.some((c) => c.categoryId === id);
  if (hasCourse) {
    alert('Không thể xóa danh mục đang chứa khóa học!');
    return false;
  }
  await axios.delete(`${BASE_URL}/categories/${id}`);
  return true;
};