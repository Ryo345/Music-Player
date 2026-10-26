const audio = document.querySelector('audio');
const playButton = document.querySelector('.play-button');
const turntable = document.querySelector('.turntable');
const platter = document.querySelector('.platter');
const albumCover = document.querySelector('.album-cover');
const songTitle = document.querySelector('.song-title');
const songArtist = document.querySelector('.song-artist');
const nextButton = document.querySelector('.next-button');
const prevButton = document.querySelector('.prev-button');
const currentTimeDisplay = document.querySelector('.current-time');
const durationDisplay = document.querySelector('.duration');
const progress = document.querySelector('.progress-bar');
const volumeBar = document.querySelector('.volume-bar');
const crate = document.querySelector('.crate');
const crateCount = document.querySelector('.crate-count');
const recordLabel = document.querySelector('.record-label');
const deckHint = document.querySelector('.deck-hint');
const dropVeil = document.querySelector('.drop-veil');
const noticeEl = document.querySelector('.notice');
const speedButtons = document.querySelectorAll('.speed-btn');

const songs = [
    {
        title: 'Wonderwall',
        artist: 'Oasis',
        album: "(What's the Story) Morning Glory?",
        year: 1995,
        cover: 'assets/img/oasis-wonderwall-cover.jpg',
        audio: 'assets/audio/oasis-wonderwall.mp3',
        duration: null
    }
];

let currentSongIndex = 0;

const ARM_REST = 26;
const ARM_START = 43.5;
const ARM_END = 70;

function loadSong(index) {
    const song = songs[index];
    audio.src = song.audio;
    songTitle.textContent = song.title;
    songArtist.textContent = [song.artist, song.album, song.year].filter(Boolean).join(' · ') || 'from your collection';

    if (song.cover) {
        albumCover.src = song.cover;
        albumCover.classList.remove('is-empty');
        recordLabel.style.backgroundImage = 'url(' + song.cover + ')';
    } else {
        albumCover.classList.add('is-empty');
        recordLabel.style.backgroundImage = 'none';
    }

    progress.value = 0;
    setFill(progress);
    currentTimeDisplay.textContent = '0:00';
    durationDisplay.textContent = song.duration || '0:00';
    moveArm();
}

function playSong() {
    audio.play().catch(function () {
        pauseSong();
        notice("couldn't play that one");
    });

    document.body.classList.add('playing');
    playButton.setAttribute('aria-label', 'pause');
    deckHint.textContent = 'needle is down — space bar lifts it';
}

function pauseSong() {
    audio.pause();
    document.body.classList.remove('playing');
    playButton.setAttribute('aria-label', 'play');
    deckHint.textContent = 'click the record to drop the needle';
}

function togglePlay() {
    if (audio.paused) {
        playSong();
    } else {
        pauseSong();
    }
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

function moveArm() {
    const ratio = (Number.isFinite(audio.duration) && audio.duration > 0)
        ? audio.currentTime / audio.duration
        : 0;

    let angle = ARM_REST;
    if (!audio.ended && (!audio.paused || ratio > 0)) {
        angle = ARM_START + (ARM_END - ARM_START) * ratio;
    }

    turntable.style.setProperty('--arm', angle + 'deg');
}

function updatePlayhead() {
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;

    const ratio = audio.currentTime / audio.duration;
    progress.value = Math.round(ratio * 100);
    setFill(progress);
    currentTimeDisplay.textContent = formatTime(audio.currentTime);
    moveArm();
}

function seekBy(seconds) {
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;

    audio.currentTime = Math.min(Math.max(0, audio.currentTime + seconds), audio.duration);
    moveArm();
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins + ':' + String(secs).padStart(2, '0');
}

function setFill(slider) {
    const pct = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
    slider.style.setProperty('--fill', pct + '%');
}

playButton.addEventListener('click', togglePlay);
platter.addEventListener('click', togglePlay);
nextButton.addEventListener('click', nextSong);
prevButton.addEventListener('click', prevSong);

audio.addEventListener('timeupdate', updatePlayhead);

audio.addEventListener('loadedmetadata', function () {
    durationDisplay.textContent = formatTime(audio.duration);
    songs[currentSongIndex].duration = formatTime(audio.duration);
    renderCrate();
});

audio.addEventListener('timeupdate', function () {
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;

    audio.currentTime = (progress.value / 100) * audio.duration;
    updatePlayhead();
});

volumeBar.addEventListener('input', function () {
    audio.volume = Number(volumeBar.value);
    setFill(volumeBar);
});

document.addEventListener('keydown', function (e) {
    const onControl = e.target.closest('input, button, a, textarea, select');

    if (e.code === 'Space') {
        if (onControl && e.target !== platter) return;
        e.preventDefault();
        togglePlay();
    } else if (e.key === 'Enter' && e.target === platter) {
        togglePlay();
    } else if (!onControl) {
        if (e.key === 'ArrowRight') seekBy(10);
        if (e.key === 'ArrowLeft') seekBy(-10);
    }
});

speedButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
        speedButtons.forEach(function (b) {
            b.classList.toggle('is-active', b === btn);
        });
        turntable.classList.toggle('speed-45', btn.dataset.rpm === '45');
    });
});

function renderCrate() {
    crateCount.textContent = songs.length === 1 ? '1 record' : songs.length + ' records';

    crate.innerHTML = '';
    songs.forEach(function (song, i) {
        const eqBars = document.createElement('span');
        eqBars.className = 'eq';
        eqBars.appendChild(document.createElement('span'));
        eqBars.appendChild(document.createElement('span'));
        eqBars.appendChild(document.createElement('span'));

        let art;
        if (song.cover) {
            art = document.createElement('img');
            art.className = 'crate-thumb';
            art.alt = '';
            art.src = song.cover;
        } else {
            art = document.createElement('span');
            art.className = 'crate-disc';
        }

        const name = document.createElement('span');
        name.className = 'crate-name';
        name.textContent = song.title;

        const artist = document.createElement('span');
        artist.className = 'crate-artist';
        artist.textContent = song.artist || 'unknown artist';

        const duration = document.createElement('span');
        duration.className = 'crate-duration';
        duration.textContent = song.duration || '–:––';

        const row = document.createElement('button');
        row.type = 'button';
        row.className = 'crate-row' + (i === currentSongIndex ? ' is-current' : '');
        if (i === currentSongIndex) row.setAttribute('aria-current', 'true');
        row.append(eqBars, art, name, artist, duration);
        row.addEventListener('click', function () {
            if (i === currentSongIndex) return togglePlay();
            currentSongIndex = i;
            loadSong(currentSongIndex);
            playSong();
        });

        const li = document.createElement('li');
        li.appendChild(row);
        crate.appendChild(li);
    });
}

function probeDuration(song) {
    const probe = new Audio();
    probe.preload = 'metadata';
    probe.addEventListener('loadedmetadata', function () {
        song.duration = formatTime(probe.duration);
        renderCrate();
    });
    probe.src = song.audio;
}

let dragDepth = 0;

window.addEventListener('dragenter', function (e) {
    e.preventDefault();
    dragDepth++;
    dropVeil.hidden = false;
});

window.addEventListener('dragleave', function (e) {
    e.preventDefault();
    dragDepth--;
    if (dragDepth <= 0) {
        dragDepth = 0;
        dropVeil.hidden = true;
    }
});

window.addEventListener('dragover', function (e) {
    e.preventDefault();
});

window.addEventListener('drop', function (e) {
    e.preventDefault();
    dragDepth = 0;
    dropVeil.hidden = true;

    Array.from(e.dataTransfer.files || []).forEach(function (file) {
        const looksLikeAudio = file.type.indexOf('audio') === 0 ||
            /\.(mp3|m4a|aac|ogg|opus|wav|flac)$/i.test(file.name);

        if (looksLikeAudio) {
            addTrack(file);
        } else {
            notice(file.name + " doesn't look like audio");
        }
    });
});

async function addTrack(file) {
    const tags = await readTags(file);

    songs.push({
        title: tags.title || cleanName(file.name),
        artist: tags.artist || '',
        cover: tags.cover || null,
        audio: URL.createObjectURL(file),
        duration: null
    });

    probeDuration(songs[songs.length - 1]);
    renderCrate();
    notice('added ' + songs[songs.length - 1].title);
}

function cleanName(name) {
    return name.replace(/\.[a-z0-9]+$/i, '').replace(/_/g, ' ').trim() || 'untitled';
}

async function readTags(file) {
    const tags = {};

    try {
        const b = new Uint8Array(await file.slice(0, 1024 * 1024).arrayBuffer());
        if (b.length < 20 || str(b, 0, 3) !== 'ID3') return tags;

        const version = b[3];
        if (version < 3) return tags;

        const tagEnd = Math.min(b.length, 10 + synchsafe(b, 6));

        let p = 10;
        while (p + 10 <= tagEnd) {
            const id = str(b, p, 4);
            if (!/^[A-Z][A-Z0-9]{3}$/.test(id)) break;

            const size = version >= 4 ? synchsafe(b, p + 4) : uint32(b, p + 4);
            const dataStart = p + 10;
            const dataEnd = Math.min(dataStart + size, tagEnd);
            if (dataEnd <= dataStart) break;

            if (id === 'TIT2' && !tags.title) {
                tags.title = decodeText(b.subarray(dataStart + 1, dataEnd), b[dataStart]);
            } else if (id === 'TPE1' && !tags.artist) {
                tags.artist = decodeText(b.subarray(dataStart + 1, dataEnd), b[dataStart]);
            } else if (id === 'APIC' && !tags.cover) {
                tags.cover = readPicture(b, dataStart, dataEnd);
            }

            p = dataEnd;
        }
    } catch (e) {
    }

    return tags;
}

function synchsafe(b, i) {
    return (b[i] << 21) | (b[i + 1] << 14) | (b[i + 2] << 7) | b[i + 3];
}

function uint32(b, i) {
    return ((b[i] << 24) | (b[i + 1] << 16) | (b[i + 2] << 8) | b[i + 3]) >>> 0;
}

function str(b, i, len) {
    return String.fromCharCode.apply(null, b.subarray(i, i + len));
}

function decodeText(bytes, enc) {
    const encodings = ['windows-1252', 'utf-16', 'utf-16be', 'utf-8'];
    if (!bytes.length || enc > 3) return '';

    try {
        return new TextDecoder(encodings[enc]).decode(bytes).replace(/\0/g, '').trim();
    } catch (e) {
        return '';
    }
}

function readPicture(b, start, end) {
    const enc = b[start];
    let p = start + 1;

    const mimeEnd = b.indexOf(0, p);
    if (mimeEnd < 0 || mimeEnd >= end) return null;

    const mime = str(b, p, mimeEnd - p) || 'image/jpeg';
    p = mimeEnd + 2;

    if (enc === 1 || enc === 2) {
        while (p + 1 < end && !(b[p] === 0 && b[p + 1] === 0)) p += 2;
        p += 2;
    } else {
        p = b.indexOf(0, p);
        if (p < 0 || p >= end) return null;
        p += 1;
    }

    if (end - p < 100) return null;

    return URL.createObjectURL(new Blob([b.subarray(p, end)], { type: mime }));
}

let noticeTimer;

function notice(text) {
    noticeEl.textContent = text;
    noticeEl.hidden = false;
    clearTimeout(noticeTimer);
    noticeTimer = setTimeout(function () {
        noticeEl.hidden = true;
    }, 3200);
}

loadSong(currentSongIndex);
renderCrate();
probeDuration(songs[0]);

audio.volume = 0.8;
setFill(volumeBar);
