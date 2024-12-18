import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/mainpage.css';
import '../styles/reset.css';
import axios from 'axios';
import Header from './Header';

const Main = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true); // Для отображения загрузки
  const [error, setError] = useState(null); // Для отображения ошибок
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/main');
        console.log(response.data)
        setVideos(response.data);
      } catch (error) {
        console.error('Ошибка при загрузке видео:', error);
        setError('Не удалось загрузить видео. Попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) {
    return (
      <div className="main">
        <Header />
        <div className="main__content">
          <h1 className="main__title">Загрузка...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main">
        <Header />
        <div className="main__content">
          <h1 className="main__title">Ошибка</h1>
          <p className="main__error-message">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main">
      <Header />
      <div className="main__content">
        <h1 className="main__title">Рекомендации</h1>
        <div className="main__videos-row">
          {videos.length > 0 ? (
            videos.map((video) => (
              <div
                key={video.id}
                className="video-card"
                onClick={() => navigate(`/video/${video.url}`)}
              >
                <img
                  src={`http://localhost:5000/getthumbnail/${video.thumbnail}`}
                  alt={video.title}
                  className="video-card__thumbnail"
                />
                <div className="video-card__info">
                  <h3 className="video-card__title">{video.title}</h3>
                  <p className="video-card__author">Автор: {video.author || 'Неизвестен'}</p>
                  <p className="video-card__views">Просмотров: {video.views || 0}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="main__no-videos">Видео пока нет</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Main;
