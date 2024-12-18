from flask import Flask, jsonify, request, send_file
from moviepy import VideoFileClip
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from models import db, User, Video, Comment
import datetime
import os


app = Flask(__name__)
CORS(app)

base_dir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(base_dir, 'instance/sosotube.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = '8736f9a876wghf87ahdfuha8s7dhfa8ow73gf98a7sghefoiuahsdgf78a3wg9rf7agw'


jwt = JWTManager(app)

db.init_app(app)

UPLOAD_FOLDER = "backend/static/videos"
THUMBNAIL_FOLDER = "backend/static/thumbnails"


def create_thumbnail(video_path, thumbnail_path, timestamp=5):
    try:
        print(f"Создание миниатюры для: {video_path}")
        if not os.path.isfile(video_path):
            raise FileNotFoundError(f"Файл не найден: {video_path}")

        clip = VideoFileClip(video_path)
        clip.save_frame(thumbnail_path, t=timestamp)
        clip.close()
        print(f"Миниатюра успешно создана: {thumbnail_path}")
    except Exception as e:
        print(f"Ошибка при создании миниатюры: {e}")


@app.route('/getvideos/<string:filename>', methods=['GET'])
def getvideos(filename):
    return send_file(f'static/videos/{filename}')

@app.route('/getthumbnail/<string:filename>', methods=['GET'])
def getthumbnails(filename):
    if(filename == "None"):
        return send_file('../src/pic/bg2.png')
    return send_file(f'static/thumbnails/{filename}')

@app.route('/main', methods=['GET'])
def get_all_videos():
    try: 
        videos = Video.query.all()  # Загружаем все видео из базы данных
        video_list = []

        for video in videos:
            thumbnail_path = os.path.join(
                THUMBNAIL_FOLDER, f"{os.path.splitext(video.url)[0]}.jpg"
            )
            video_list.append({
                "id": video.id,
                "title": video.title,
                "url": f"{video.url}",
                "thumbnail": f"{video.thumbnail}" if video.thumbnail else None,
                "author": video.author.name if video.author else "Неизвестен",
                "description": video.description,
                "views": 100 + len(video.url) * 10
            })

        return jsonify(video_list), 200
    except Exception as e:
        print(f"Ошибка в /main: {e}")
        return jsonify({"error": "Не удалось получить список видео"}), 500



@app.route('/getvideo/<string:filename>', methods=['GET'])
def get_video_info(filename):
    try:
        video = Video.query.filter_by(url=filename).first()
        if not video:
            return jsonify({"error": "Видео не найдено"}), 404

        video_path = os.path.join(UPLOAD_FOLDER, video.url)
        if not os.path.exists(video_path):
            return jsonify({"error": "Файл видео не найден"}), 404

        thumbnail_path = os.path.join(THUMBNAIL_FOLDER, f"{os.path.splitext(video.url)[0]}.jpg")
        video_info = {
            "id": video.id,
            "title": video.title,
            "url": f"{video.url}",
            "thumbnail": f"{os.path.splitext(video.url)[0]}.jpg" if os.path.exists(thumbnail_path) else None,
            "author": video.author.name if video.author else "Неизвестен",
            "description": video.description,
            "views": 100 + len(video.url) * 10,
            "created_at": video.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }
        return jsonify(video_info), 200
    except Exception as e:
        print(f"Ошибка при получении информации о видео: {e}")
        return jsonify({"error": "Не удалось получить информацию о видео"}), 500

@app.route("/login", methods=['POST'])
def login_user():
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')

        user = User.query.filter_by(email=email).first()

        if not user or user.password != password:
            return jsonify({"error": "Invalid email or password"}), 401

        access_token = create_access_token(identity=str(user.id), additional_claims={ "email": user.email, "username": user.name})
        print(f"Generated JWT for user {user.id}: {access_token}")


        return jsonify({"access_token": access_token}), 200

    except Exception as e:
        print(f"Error during login: {e}")
        return jsonify({"error": "An error occurred during login"}), 500


@app.route("/register", methods=['POST'])
def register_user():
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({"error": "User with this email already exists"}), 409

        new_user = User(name=email.split("@")[0], email=email, password=password)
        db.session.add(new_user)
        db.session.commit()

        return jsonify({"msg": "Registration successful"}), 201

    except Exception as e:
        print(f"Error during registration: {e}")
        return jsonify({"error": "An error occurred during registration"}), 500
    
@app.route("/user", methods=['GET'])
@jwt_required()
def show_user():
    userid = get_jwt_identity()
    user = User.query.filter_by(id=userid).first()
    videos = Video.query.filter_by(user_id=userid).all()
    if(videos):
        return jsonify({"videos": [{
            "title": video.title,
            "url": video.url,
            "id": video.id,
            "thumbnail": video.thumbnail,
            "author": video.author.name if video.author else "Неизвестен",
            "views": 100 + len(video.url) * 10,
            } for video in videos],
            "user": {"id": user.id ,"username": user.name ,"email": user.email}})
    else:
        return jsonify({"msg": "videos are empty"}), 1000-7

    
@app.route("/upload_videos", methods=["POST"])
@jwt_required()
def upload_video():
    try:
        userid=get_jwt_identity()
        print("Received request for video upload")
        if 'file' not in request.files:
            print("No file part in the request")
            return jsonify({"error": "No file part in the request"}), 400

        file = request.files['file']
        print(file.content_type)
        if file.filename == '':
            print("No file selected")
            return jsonify({"error": "No selected file"}), 400

        title = request.form.get('title')
        description = request.form.get('description')
        created_at = datetime.datetime.now()

        if not title:
            print("Title is missing")
            return jsonify({"error": "Title is required"}), 400
        
        if not description:
            print("Description is missing")
            return jsonify({"error": "Description is required"}), 400

        # Save the file to the server
        videos_dir = "backend/static/videos"
        file_path = os.path.join(videos_dir, file.filename)
        print(f"Saving file to {file_path}")
        file.save(file_path)

        create_thumbnail(video_path=file_path, thumbnail_path=f"backend/static/thumbnails/{file.filename[:-3]}png")

        # Save video metadata in the database
        new_video = Video(title=title, created_at=created_at, url=file.filename, user_id=userid, description = description, thumbnail = f"{file.filename[:-4]}.png")
        db.session.add(new_video)
        db.session.commit()

        print("Video metadata saved successfully")
        return jsonify({"msg": "Video upload successful"}), 201

    except Exception as e:
        print(f"Error during video upload: {e}")
        return jsonify({"error": "An error occurred during video upload"}), 500

@app.route("/delete_videos/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_video(id):
    try:
        video_id = id
        if not video_id:
            return jsonify({"error": "ID видео не указан"}), 400

        current_user = get_jwt_identity()

        video = Video.query.filter_by(id=video_id, user_id=current_user).first()
        if not video:
            return jsonify({"error": "Видео не найдено или доступ запрещен"}), 404

        db.session.delete(video)
        db.session.commit()

        return jsonify({"message": "Видео успешно удалено"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/add_comment", methods=["POST"])
@jwt_required()
def add_comment():
    try:
        # Get the current user ID from JWT
        user_id = get_jwt_identity()

        # Parse the request data
        data = request.json
        video_id = data.get('video_id')
        content = data.get('content')

        # Validate the input
        if not video_id:
            return jsonify({"error": "Video ID is required"}), 400
        if not content:
            return jsonify({"error": "Comment content is required"}), 400

        # Verify the video exists
        video = Video.query.filter_by(id=video_id).first()
        if not video:
            return jsonify({"error": "Video not found"}), 404

        # Create a new comment
        new_comment = Comment(content=content, user_id=user_id, video_id=video_id)
        db.session.add(new_comment)
        db.session.commit()

        return jsonify({"message": "Comment added successfully"}), 201

    except Exception as e:
        print(f"Error adding comment: {e}")
        return jsonify({"error": "An error occurred while adding the comment"}), 500


@app.route("/get_comments/<int:video_id>", methods=["GET"])
def get_comments(video_id):
    try:
        # Fetch comments for the specified video
        comments = Comment.query.filter_by(video_id=video_id).order_by(Comment.created_at.desc()).all()

        # Serialize the comments
        comments_list = [{
            "id": comment.id,
            "content": comment.content,
            "created_at": comment.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            "user_id": comment.user_id,
            "video_id": comment.video_id,
            "username" : User.query.filter_by(id=comment.user_id).first().name
        } for comment in comments
        ]

        return jsonify({"comments": comments_list}), 200
    except Exception as e:
        print(f"Error fetching comments: {e}")
        return jsonify({"error": "An error occurred while fetching comments"}), 500


if __name__ == "__main__":
    app.run(debug=True)
