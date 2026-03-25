import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from './contexts/LanguageContext';
import { UserListProvider } from './contexts/UserListContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import Reviews from './pages/Reviews';
import Login from './pages/Login';
import SharedList from './pages/SharedList';
import { ReviewDetail } from './components/reviews/ReviewDetail';
import { ReviewAdmin } from './components/reviews/ReviewAdmin';
import { ReviewEditor } from './components/reviews/ReviewEditor';
import './styles/index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <UserListProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/reviews" element={<Reviews />} />
                <Route path="/reviews/:slug" element={<ReviewDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/share/:token" element={<SharedList />} />
                <Route
                  path="/reviews/admin"
                  element={
                    <ProtectedRoute>
                      <ReviewAdmin />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reviews/admin/new"
                  element={
                    <ProtectedRoute>
                      <ReviewEditor />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reviews/admin/:id/edit"
                  element={
                    <ProtectedRoute>
                      <ReviewEditor />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </BrowserRouter>
          </UserListProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
