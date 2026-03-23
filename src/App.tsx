import { LanguageProvider } from './contexts/LanguageContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Home } from './pages/Home';
import './styles/index.css';

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <Home />
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
