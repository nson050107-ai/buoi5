import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Category, Course } from '../models/types';
import { createCategory, deleteCategory, getCategories, getCourses, updateCategory } from '../services/api';

export default function CategoriesScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [categoryData, courseData] = await Promise.all([getCategories(), getCourses()]);
      setCategories(categoryData);
      setCourses(courseData);
    } catch {
      Alert.alert('Lỗi', 'Không tải được danh mục. Vui lòng kiểm tra kết nối mạng và thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void loadData(); }, [loadData]));

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
  };

  const saveCategory = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên danh mục.');
      return;
    }
    setSaving(true);
    try {
      const payload = { name: trimmedName, description: description.trim() };
      if (editingId) {
        await updateCategory(editingId, payload);
      } else {
        await createCategory(payload);
      }
      resetForm();
      await loadData();
    } catch {
      Alert.alert('Lỗi', 'Không thể lưu danh mục. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (category: Category) => {
    const remove = async () => {
      try {
        const deleted = await deleteCategory(category.id, courses);
        if (deleted) await loadData();
      } catch {
        Alert.alert('Lỗi', 'Không thể xóa danh mục. Vui lòng thử lại.');
      }
    };
    if (Platform.OS === 'web') {
      if (globalThis.confirm(`Xóa danh mục “${category.name}”?`)) void remove();
    } else {
      Alert.alert('Xác nhận xóa', `Xóa danh mục “${category.name}”?`, [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa', style: 'destructive', onPress: () => void remove() },
      ]);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}><Text style={styles.backText}>‹ Quay lại</Text></TouchableOpacity>
        <Text style={styles.title}>Quản lý danh mục</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.formTitle}>{editingId ? 'Sửa danh mục' : 'Thêm danh mục'}</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Tên danh mục" maxLength={80} />
        <TextInput style={[styles.input, styles.multiline]} value={description} onChangeText={setDescription} placeholder="Mô tả (không bắt buộc)" multiline maxLength={300} />
        <View style={styles.formActions}>
          {editingId ? <TouchableOpacity style={styles.cancelButton} onPress={resetForm}><Text style={styles.cancelText}>Hủy sửa</Text></TouchableOpacity> : null}
          <TouchableOpacity style={styles.saveButton} onPress={() => void saveCategory()} disabled={saving}>
            <Text style={styles.saveText}>{saving ? 'Đang lưu…' : editingId ? 'Lưu thay đổi' : '+ Thêm danh mục'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.listTitle}>Danh mục hiện có ({categories.length})</Text>
      {loading ? <ActivityIndicator style={styles.loader} color="#5856D6" /> : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          contentContainerStyle={categories.length === 0 ? styles.emptyContainer : undefined}
          ListEmptyComponent={<Text style={styles.emptyText}>Chưa có danh mục nào. Hãy thêm danh mục ở trên.</Text>}
          renderItem={({ item }) => {
            const count = courses.filter((course) => course.categoryId === item.id).length;
            return (
              <View style={styles.card}>
                <View style={styles.cardInfo}>
                  <Text style={styles.categoryName}>{item.name}</Text>
                  {!!item.description && <Text style={styles.description}>{item.description}</Text>}
                  <Text style={styles.courseCount}>{count} khóa học</Text>
                </View>
                <View style={styles.itemActions}>
                  <TouchableOpacity style={styles.editButton} onPress={() => { setEditingId(item.id); setName(item.name); setDescription(item.description ?? ''); }}><Text style={styles.editText}>Sửa</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.deleteButton} onPress={() => confirmDelete(item)}><Text style={styles.deleteText}>Xóa</Text></TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16, paddingTop: 48 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 18, minHeight: 36 },
  backButton: { position: 'absolute', left: 0, paddingVertical: 8, paddingRight: 12 },
  backText: { color: '#5856D6', fontSize: 15, fontWeight: '600' },
  title: { fontSize: 20, fontWeight: '700', color: '#222' },
  form: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 20, elevation: 2 },
  formTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10, color: '#333' },
  input: { backgroundColor: '#fafafa', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 11, marginBottom: 10, color: '#222' },
  multiline: { minHeight: 70, textAlignVertical: 'top' },
  formActions: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end' },
  saveButton: { backgroundColor: '#5856D6', paddingHorizontal: 16, paddingVertical: 11, borderRadius: 8, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '700' },
  cancelButton: { paddingHorizontal: 14, paddingVertical: 11 },
  cancelText: { color: '#666', fontWeight: '600' },
  listTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 10 },
  loader: { marginTop: 30 },
  emptyContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#777', textAlign: 'center', padding: 24 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', elevation: 1 },
  cardInfo: { flex: 1, paddingRight: 8 },
  categoryName: { fontSize: 16, fontWeight: '700', color: '#222' },
  description: { color: '#666', marginTop: 4 },
  courseCount: { color: '#777', fontSize: 12, marginTop: 5 },
  itemActions: { flexDirection: 'row', gap: 8 },
  editButton: { backgroundColor: '#eef0ff', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 7 },
  editText: { color: '#5856D6', fontWeight: '700' },
  deleteButton: { backgroundColor: '#fff0ef', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 7 },
  deleteText: { color: '#d93025', fontWeight: '700' },
});
