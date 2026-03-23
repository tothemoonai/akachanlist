import { LanguageProvider } from './contexts/LanguageContext';
import { UserListProvider } from './contexts/UserListContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Home } from './pages/Home';
import './styles/index.css';

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <UserListProvider>
          <Home />
        </UserListProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
