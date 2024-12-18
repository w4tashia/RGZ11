import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/style.css';
import '../styles/reset.css';
import axios from 'axios';
import Header from './Header';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const emailRef = useRef(null); // ссылка на email поле
  const passwordRef = useRef(null); // ссылка на пароль поле
  const navigate = useNavigate();


  const handleLogin = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/login', {
        email,
        password,
      });
      // Проверяем статус и данные
      if (response.status === 200) {
        const access_token = response.data["access_token"];
        console.log(response.data["access_token"], typeof response.data["access_token"]);
        localStorage.setItem('token', access_token);
        alert('Login successful');
        navigate('/main');
      }
    } catch (error) {
      console.error(error);
      if (error.response) {
        alert('Login failed: ' + error.response.data.error);
      } else {
        alert('An unexpected error occurred.');
      }
    }
  };

  // Обработчик отправки формы
  const handleSubmit = async (event) => {
    event.preventDefault();
    await handleLogin(email, password);
  };

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  return (
    <div className="auth-page">
      <Header />
      <div className="tabs-container">
        <div className="wrapper__tabs">
          <div>
            <a onClick={() => navigate("/login")} className="tab">Вход</a>
            <div className="under"></div>
          </div>
        </div>
        <div className="wrapper__tabs">
          <div>
            <a onClick={() => navigate("/register")} className="tab">Регистрация</a>
            <div></div>
          </div>
        </div>
      </div>

      {/* Основной контейнер */}
      <div className="auth-container">
        <div className="header-container">
          <h3>Данные для авторизации</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="input-container">
            <input
              ref={emailRef} // привязываем ref к email полю
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              ref={passwordRef} // привязываем ref к password полю
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Войти</button>
        </form>
        <p>
          Нет аккаунта? <a href="/register">Зарегистрируйтесь</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
