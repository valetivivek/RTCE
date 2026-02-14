
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DocumentListPage from './pages/DocumentListPage';
import EditorPage from './pages/EditorPage';

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route element={<Layout />}>
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <DocumentListPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/documents/:id"
                            element={
                                <ProtectedRoute>
                                    <EditorPage />
                                </ProtectedRoute>
                            }
                        />
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
