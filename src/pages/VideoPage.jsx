import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/videopage.css';
import Header from './Header';
import sendy from '../pic/sendy.png';

const VideoPage = () => {
  const { filename } = useParams(); // Получаем имя файла из параметров маршрута
  const [video, setVideo] = useState(null); // Состояние для видео
  const [comments, setComments] = useState([]); // Состояние для комментариев
  const [newComment, setNewComment] = useState(''); // Состояние для нового комментария
  const [error, setError] = useState(''); // Состояние для ошибок

  // Fetch video details
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/getvideo/${filename}`);
        if (response.data && response.data.url) {
          setVideo({ ...response.data, fullUrl: `http://localhost:5000${response.data.url}` });
        } else {
          throw new Error('Invalid video data.');
        }
      } catch (err) {
        console.error('Ошибка загрузки видео:', err);
        setError('Не удалось загрузить видео. Проверьте сервер или путь к файлу.');
      }
    };

    fetchVideo();
  }, [filename]);

  // Fetch comments for the video
  useEffect(() => {
    const fetchComments = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        alert('Вы не авторизованы.');
        return;
      }
      try {
        const response = await axios.get(`http://localhost:5000/get_comments/${video.id}`, {headers: {Authorization: `Bearer ${token}`}});
        setComments(response.data.comments);
      } catch (err) {
        console.error('Ошибка загрузки комментариев:', err);
        setError('Не удалось загрузить комментарии.');
      }
    };

    if (video) {
      fetchComments();
    }
  }, [video]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    const token = localStorage.getItem('token');

    if (!token) {
      alert('Вы не авторизованы.');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/add_comment',
        { video_id: video.id, content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update the comments list with the new comment
      setComments((prev) => [
        ...prev,
        { content: newComment, created_at: new Date().toISOString(), user_id: 'Вы' },
      ]);
      setNewComment('');
    } catch (err) {
      console.error('Ошибка добавления комментария:', err);
      setError('Не удалось добавить комментарий.');
    }
  };

  return (
    <div className="video-page">
      <Header />
      <div className="video-player-section">
        <video
          controls
          className="video-player"
          src={`http://localhost:5000/getvideos/${filename}`} // Используем полный URL
          onError={() => setError('Не удалось загрузить видео.')} // Обработка ошибки загрузки видео
        ></video>
      </div>
      <div className="chat-section">
        <div className="comments-list">
          {comments.length > 0 ? (
            comments.map((comment, index) => (
              <div key={index} className="comment">
                <p className='nickname'>
                  {comment.username}
                </p>
                <p className='comment_text'>
                  {comment.content}
                </p>
                <span className="comment-date">
                  {new Date(comment.created_at).toLocaleString()}
                </span>
              </div>
            ))
          ) : (
            <p>Пока нет комментариев</p>
          )}
        </div>
        <div className="comment-form">
          <div className="input-container_video">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="  Добавить комментарий..."
              className="writecomment"
            />
            <button onClick={handleAddComment} className="comment-button">
              <img
                src={sendy} // Путь к вашей картинке кнопки
                alt="Отправить"
                className="send-icon"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPage;
