
const audio = document.querySelector('audio');
const playButton = document.querySelector('.play-button');
const turntable = document.querySelector('.turntable');
const albumCover = document.querySelector('.album-cover');
const songTitle = document.querySelector('.song-title');
const nextButton = document.querySelector('.next-button');
const prevButton = document.querySelector('.prev-button');
const currentTimeDisplay = document.querySelector('.current-time');
const durationDisplay = document.querySelector('.duration');
const progress = document.querySelector('.progress-bar');
const volumeBar = document.querySelector('.volume-bar');
const fileInput = document.querySelector('.file-input');
const playlist = document.querySelector('.playlist');



const songs = [
    {
        title: 'Oasis - Wonderwall',
        cover: 'assets/img/oasis-wonderwall-cover.jpg',
        audio: 'assets/audio/oasis-wonderwall.mp3'
    }
];


let currentSongIndex = 0;

function loadSong(index) {
    const song = songs[index];
    audio.src = song.audio;
    albumCover.src = song.cover;
    songTitle.textContent = song.title;
    renderPlaylist();
}

loadSong(currentSongIndex);

function playSong() {
    audio.play();
    playButton.textContent = 'Pause';
    turntable.classList.add('playing');
}

function pauseSong() {
    audio.pause();
    playButton.textContent = 'Play';
    turntable.classList.remove('playing');
}

function nextSong() {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    loadSong(currentSongIndex);
    playSong();
}

function prevSong() {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    loadSong(currentSongIndex);
    playSong();
}

playButton.addEventListener('click', function () {
    if (audio.paused) {
        playSong();
    } else {
        pauseSong();
    }
});

nextButton.addEventListener('click', nextSong);
prevButton.addEventListener('click', prevSong);
audio.addEventListener('ended', nextSong);

audio.addEventListener('timeupdate', function () {
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;

    progress.value = (audio.currentTime / audio.duration) * 100;
    currentTimeDisplay.textContent = formatTime(audio.currentTime);
});

progress.addEventListener('input', function () {
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;

    audio.currentTime = (progress.value / 100) * audio.duration;
});

audio.addEventListener('volumechange', function () {
    volumeBar.value = audio.volume * 100;
});

volumeBar.addEventListener('input', function () {
    audio.volume = volumeBar.value / 100;
});


function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins + ':' + String(secs).padStart(2, '0');
}

audio.addEventListener('loadedmetadata', function () {
    durationDisplay.textContent = formatTime(audio.duration);
});


fileInput.addEventListener('change', function (event) {
    if (event.target.files.length === 0) return;

    const firstNewIndex = songs.length;

    for (const file of event.target.files) {
        const url = URL.createObjectURL(file);
        const title = file.name.replace('.mp3', '');
        const cover = 'assets/img/default-cover.jpg';

        songs.push({ title, cover, audio: url });
    }

    currentSongIndex = firstNewIndex;
    loadSong(currentSongIndex);
    playSong();
    fileInput.value = '';
});


function renderPlaylist() {
    playlist.innerHTML = '';

    songs.forEach(function (song, index) {
        const item = document.createElement('li');
        item.textContent = song.title;

        if (index === currentSongIndex) {
            item.classList.add('active');
        }

        item.addEventListener('click', function () {
            currentSongIndex = index;
            loadSong(index);
            playSong();
        });

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'X';
        deleteButton.classList.add('remove-button');
        deleteButton.addEventListener('click', function (event) {
            event.stopPropagation();
            deleteSong(index);
        });

        item.appendChild(deleteButton);
        playlist.appendChild(item);
    });
}


function deleteSong(index) {
    if (index < 0 || index >= songs.length) return;

    songs.splice(index, 1);

    if (songs.length === 0) {
        pauseSong();
        audio.removeAttribute('src');
        audio.load();
        currentSongIndex = 0;
        albumCover.src = 'assets/img/default-cover.jpg';
        songTitle.textContent = 'No Song Playing';
        currentTimeDisplay.textContent = '0:00';
        durationDisplay.textContent = '0:00';
        progress.value = 0;
        renderPlaylist();
        return;
    }

    if (currentSongIndex === index) {
        currentSongIndex = 0;
        loadSong(currentSongIndex);
        pauseSong();
    } else if (currentSongIndex > index) {
        currentSongIndex--;
    }

    renderPlaylist();
}