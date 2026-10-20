import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { Category } from '../models/types';
import { createCourse, getCategories, getCourseById, updateCourse } from '../services/api';

export default function CourseFormScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const isEditing = Boolean(id);

  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [instructor, setInstructor] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [trailerUrl, setTrailerUrl] = useState('');

  useEffect(() => {
    loadCategories();
    if (isEditing && id) {
      loadCourseData(id);
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
      if (!categoryId && data.length > 0) {
        setCategoryId(data[0].id);
      }
    } catch (error) {
      console.error('Lỗi tải danh mục:', error);
    }
  };

  const loadCourseData = async (courseId: string) => {
    try {
      const course = await getCourseById(courseId);
      setTitle(course.title);
      setDescription(course.description);
      setCategoryId(course.categoryId);
      setInstructor(course.instructor);
      setPrice(String(course.price));
      setDuration(String(course.duration));
      setThumbnail(course.thumbnail);
      setTrailerUrl(course.trailerUrl);
    } catch (error) {
      console.error('Lỗi tải khóa học:', error);
    }
  };

  const handleSave = async () => {
    // Validate dữ liệu bắt buộc
    if (!title || !instructor || !price || !categoryId || !thumbnail) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ các trường bắt buộc!');
      return;
    }

    const courseData = {
      title,
      description,
      categoryId,
      instructor,
      price: Number(price),
      duration: Number(duration) || 0,
      thumbnail,
      trailerUrl,
    };

    try {
      if (isEditing && id) {
        await updateCourse(id, courseData);
        alert('Cập nhật khóa học thành công!');
      } else {
        await createCourse(courseData);
        alert('Thêm khóa học thành công!');
      }
      router.back();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu khóa học. Vui lòng thử lại!');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Quay lại</Text>
      </TouchableOpacity>
      <Text style={styles.header}>{isEditing ? 'Sửa Khóa Học' : 'Thêm Khóa Học Mới'}</Text>

      <Text style={styles.label}>Tên khóa học *</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Nhập tên khóa học" />

      <Text style={styles.label}>Giảng viên *</Text>
      <TextInput style={styles.input} value={instructor} onChangeText={setInstructor} placeholder="Nhập tên giảng viên" />

      <Text style={styles.label}>Học phí (VNĐ) *</Text>
      <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="Ví dụ: 500000" />

      <Text style={styles.label}>Thời lượng (giờ)</Text>
      <TextInput style={styles.input} value={duration} onChangeText={setDuration} keyboardType="numeric" placeholder="Ví dụ: 10" />

      <Text style={styles.label}>Chọn danh mục *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.catChip, categoryId === cat.id && styles.activeCatChip]}
            onPress={() => setCategoryId(cat.id)}
          >
            <Text style={[styles.catChipText, categoryId === cat.id && styles.activeCatChipText]}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.label}>Link ảnh Thumbnail (URL) *</Text>
      <TextInput style={styles.input} value={thumbnail} onChangeText={setThumbnail} placeholder="https://..." />
      {thumbnail ? <Image source={{ uri: thumbnail }} style={styles.previewImage} /> : null}

      <Text style={styles.label}>Link Trailer Video (URL)</Text>
      <TextInput style={styles.input} value={trailerUrl} onChangeText={setTrailerUrl} placeholder="https://..." />

      <Text style={styles.label}>Mô tả</Text>
      <TextInput style={[styles.input, { height: 80 }]} value={description} onChangeText={setDescription} multiline placeholder="Nhập mô tả khóa học" />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>{isEditing ? 'Lưu Thay Đổi' : 'Thêm Khóa Học'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9', paddingTop: 40 },
  backButton: { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 2, marginBottom: 4 },
  backButtonText: { color: '#007AFF', fontSize: 15, fontWeight: '600' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6, color: '#333' },
  input: { backgroundColor: '#fff', padding: 10, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#ddd' },
  catChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: '#e0e0e0', marginRight: 8 },
  activeCatChip: { backgroundColor: '#007AFF' },
  catChipText: { color: '#333', fontSize: 13 },
  activeCatChipText: { color: '#fff', fontWeight: 'bold' },
  previewImage: { width: 100, height: 100, borderRadius: 8, marginBottom: 12, resizeMode: 'cover' },
  saveButton: { backgroundColor: '#34C759', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 40 },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
