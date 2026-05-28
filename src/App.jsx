import { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import DersTablosu from './components/DersTablosu';
import DersModal from './components/DersModal';
import Transkript from './components/Transkript';
import VeriYonetimi from './components/VeriYonetimi';
import Alert from './components/Alert';
import { loadData, saveData } from './utils/storage';

export default function App() {
  const [currentPage, setPage] = useState('results');
  const [courses, setCourses] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const data = loadData();
    if (data && data.courses) {
      setCourses(data.courses);
    }
  }, []);

  useEffect(() => {
    saveData({ courses });
  }, [courses]);

  const handleSaveCourse = useCallback((course) => {
    setCourses((prev) => {
      const exists = prev.find((c) => c.id === course.id);
      if (exists) {
        return prev.map((c) => (c.id === course.id ? course : c));
      }
      return [...prev, course];
    });
  }, []);

  const handleDeleteCourse = useCallback((id) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const openAdd = () => {
    setEditingCourse(null);
    setModalOpen(true);
  };

  const openEdit = (course) => {
    setEditingCourse(course);
    setModalOpen(true);
  };

  const handleImport = useCallback((data, error) => {
    if (error) {
      setNotification({ message: error, type: 'error' });
      return;
    }
    if (confirm('Bu işlem mevcut tüm derslerinizin üzerine yazacak. Devam etmek istiyor musunuz?')) {
      setCourses(data.courses || []);
      setNotification({ message: 'Veriler başarıyla yüklendi!', type: 'success' });
    }
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'results':
        return <DersTablosu courses={courses} onEdit={openEdit} onAdd={openAdd} />;
      case 'transcript':
        return <Transkript courses={courses} />;
      case 'settings':
        return <VeriYonetimi courses={courses} onImport={handleImport} />;
      default:
        return <DersTablosu courses={courses} onEdit={openEdit} onAdd={openAdd} />;
    }
  };

  return (
    <Layout currentPage={currentPage} setPage={setPage}>
      {renderPage()}
      <DersModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveCourse}
        onDelete={handleDeleteCourse}
        editingCourse={editingCourse}
      />
      {notification && (
        <Alert
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </Layout>
  );
}
