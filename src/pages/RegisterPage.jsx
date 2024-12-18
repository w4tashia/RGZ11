// RegisterPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/login.css';
import axios from 'axios';
import Header from './Header';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
  
    if (password !== confirmPassword) {
      return alert('Пароли не совпадают!');
    }
  
    try {
      const response = await axios.post(
        'http://localhost:5000/register',
        { email, password },
        { headers: { 'Content-Type': 'application/json' } }
      );
  
      if (response.status === 201) {
        alert('Регистрация успешна!');
        navigate('/login');
      } else {
        alert('Ошибка регистрации: ' + response.data.message);
      }
    } catch (error) {
      if (error.response) {
        // Сервер вернул ошибку
        alert('Ошибка регистрации: ' + error.response.data.error);
      } else {
        // Ошибка сети или другая проблема
        alert('Ошибка соединения: ' + error.message);
      }
    }
  };
  

  return (
    <div className="auth-page">
      <Header />
      <div className="tabs-container">
        <div className='wrapper__tabs'>
          <div>
            <a href="/login" className="tab">Вход</a>
            <div></div>
          </div>
        </div>
        <div className='wrapper__tabs'>
          <div>
            <a href="/register" className="tab">Регистрация</a>
            <div className='under'></div>
          </div>
        </div>
      </div>
      
      {/* Основной контейнер */}
      <div className="auth-container">
        <div className="header-container">
          <h3>Данные для регистрации</h3>
        </div>
        <form onSubmit={handleRegister}>
          <div className="input-container">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Подтвердите пароль"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Зарегистрироваться</button>
        </form>
        <p>
          Уже есть аккаунт? <a href="/login">Войдите</a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
