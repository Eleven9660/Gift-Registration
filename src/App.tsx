import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CreateDeclaration from './pages/CreateDeclaration';
import DeclarationList from './pages/DeclarationList';
import AdminReview from './pages/AdminReview';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/declare" element={<CreateDeclaration />} />
          <Route path="/history" element={<DeclarationList />} />
          <Route path="/admin" element={<AdminReview />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
