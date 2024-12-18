import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';
import trashcan from '../pic/trash-can.png';
import '../styles/style.css';
import '../styles/reset.css';
import defaultbg from '../pic/bg2.png'

const API_URL = 'http://localhost:5000';

const Account = () => {
    const [userData, setUserData] = useState({ username: '', email: '', id: '' });
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Вы не авторизованы!');
                navigate('/login');
                return;
            }

            const [userResponse, videosResponse] = await Promise.all([
                axios.get(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/user_videos`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            setUserData(userResponse.data.user);

            const videos = videosResponse.data.videos.map(video => ({
                ...video,
                thumbnail: video.thumbnail || defaultbg, // Дефолтное изображение
            }));

            setVideos(videos);
        } catch (error) {
            handleAxiosError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAxiosError = (error) => {
        if (axios.isAxiosError(error)) {
            if (error.response) {
                if (error.response.status === 401) {
                    alert("Время авторизации вышло, зайдите ещё раз");
                    localStorage.removeItem("token");
                    navigate("/login");
                } else {
                    alert(`Ошибка: ${error.response.status} - ${error.response.data}`);
                }
            } else if (error.request) {
                alert("Ошибка: сервер не отвечает. Попробуйте позже.");
            } else {
                alert(`Ошибка: ${error.message}`);
            }
        } else {
            console.error("Неизвестная ошибка:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpload = async (e) => {
        e.preventDefault();
    
        if (!file || !title || !description) {
            setUploadStatus('Заполните все поля.');
            return;
        }
    
        const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
        if (!allowedTypes.includes(file.type)) {
            setUploadStatus('Неверный формат файла. Загрузите видео.');
            return;
        }
    
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        formData.append('description', description);
    
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setUploadStatus('Необходима авторизация.');
                return;
            }
    
            const response = await axios.post(`${API_URL}/upload_videos`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
    
            console.log('Ответ сервера:', response.data); // Лог для проверки
            const uploadedVideo = response.data.video;
    
            if (uploadedVideo && uploadedVideo.id) {
                setVideos((prev) => [
                    ...prev,
                    {
                        id: uploadedVideo.id,
                        title: uploadedVideo.title,
                        thumbnail: uploadedVideo.thumbnail
                            ? `${API_URL}/getthumbnail/${uploadedVideo.thumbnail}`
                            : defaultbg,
                        author: uploadedVideo.author || 'Неизвестен',
                        views: uploadedVideo.views || 0,
                        url: uploadedVideo.url,
                    },
                ]);
                setUploadStatus('Видео успешно загружено!');
            } else {
                setUploadStatus('Ошибка: сервер не вернул данные о видео.');
                console.error('Пустой или некорректный ответ сервера:', response.data);
            }
        } catch (error) {
            setUploadStatus('Ошибка загрузки.');
            console.error('Ошибка загрузки видео:', error);
        }
    };
    
    
    const handleDeleteVideo = async (videoId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Вы не авторизованы!');
                navigate('/login');
                return;
            }

            const response = await axios.delete(`${API_URL}/delete_videos/${videoId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 200) {
                alert('Видео успешно удалено.');
                setVideos((prevVideos) => prevVideos.filter((video) => video.id !== videoId));
            } else {
                alert(`Ошибка: ${response.status}`);
            }
        } catch (error) {
            handleAxiosError(error);
        }
    };

    return (
        <div className="all">
            <Header />
            <main>
                <section className="user-profile">
                    <div className="user_wrapper">
                        <h1>{loading ? 'Loading...' : userData.username}</h1>
                        <h1>{loading ? 'Loading...' : userData.email}</h1>
                    </div>
                </section>
                <section className="user-videos">
                    <h2>Ваши видео</h2>
                    {loading ? (
                        <p>Загрузка...</p>
                    ) : (
                        <div className="main__videos-row">
                          {videos && videos.length > 0 ? (
                            console.log(videos), // Check the structure of your video objects
                            videos.map(video => (
                                console.log(video),
                              <div
                                key={video.id}
                                className="video-card"
                                onClick={() => navigate(`/video/${video.url}`)}
                              >
                                <img
                                  src={video.thumbnail ? `${API_URL}/getthumbnail/${video.thumbnail}` : 'path/to/default-thumbnail.jpg'}
                                  alt={video.title}
                                  className="video-card__thumbnail"
                                />
                                <div className="video-card__delete-button-wrapper">
                                  <button
                                    className="video-card__delete-button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteVideo(video.id);
                                    }}
                                  >
                                    <img 
                                      src={trashcan}
                                      alt="Удалить видео" 
                                      className="video-card__delete-icon" 
                                    />
                                  </button>
                                </div>
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
                    )}
                </section>
            </main>
            <div className="upload-section">
                <h1>Загрузить Видео</h1>
                <form onSubmit={handleUpload} className="upload-form">
                    <div className="upload-form__group">
                        <label htmlFor="title">Название:</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div className="upload-form__group">
                        <label htmlFor="description">Описание:</label>
                        <input
                            type="text"
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>
                    <div className="upload-form__group">
                        <label htmlFor="file">Файл видео:</label>
                        <input
                            type="file"
                            id="file"
                            accept="video/*"
                            onChange={(e) => setFile(e.target.files[0])}
                            required
                        />
                    </div>
                    <button type="submit" className="upload-form__button">Загрузить</button>
                </form>
                {uploadStatus && <p>{uploadStatus}</p>}
            </div>
        </div>
    );
};

export default Account;
