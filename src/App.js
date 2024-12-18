import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Main from './pages/main';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Account from './pages/ProfilePage';
import VideoPage from './pages/VideoPage';
import UserProfile from './pages/profile';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/main" element={<Main />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/video/:filename" element={<VideoPage />} />
      </Routes>
    </Router>
  );
}

export default App;
