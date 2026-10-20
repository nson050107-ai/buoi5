import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Category, Course } from '../models/types';
import { getCategories, getCourses } from '../services/api';

export default function HomeScreen() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');

  useEffect(() => {
    filterData();
  }, [searchQuery, selectedCategoryId, courses]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [coursesData, categoriesData] = await Promise.all([getCourses(), getCategories()]);
      setCourses(coursesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Lỗi tải dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    void fetchData();
  }, [fetchData]));

  const filterData = () => {
    let result = courses;

    if (selectedCategoryId !== 'ALL') {
      result = result.filter((item) => item.categoryId === selectedCategoryId);
    }

    if (searchQuery.trim() !== '') {
      result = result.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredCourses(result);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10 }}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Quản Lý Khóa Học</Text>

      {/* Ô tìm kiếm */}
      <TextInput
        style={styles.searchInput}
        placeholder="Tìm kiếm khóa học theo tên..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Thanh chọn Danh mục */}
      <View style={{ height: 45, marginBottom: 10 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.chip, selectedCategoryId === 'ALL' && styles.activeChip]}
            onPress={() => setSelectedCategoryId('ALL')}
          >
            <Text style={[styles.chipText, selectedCategoryId === 'ALL' && styles.activeChipText]}>
              Tất cả
            </Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.chip, selectedCategoryId === cat.id && styles.activeChip]}
              onPress={() => setSelectedCategoryId(cat.id)}
            >
              <Text style={[styles.chipText, selectedCategoryId === cat.id && styles.activeChipText]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Danh sách khóa học */}
      <FlatList
        data={filteredCourses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/detail?id=${item.id}`)}
          >
            <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
            <View style={styles.info}>
              <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.instructor}>GV: {item.instructor}</Text>
              <Text style={styles.price}>Học phí: {Number(item.price).toLocaleString()} VNĐ</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>Không tìm thấy khóa học nào</Text>}
      />

      {/* Nút điều hướng ở cuối trang */}
      <View style={styles.bottomNavContainer}>
        <TouchableOpacity 
          style={styles.navButton} 
          onPress={() => router.push('/course-form')}
        >
          <Text style={styles.navButtonText}>+ Thêm Khóa Học</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navButton, { backgroundColor: '#5856D6' }]} 
          onPress={() => router.push('/categories')}
        >
          <Text style={styles.navButtonText}>📂 Quản Lý Danh Mục</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5', paddingTop: 50 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  searchInput: { backgroundColor: '#fff', padding: 10, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#ddd' },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#e0e0e0', marginRight: 8, height: 36 },
  activeChip: { backgroundColor: '#007AFF' },
  chipText: { color: '#333', fontSize: 13 },
  activeChipText: { color: '#fff', fontWeight: 'bold' },
  card: { flexDirection: 'row', backgroundColor: '#fff', marginBottom: 12, borderRadius: 8, overflow: 'hidden', elevation: 2 },
  thumbnail: { width: 100, height: 100 },
  info: { flex: 1, padding: 10, justifyContent: 'center' },
  title: { fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  instructor: { fontSize: 13, color: '#666', marginBottom: 4 },
  price: { fontSize: 13, color: '#007AFF', fontWeight: '600' },
  bottomNavContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 10,
  },
  navButton: {
    backgroundColor: '#34C759',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    elevation: 2,
  },
  navButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
