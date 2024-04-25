# Software City's Custom Video Streaming Service

> Developed by [Davis_Software](https://github.com/Davis-Software) &copy; 2023

![GitHub issues](https://img.shields.io/github/issues-raw/Davis-Software/swc_flexnit?style=for-the-badge)
![GitHub closed issues](https://img.shields.io/github/issues-closed/Davis-Software/swc_flexnit?style=for-the-badge)
![GitHub](https://img.shields.io/github/license/Davis-Software/swc_flexnit?style=for-the-badge)

> Access to the official website itself is only permitted to swc members

### Development
> If you are on Windows you need to run the following commands before installing the requirements:
> `pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121`
```shell
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd static/js/front
npm i
npm run build
cd ../../..
python3 main.py
```

You will probably also have to re-write some of the login stuff, as it's currently only working with the swc website.
Most of the stuff is self-explanatory, but if you have any questions, feel free to ask me!
The corresponding code is located in `utils/password_manager.py`

### config.ini

###### Default:
```
# app config
SECRET_KEY=<flask session secret key>

# webserver config
HOST=0.0.0.0
PORT=80
DEBUG=true

# database config
DB_TYPE=sqlite
DB_NAME=static/db/db.sqlite
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=very-secure-password

# file storage config
VIDEO_DIR=E:\SWC\flexnit
FFMPEG_PATH=D:\Programme\ffmpeg\bin\ffmpeg.exe
FFPROBE_PATH=D:\Programme\ffmpeg\bin\ffprobe.exe

# ffmpeg config
FFMPEG_NVENC=true
FFMPEG_ACCELERATOR=nvdec
FFMPEG_NVENC_PRESET=fast

# aivd config
# custom binary to find audio offset in video files
# the binary is linux only, so you need to use WSL on windows
# more info: https://github.com/Davis-Software/aivd
AIVD_PATH=/mnt/d/linux_files/audio_offset_finder/dist/aivd
USE_WSL=true
WSL_DISTRO=Ubuntu
```

###### Explanation:
| Parameter           | Description                                         |
|---------------------|-----------------------------------------------------|
| SECRET_KEY          | Flask session secret key                            |
| HOST                | Host to listen on                                   |
| PORT                | Port to listen on                                   |
| DEBUG               | Enable debug mode                                   |
| DB_TYPE             | Database type (sqlite / mysql)                      |
| ..db config         | All the rest should be self-explanatory             |
| VIDEO_DIR           | Folder where all video files will be stored         |
| FFMPEG_PATH         | Path to the ffmpeg installation                     |
| FFPROBE_PATH        | Path to the ffprobe installation                    |
| FFMPEG_NVENC        | Use the NVENC encoder to speed up video transcoding |
| FFMPEG_ACCELERATOR  | ffmpeg accelerator setting                          |
| FFMPEG_NVENC_PRESET | hardware encoder quality preset                     |
| AIVD_PATH           | path to the audio-in-video-detector binary          |
| USE_WSL             | use wsl for aivd as it's linux-only                 |
| WSL_DISTRO          | wsl distro to use                                   |