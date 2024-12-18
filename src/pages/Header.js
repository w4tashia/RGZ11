import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo from '../pic/logo.svg';
import exit from '../pic/Exit.svg';
import usercircle from '../pic/UserCircle.svg';

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.name) setUserName(user.name);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName('');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Скрываем элементы на страницах логина и регистрации
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <header className="header">
      <div className="wrapper">
        <div className="header__wrapper">
          <div className="header__logo">
            <img 
              onClick={() => navigate("/main")} 
              src={logo} 
              alt="Логотип" 
              className="header__logo-pic" 
            />
          </div>
          {!isAuthPage && ( // Отображаем только если не на страницах логина/регистрации
            <div className="header__user-info">
              {isLoggedIn ? (
                <>
                  <span className="header__username">{userName}</span>
                  <section className="header__exit-button" onClick={handleLogout}>
                    <img src={exit} alt="Выход" className="header__pic" />
                  </section>
                </>
              ) : null}
              <div className="header__icons">
                <Link to="/profile" className="header__icon">
                  <img src={usercircle} alt="Профиль" className="header__pic" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
