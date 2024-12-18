// File: UserProfile.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './Header';
import trashcan from '../pic/trash-can.png';
import '../styles/style.css';
import '../styles/reset.css';

const UserProfile = () => {
  const [videos, setVideos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  const handleAxiosError = (error) => {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        if (error.response.status === 401) {
          toast.error("Время авторизации вышло, зайдите ещё раз");
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          toast.error(`Ошибка: ${error.response.status} - ${error.response.data}`);
        }
      } else if (error.request) {
        toast.error("Ошибка: сервер не отвечает. Попробуйте позже.");
      } else {
        toast.error(`Ошибка: ${error.message}`);
      }
    } else {
      console.error("Неизвестная ошибка:", error);
    }
  };

  const fetchVideos = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.warning('Вы не авторизованы!');
        navigate('/login');
        return;
      }
      const response = await axios.get('http://localhost:5000/user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVideos(response.data.videos);
    } catch (error) {
      handleAxiosError(error);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title || !description) {
      toast.warning('Заполните все поля!');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', description);

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.warning('Вы не авторизованы!');
        navigate('/login');
        return;
      }
      await axios.post('http://localhost:5000/upload_videos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success('Видео успешно загружено!');
      fetchVideos();
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setUploading(false);
      setTitle('');
      setDescription('');
      setFile(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить это видео?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.warning('Вы не авторизованы!');
        navigate('/login');
        return;
      }
      await axios.delete(`http://localhost:5000/delete_videos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Видео успешно удалено!');
      fetchVideos();
    } catch (error) {
      handleAxiosError(error);
    }
  };

  return (
    <div className="user-profile all">
      <Header />
      <ToastContainer />
      <div className="upload-form">
        <h2>Загрузить новое видео</h2>
        <form onSubmit={handleUpload}>
          <input
            type = "text"
            placeholder="Название видео"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="form-control"
          />
          <input
            type = "text"
            placeholder="Описание видео"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-control"
          />
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="form-control-file"
          />
          <button type="submit" disabled={uploading} className="btn-upload">
            {uploading ? 'Загрузка...' : 'Загрузить видео'}
          </button>
        </form>
      </div>

      <div className="video-list">
        <h3>
        <center>Ваши видео</center>
        </h3> 
        {videos.length > 0 ? (
          <div className="videos-container">
            {videos.map((video) => (
              <div
                className="video-cards"
                key={video.id}
                onClick={() => navigate(`/video/${video.url}`)}
              >
                <img
                  src={`http://localhost:5000/getthumbnail/${video.thumbnail}`}
                  alt="Видео"
                  className="video-thumbnail"
                />
                <h3>{video.title}</h3>
                <p>{video.description}</p>
                <div className="video-card__delete-button-wrapper">
                  <button
                    className="video-card__delete-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(video.id);
                    }}
                  >
                    <img src={trashcan} alt="Удалить" className="video-card__delete-icon" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>Пока что вы не загрузили ни одного видео.</p>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
