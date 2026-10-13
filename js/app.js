
const audio = document.querySelector('audio');
const playButton = document.querySelector('.play-button');
const turntable = document.querySelector('.turntable');
const albumCover = document.querySelector('.album-cover');
const songTitle = document.querySelector('.song-title');
const nextButton = document.querySelector('.next-button');
const prevButton = document.querySelector('.prev-button');
const audioSource = document.querySelector('audio');

const songs = [
    {
        title: 'Oasis - Wonderwall',
        cover: 'assets/img/oasis-wonderwall-cover.jpg',
        audio: 'assets/audio/oasis-wonderwall.mp3'
    },
    {
        title: 'Song 2',
        cover: 'assets/img/oasis-wonderwall-cover.jpg',
        audio: 'assets/audio/oasis-wonderwall.mp3'
    }
];

let currentSongIndex = 0;

function loadSong(index) {
    const song = songs[index];
    audioSource.src = song.audio;
    albumCover.src = song.cover;
    songTitle.textContent = song.title;
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

const progress = document.querySelector('.progress-bar');

audio.addEventListener('timeupdate', function () {
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;

    progress.value = (audio.currentTime / audio.duration) * 100;
});

progress.addEventListener('input', function () {
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;

    audio.currentTime = (progress.value / 100) * audio.duration;
});

const volumeBar = document.querySelector('.volume-bar');

audio.addEventListener('volumechange', function () {
    volumeBar.value = audio.volume * 100;
});

volumeBar.addEventListener('input', function () {
    audio.volume = volumeBar.value / 100;
});
