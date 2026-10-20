import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Course } from '../models/types';
import { deleteCourse, getCourseById } from '../services/api';

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchCourseDetail = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setCourse(await getCourseById(id));
      } catch (error) {
        console.error('Lỗi tải chi tiết khóa học:', error);
        setCourse(null);
      } finally {
        setLoading(false);
      }
    };
    void fetchCourseDetail();
  }, [id]);

  const handleDelete = () => {
    if (!id || deleting) return;

    const removeCourse = async () => {
      try {
        setDeleting(true);
        await deleteCourse(String(id));
        router.replace('/');
      } catch (error) {
        console.error('Không thể xóa khóa học:', error);
        if (Platform.OS === 'web') {
          globalThis.alert('Xóa khóa học thất bại. Vui lòng thử lại.');
        } else {
          Alert.alert('Lỗi', 'Xóa khóa học thất bại. Vui lòng thử lại.');
        }
      } finally {
        setDeleting(false);
      }
    };

    const message = `Bạn có chắc chắn muốn xóa khóa học “${course?.title ?? ''}” không?`;
    if (Platform.OS === 'web') {
      if (globalThis.confirm(message)) void removeCourse();
      return;
    }

    Alert.alert('Xác nhận xóa', message, [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', style: 'destructive', onPress: () => void removeCourse() },
    ]);
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#007AFF" /></View>;
  }

  if (!course) {
    return <View style={styles.center}><Text>Không tìm thấy thông tin khóa học.</Text></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: course.thumbnail }} style={styles.thumbnail} />
      <View style={styles.content}>
        <Text style={styles.title}>{course.title}</Text>
        <Text style={styles.instructor}>Giảng viên: {course.instructor}</Text>
        <Text style={styles.price}>Học phí: {Number(course.price).toLocaleString()} VNĐ</Text>
        <Text style={styles.duration}>Thời lượng: {course.duration} giờ</Text>
        <Text style={styles.sectionTitle}>Mô tả khóa học:</Text>
        <Text style={styles.description}>{course.description}</Text>

        {course.trailerUrl ? (
          <TouchableOpacity style={styles.trailerButton} onPress={() => Linking.openURL(course.trailerUrl)}>
            <Text style={styles.trailerButtonText}>▶ Xem Trailer / Video</Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.editButton} onPress={() => router.push(`/course-form?id=${course.id}`)}>
            <Text style={styles.buttonText}>Sửa khóa học</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} disabled={deleting}>
            <Text style={styles.buttonText}>Xóa khóa học</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  thumbnail: { width: '100%', height: 220, resizeMode: 'cover' },
  content: { padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8, color: '#222' },
  instructor: { fontSize: 15, color: '#555', marginBottom: 6 },
  price: { fontSize: 16, color: '#007AFF', fontWeight: '600', marginBottom: 6 },
  duration: { fontSize: 14, color: '#666', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 12, marginBottom: 4 },
  description: { fontSize: 14, color: '#444', lineHeight: 20, marginBottom: 20 },
  trailerButton: { backgroundColor: '#34C759', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  trailerButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  actionContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginTop: 10 },
  editButton: { flex: 1, backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center' },
  deleteButton: { flex: 1, backgroundColor: '#FF3B30', padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});
