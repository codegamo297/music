
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'F8_PLAYER';

const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const cd = $('.cd');
const playBtn = $('.btn-toggle-play');
const player = $('.player');
const progress = $('#progress');
const btnNext = $('.btn-next');
const btnPrev = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist');

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: '11:11 (11 giờ 11 phút)',
            singer: 'MiiNa x RIN9 x DREAMeR',
            path: './music/song1.mp3',
            image: './img/song1.jpg'
        },
        {
            name: 'Chúng Ta Của Hiện Tại',
            singer: 'Sơn Tùng MTP',
            path: './music/song2.mp3',
            image: './img/song2.jpg'
        },
        {
            name: 'Đã Lỡ Yêu Em Nhiều',
            singer: 'JustaTee',
            path: './music/song3.mp3',
            image: './img/song3.jpg'
        },
        {
            name: 'Falling In Love',
            singer: 'Na Ngọc Anh',
            path: './music/song4.mp3',
            image: './img/song4.jpg'
        },
        {
            name: 'EM ĐỒNG Ý (I DO)',
            singer: 'ĐỨC PHÚC x 911 x KHẮC HƯNG',
            path: './music/song5.mp3',
            image: './img/song5.jpg'
        },
        {
            name: 'You Are My Crush ',
            singer: 'Quân A.P, Nguyên Jenda',
            path: './music/song6.mp3',
            image: './img/song6.jpg'
        },
        {
            name: 'Kìa Bóng Dáng Ai',
            singer: 'Pháo x Sterry',
            path: './music/song7.mp3',
            image: './img/song7.jpg'
        },
        {
            name: 'Đâu ai dám hứa',
            singer: 'CZEE',
            path: './music/song8.mp3',
            image: './img/song8.jpg'
        },
        {
            name: 'Waiting For You',
            singer: 'MONO',
            path: './music/song9.mp3',
            image: './img/song9.jpg'
        },
        {
            name: 'Có đâu ai ngờ',
            singer: 'Cầm [Cukak Remix]',
            path: './music/song10.mp3',
            image: './img/song10.jpg'
        }
    ],
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                <div class="thumb" style="background-image: url('${song.image}')"></div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        });
        playlist.innerHTML = htmls.join('');
    },

    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex];
            }
        });
    },

    handleEvents: function() {
        const cdWidth = cd.offsetWidth;
        const _this = this;

        // Xử lí CD quay/ dừng
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 10000, // 10 seconds
            iterations: Infinity,
        });
        cdThumbAnimate.pause();

        // Xử lý phóng to/ thu nhỏ CD
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        };

        // Xử lý khi click play
        playBtn.onclick = function() {
            if (_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            };
        };

        // Khi song được play
        audio.onplay = function() {
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        };
        // Khi song bị pause 
        audio.onpause = function() {
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        };
        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function() {
            if (audio.duration) {
                const progressPersent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressPersent;
            };
        };
        // Xử lý khi tua song
        progress.onchange = function(e) {
            const seekTime = audio.duration * e.target.value / 100;
            audio.currentTime = seekTime;
        };

        // Khi next song
        btnNext.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        };
        // Khi prev song
        btnPrev.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        };

        // Xử lý bật/tắt random song
        randomBtn.onclick = function(e) {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom);
        };

        // Xử lý phát lại 1 song
        repeatBtn.onclick = function(e) {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle('active', _this.isRepeat);
        }

        // Xử lý next song khi audio ended
        audio.onended = function() {
            if (_this.isRepeat) {
                audio.play();
            } else {
                btnNext.click();
            };
        };

        // Lắng nghe hành vi click vào playlist
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)');
            if (songNode || e.target.closest('.option')) {
                // Xử lý khi click vào song
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    _this.render();
                    audio.play();
                }
                // Xử lí khi click vào song option
                if (e.target.closest('.option')) {

                }
            }
        }
    },
    
    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            })
        }, 300);
    },

    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },

    loadConfig: function() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },

    nextSong: function() {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        };
        this.loadCurrentSong();
    },
    prevSong: function() {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        };
        this.loadCurrentSong();
    },

    playRandomSong: function() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex);
        this.currentIndex = newIndex;;
        this.loadCurrentSong();
    },

    start: function() {
        // Gán cấu hình từ config vào ứng dụng
        this.loadConfig();

        //Định nghĩa các thuộc tính cho object
        this.defineProperties();

        //Lắng nghe và xử lí các event
        this.handleEvents();

        //Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong();

        //Render playlist
        this.render();

        // Hiển thị trạng thái ban đầu của button repeat& random
        randomBtn.classList.toggle('active', this.isRandom);
        repeatBtn.classList.toggle('active', this.isRepeat);
    }
}

app.start();