// ==========================================
// 1. CẤU HÌNH FIREBASE
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyBWORsMFkObLZETQutNcxEmB6A7TXTjlag",
    authDomain: "hdklove-event.firebaseapp.com",
    databaseURL: "https://hdklove-event-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "hdklove-event",
    storageBucket: "hdklove-event.firebasestorage.app",
    messagingSenderId: "973231030015",
    appId: "1:973231030015:web:5eb4e5443d3071990c96ca"
};

// Khởi tạo Firebase an toàn
if (typeof firebase !== 'undefined' && firebase.apps && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = (typeof firebase !== 'undefined') ? firebase.database() : null;

// Default Configuration State
const DEFAULT_CONFIG = {
    startDate: '2024-09-15T00:00',
    p1Name: 'Phương Hoàng',
    p1Nick: '@hoangdam.keeb',
    p1Avatar: 'images/ava1.jpg',
    p2Name: 'Thuỳ Duyên',
    p2Nick: '@thuyduyen',
    p2Avatar: 'images/ava2.jpg',
    audioPath: 'audio/love.mp3',
    loveQuote: 'Tình yêu không phải là tìm một ai đó hoàn hảo, mà là học cách nhìn thấy những điều hoàn hảo từ một người không hoàn hảo.',
    bgTheme: 'theme-rose',
    memories: [
        {
            id: 'm1',
            title: 'Buổi Hẹn Hò Đầu Tiên',
            date: '2022-02-14',
            desc: 'Cùng nhau uống tách cà phê ấm áp trong ngày Valentine đầu tiên quen nhau.',
            image: 'images/memory1.jpg',
            fallbackImage: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=600&q=80'
        },
        {
            id: 'm2',
            title: 'Chuyến Du Lịch Biển',
            date: '2022-08-10',
            desc: 'Ngắm hoàng hôn rực rỡ bên bờ biển bãi dài ngàn sóng vỗ.',
            image: 'images/memory2.jpg',
            fallbackImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'
        },
        {
            id: 'm3',
            title: 'Kỷ Niệm 1 Năm Bên Nhau',
            date: '2023-02-14',
            desc: 'Cùng làm bánh kem và ôn lại những kỉ niệm tròn một năm gắn bó.',
            image: 'images/memory3.jpg',
            fallbackImage: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80'
        }
    ]
};

let state = { ...DEFAULT_CONFIG };
let uploadedP1AvatarBase64 = '';
let uploadedP2AvatarBase64 = '';
let uploadedMemImageBase64 = '';

// Load application state from LocalStorage
function loadApplicationState() {
    try {
        const stored = localStorage.getItem('love_day_counter_v2_data');
        if (stored) {
            state = Object.assign({}, DEFAULT_CONFIG, JSON.parse(stored));
        }
    } catch (e) {
        console.warn('LocalStorage error:', e);
    }
}

// Save application state to LocalStorage
function saveApplicationState() {
    try {
        localStorage.setItem('love_day_counter_v2_data', JSON.stringify(state));
    } catch (e) {
        console.error('Error saving state:', e);
        showToastNotification("Dung lượng bộ nhớ đầy, không thể lưu ảnh quá lớn!", "error");
    }
}

// Render UI values from state
function renderUI() {
    // Person 1
    document.getElementById('p1NameDisplay').textContent = state.p1Name;
    document.getElementById('p1NickDisplay').textContent = state.p1Nick || '';
    document.getElementById('p1AvatarDisplay').src = state.p1Avatar;

    // Person 2
    document.getElementById('p2NameDisplay').textContent = state.p2Name;
    document.getElementById('p2NickDisplay').textContent = state.p2Nick || '';
    document.getElementById('p2AvatarDisplay').src = state.p2Avatar;

    // Quote & Theme
    document.getElementById('loveQuoteDisplay').textContent = `"${state.loveQuote}"`;
    
    const startObj = new Date(state.startDate);
    const startFormatted = `${startObj.getDate().toString().padStart(2, '0')}/${(startObj.getMonth() + 1).toString().padStart(2, '0')}/${startObj.getFullYear()}`;
    document.getElementById('startDateDisplayTag').textContent = `Bắt đầu: ${startFormatted}`;

    document.getElementById('appBody').className = `${state.bgTheme} text-white min-h-screen relative flex flex-col justify-between selection:bg-rose-500 selection:text-white`;

    // Audio Player Path Update
    const bgAudio = document.getElementById('bgAudioPlayer');
    if (bgAudio.src !== state.audioPath) {
        bgAudio.src = state.audioPath;
    }

    // Render Timeline & Counter
    renderTimeline();
    updateCounterEngine();
}

// Live Counter Calculation Engine
function updateCounterEngine() {
    const now = new Date();
    const start = new Date(state.startDate);
    let diff = now - start;

    if (diff < 0) diff = 0;

    // Total days
    const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    document.getElementById('totalDaysCount').textContent = totalDays.toLocaleString('vi-VN');

    // Detailed Breakdown Calculation
    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    let days = now.getDate() - start.getDate();

    if (days < 0) {
        months--;
        const prevMonthDays = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
        days += prevMonthDays;
    }

    if (months < 0) {
        years--;
        months += 12;
    }

    if (years < 0) years = 0;

    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    document.getElementById('yearsCount').textContent = years;
    document.getElementById('monthsCount').textContent = months;
    document.getElementById('daysCount').textContent = days;
    document.getElementById('hoursCount').textContent = hours.toString().padStart(2, '0');
    document.getElementById('minutesCount').textContent = minutes.toString().padStart(2, '0');
    document.getElementById('secondsCount').textContent = seconds.toString().padStart(2, '0');

    // Calculate milestone goals
    updateMilestonesEngine(totalDays);
}

// Milestone goals definition
const MILESTONES = [100, 200, 300, 365, 500, 730, 1000, 1500, 2000, 3650, 5000];

function updateMilestonesEngine(currentDays) {
    let nextMilestone = MILESTONES.find(m => m > currentDays);
    if (!nextMilestone) nextMilestone = currentDays + 100;

    let prevMilestone = 0;
    for (let i = 0; i < MILESTONES.length; i++) {
        if (MILESTONES[i] <= currentDays) prevMilestone = MILESTONES[i];
    }

    const totalSpan = nextMilestone - prevMilestone;
    const progress = currentDays - prevMilestone;
    const percent = Math.min(100, Math.max(0, (progress / totalSpan) * 100)).toFixed(1);
    const remaining = nextMilestone - currentDays;

    document.getElementById('nextMilestoneBadge').textContent = `Mục tiêu: ${nextMilestone} Ngày`;
    document.getElementById('milestoneProgressLabel').textContent = `Tiến độ đến cột mốc ${nextMilestone} Ngày`;
    document.getElementById('milestonePercentText').textContent = `${percent}%`;
    document.getElementById('milestoneProgressBar').style.width = `${percent}%`;
    document.getElementById('milestoneDaysDetail').innerHTML = `<span>Đã đi được: <strong class="text-rose-200">${currentDays} ngày</strong></span><span>Còn lại: <strong class="text-rose-300">${remaining} ngày</strong></span>`;

    // Milestone grid badges
    const grid = document.getElementById('milestoneGrid');
    grid.innerHTML = '';

    const sampleBadges = [100, 365, 1000, 2000];
    sampleBadges.forEach(m => {
        const reached = currentDays >= m;
        const badge = document.createElement('div');
        badge.className = `p-3 rounded-2xl border text-center transition-all ${reached ? 'bg-rose-500/20 border-rose-500/40 text-white' : 'bg-white/5 border-white/10 text-rose-200/50'}`;
        badge.innerHTML = `
            <div class="text-[11px] font-bold text-rose-300/80 mb-0.5">${m} Ngày</div>
            <div class="text-xs font-semibold">${reached ? '<i class="fa-solid fa-check text-rose-400 mr-1"></i>Đã Đạt' : (m - currentDays) + ' ngày nữa'}</div>
        `;
        grid.appendChild(badge);
    });
}

// Render Timeline
function renderTimeline() {
    const container = document.getElementById('timelineContainer');
    container.innerHTML = '';

    if (!state.memories || state.memories.length === 0) {
        container.innerHTML = `<div class="text-center py-6 text-rose-200/50 text-xs">Chưa có kỷ niệm nào. Bấm "Thêm Kỷ Niệm Mới" để lưu giữ khoảnh khắc!</div>`;
        return;
    }

    // Sort memories descending by date
    const sortedMemories = [...state.memories].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedMemories.forEach((mem, idx) => {
        const isEven = idx % 2 === 0;
        const d = new Date(mem.date);
        const formattedDate = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;

        const imgSrc = mem.image || mem.fallbackImage || 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80';

        const cardHTML = `
            <div class="relative flex flex-col sm:flex-row items-center group">
                <!-- Timeline Node Dot -->
                <div class="absolute left-4 sm:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 border-4 border-slate-900 flex items-center justify-center text-white text-xs z-10 shadow-lg shadow-rose-500/30">
                    <i class="fa-solid fa-heart"></i>
                </div>

                <!-- Card Content -->
                <div class="ml-12 sm:ml-0 sm:w-1/2 ${isEven ? 'sm:pr-10 sm:text-right' : 'sm:pl-10 sm:ml-auto'} w-full">
                    <div class="glass-panel-dark p-4 sm:p-5 rounded-2xl border border-white/10 hover:border-rose-500/40 transition-all duration-300">
                        <img src="${imgSrc}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80';" alt="${mem.title}" class="w-full h-40 sm:h-48 object-cover rounded-xl mb-3 border border-white/10">
                        
                        <div class="flex items-center justify-between ${isEven ? 'sm:flex-row-reverse' : ''} mb-2">
                            <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                <i class="fa-regular fa-calendar-days mr-1"></i>${formattedDate}
                            </span>
                            <button onclick="deleteMemoryItem('${mem.id}')" title="Xóa kỷ niệm" class="text-xs text-rose-300/50 hover:text-rose-400 p-1 transition">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>

                        <h4 class="text-sm sm:text-base font-bold text-white mb-1">${mem.title}</h4>
                        <p class="text-xs text-rose-100/70 leading-relaxed">${mem.desc}</p>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += cardHTML;
    });
}

// Audio Player System (Audio file + Synth Fallback)
let isAudioPlaying = false;
let webAudioCtx = null;
let synthInterval = null;

function toggleAudio() {
    const bgAudio = document.getElementById('bgAudioPlayer');

    if (isAudioPlaying) {
        // Stop music
        bgAudio.pause();
        if (synthInterval) clearInterval(synthInterval);
        isAudioPlaying = false;
        document.getElementById('audioBtnLabel').textContent = "Bật Nhạc";
        document.getElementById('audioBtnIcon').className = "fa-solid fa-music text-rose-400";
        showToastNotification("Đã tạm dừng nhạc nền", "info");
    } else {
        // Try playing audio file first
        bgAudio.play().then(() => {
            isAudioPlaying = true;
            document.getElementById('audioBtnLabel').textContent = "Đang Phát";
            document.getElementById('audioBtnIcon').className = "fa-solid fa-compact-disc fa-spin text-rose-300";
            showToastNotification("Đang phát nhạc nền!", "success");
        }).catch(err => {
            console.warn("Audio file unplayable or missing, starting Web Audio Synth fallback...", err);
            playSynthRomanticMelody();
        });
    }
}

// Web Audio API Procedural Romantic Synthesizer Fallback
function playSynthRomanticMelody() {
    if (!webAudioCtx) {
        webAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (webAudioCtx.state === 'suspended') {
        webAudioCtx.resume();
    }

    isAudioPlaying = true;
    document.getElementById('audioBtnLabel').textContent = "Đang Phát (Synth)";
    document.getElementById('audioBtnIcon').className = "fa-solid fa-compact-disc fa-spin text-rose-300";

    const scaleNotes = [261.63, 329.63, 392.00, 493.88, 523.25, 493.88, 392.00, 329.63];
    let noteIndex = 0;

    synthInterval = setInterval(() => {
        if (!isAudioPlaying) return;
        try {
            const osc = webAudioCtx.createOscillator();
            const gain = webAudioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(scaleNotes[noteIndex], webAudioCtx.currentTime);

            gain.gain.setValueAtTime(0.05, webAudioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, webAudioCtx.currentTime + 1.4);

            osc.connect(gain);
            gain.connect(webAudioCtx.destination);

            osc.start();
            osc.stop(webAudioCtx.currentTime + 1.4);

            noteIndex = (noteIndex + 1) % scaleNotes.length;
        } catch (e) {
            console.error("Synth error:", e);
        }
    }, 600);

    showToastNotification("Đang phát nhạc nền lãng mạn!", "success");
}

// Modal Controls
function openSettingsModal() {
    document.getElementById('setStartDate').value = state.startDate;
    document.getElementById('setP1Name').value = state.p1Name;
    document.getElementById('setP1Nick').value = state.p1Nick || '';
    document.getElementById('setP1AvatarPath').value = state.p1Avatar.startsWith('data:') ? '' : state.p1Avatar;
    document.getElementById('setP2Name').value = state.p2Name;
    document.getElementById('setP2Nick').value = state.p2Nick || '';
    document.getElementById('setP2AvatarPath').value = state.p2Avatar.startsWith('data:') ? '' : state.p2Avatar;
    document.getElementById('setAudioPath').value = state.audioPath;
    document.getElementById('setLoveQuote').value = state.loveQuote;
    document.getElementById('setTheme').value = state.bgTheme;

    uploadedP1AvatarBase64 = '';
    uploadedP2AvatarBase64 = '';

    const modal = document.getElementById('settingsModal');
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);
}

function closeSettingsModal() {
    const modal = document.getElementById('settingsModal');
    modal.classList.add('opacity-0');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

function handleSaveSettings(e) {
    e.preventDefault();
    state.startDate = document.getElementById('setStartDate').value;
    state.p1Name = document.getElementById('setP1Name').value.trim();
    state.p1Nick = document.getElementById('setP1Nick').value.trim();
    state.p2Name = document.getElementById('setP2Name').value.trim();
    state.p2Nick = document.getElementById('setP2Nick').value.trim();
    state.loveQuote = document.getElementById('setLoveQuote').value.trim();
    state.bgTheme = document.getElementById('setTheme').value;
    state.audioPath = document.getElementById('setAudioPath').value.trim() || 'audio/love.mp3';

    const p1Path = document.getElementById('setP1AvatarPath').value.trim();
    if (uploadedP1AvatarBase64) state.p1Avatar = uploadedP1AvatarBase64;
    else if (p1Path) state.p1Avatar = p1Path;

    const p2Path = document.getElementById('setP2AvatarPath').value.trim();
    if (uploadedP2AvatarBase64) state.p2Avatar = uploadedP2AvatarBase64;
    else if (p2Path) state.p2Avatar = p2Path;

    saveApplicationState();
    renderUI();
    closeSettingsModal();
    showToastNotification("Cập nhật cài đặt thành công!", "success");
}

function openAddMemoryModal() {
    const form = document.getElementById('memoryForm');
    if (form) form.reset();
    uploadedMemImageBase64 = '';
    
    const preview = document.getElementById('memImgPreview');
    if (preview) preview.classList.add('hidden');
    
    const modal = document.getElementById('memoryModal');
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);
}

function closeAddMemoryModal() {
    const modal = document.getElementById('memoryModal');
    modal.classList.add('opacity-0');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

// Sửa lại hoàn chỉnh hàm handleSaveMemory
function handleSaveMemory(e) {
    if (e) e.preventDefault();

    const titleVal = document.getElementById('memTitleInput')?.value.trim();
    const dateVal = document.getElementById('memDateInput')?.value;
    const descVal = document.getElementById('memDescInput')?.value.trim();
    const pathImg = document.getElementById('memImgPathInput')?.value.trim();

    if (!titleVal || !dateVal) {
        showToastNotification("Vui lòng nhập đầy đủ Tiêu đề và Ngày!", "error");
        return;
    }

    const finalImg = uploadedMemImageBase64 || pathImg || 'images/memory_default.jpg';

    const newMemData = {
        title: titleVal,
        date: dateVal,
        desc: descVal,
        image: finalImg,
        fallbackImage: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80'
    };

    if (db) {
        // Push lên Firebase, Firebase tự tạo key (-P2c...)
        db.ref('memories').push(newMemData)
            .then(() => {
                showToastNotification("Đã thêm kỷ niệm mới lên Firebase!", "success");
                closeAddMemoryModal();
            })
            .catch((err) => {
                showToastNotification("Lỗi Firebase: " + err.message, "error");
            });
    } else {
        state.memories.push({ id: 'm_' + Date.now(), ...newMemData });
        saveApplicationState();
        renderUI();
        closeAddMemoryModal();
    }
}
// Lắng nghe dữ liệu từ Firebase Realtime Database
function listenFirebaseMemories() {
    if (!db) return;

    db.ref('memories').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const firebaseMemories = [];
            // Lặp qua từng Key tự sinh của Firebase (VD: -P2cMZ6WLLcmkRfBwPRg)
            Object.keys(data).forEach((firebaseKey) => {
                const item = data[firebaseKey];
                firebaseMemories.push({
                    ...item,
                    id: firebaseKey // ĐÈ CHÍNH XÁC ID BẰNG KEY CỦA FIREBASE
                });
            });

            // Cập nhật State & LocalStorage
            state.memories = firebaseMemories;
            saveApplicationState();
            renderUI();
        } else {
            // Nếu trên Firebase trống rỗng (đã xóa hết)
            state.memories = [];
            saveApplicationState();
            renderUI();
        }
    }, (error) => {
        console.error("Lỗi đọc Firebase:", error);
    });
}

function deleteMemoryItem(id) {
    if (!id) return;

    // Kiểm tra xem SweetAlert2 có tồn tại hay không
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: 'Xóa kỷ niệm này?',
            text: "Hành động này sẽ xóa vĩnh viễn khoảnh khắc này!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#f43f5e',
            cancelButtonColor: '#334155',
            confirmButtonText: 'Xóa ngay',
            cancelButtonText: 'Hủy bỏ',
            background: '#0f172a',
            color: '#fff',
            customClass: {
                popup: 'rounded-3xl border border-white/10 backdrop-blur-xl shadow-2xl',
                title: 'text-lg font-bold text-rose-300',
                htmlContainer: 'text-xs text-slate-300',
                confirmButton: 'rounded-xl px-4 py-2 text-xs font-semibold shadow-lg shadow-rose-500/30',
                cancelButton: 'rounded-xl px-4 py-2 text-xs font-semibold'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                executeDeleteMemory(id);
            }
        });
    } else {
        // Fallback dùng confirm chuẩn nếu chưa load SweetAlert2
        if (confirm("Bạn có chắc chắn muốn xóa kỷ niệm này vĩnh viễn?")) {
            executeDeleteMemory(id);
        }
    }
}

// Hàm thực thi xóa trực tiếp trên Firebase/LocalStorage
function executeDeleteMemory(id) {
    if (db) {
        db.ref('memories/' + id).remove()
            .then(() => {
                showToastNotification("Đã xóa kỷ niệm vĩnh viễn!", "success");
            })
            .catch((err) => {
                showToastNotification("Lỗi xóa Firebase: " + err.message, "error");
            });
    } else {
        state.memories = state.memories.filter(m => m.id !== id);
        saveApplicationState();
        renderUI();
        showToastNotification("Đã xóa khỏi LocalStorage", "info");
    }
}
// Image File Helper
function previewImageUpload(event, previewId) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const res = e.target.result;
        const preview = document.getElementById(previewId);
        if (preview) {
            preview.src = res;
            preview.classList.remove('hidden');
        }

        if (previewId === 'p1AvatarPreview') uploadedP1AvatarBase64 = res;
        if (previewId === 'p2AvatarPreview') uploadedP2AvatarBase64 = res;
        if (previewId === 'memImgPreview') uploadedMemImageBase64 = res;
    };
    reader.readAsDataURL(file);
}

// Toast Notifications
function showToastNotification(msg, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');

    let bg = 'bg-slate-800 text-white border-white/20';
    if (type === 'success') bg = 'bg-rose-600 text-white border-rose-400';
    if (type === 'error') bg = 'bg-red-600 text-white border-red-400';

    toast.className = `px-4 py-2.5 rounded-2xl border shadow-2xl text-xs font-semibold flex items-center space-x-2 transition-all duration-300 transform translate-y-2 opacity-0 pointer-events-auto ${bg}`;
    toast.innerHTML = `<i class="fa-solid fa-heart-circle-check text-rose-200"></i><span>${msg}</span>`;

    container.appendChild(toast);
    setTimeout(() => toast.classList.remove('translate-y-2', 'opacity-0'), 10);
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Particle Canvas Graphics Engine
function initParticleCanvas() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const count = Math.min(45, Math.floor(width / 25));

    class FloatingHeart {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = height + 20 + Math.random() * 40;
            this.size = Math.random() * 12 + 6;
            this.speedY = Math.random() * 1.2 + 0.4;
            this.speedX = Math.sin(Math.random() * Math.PI) * 0.6;
            this.opacity = Math.random() * 0.5 + 0.2;
            this.rotation = Math.random() * 360;
            this.rotSpeed = (Math.random() - 0.5) * 1.2;
        }

        update() {
            this.y -= this.speedY;
            this.x += Math.sin(this.y / 40) * 0.4;
            this.rotation += this.rotSpeed;

            if (this.y < -30) this.reset();
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate((this.rotation * Math.PI) / 180);
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = '#fb7185';

            // Heart Shape
            ctx.beginPath();
            const topCurveHeight = this.size * 0.3;
            ctx.moveTo(0, topCurveHeight);
            ctx.bezierCurveTo(0, 0, -this.size / 2, 0, -this.size / 2, topCurveHeight);
            ctx.bezierCurveTo(-this.size / 2, (this.size + topCurveHeight) / 2, 0, this.size, 0, this.size);
            ctx.bezierCurveTo(0, this.size, this.size / 2, (this.size + topCurveHeight) / 2, this.size / 2, topCurveHeight);
            ctx.bezierCurveTo(this.size / 2, 0, 0, 0, 0, topCurveHeight);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        }
    }

    for (let i = 0; i < count; i++) {
        particles.push(new FloatingHeart());
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }

    animate();
}

// Initialization on Load
window.onload = function() {
    loadApplicationState();
    renderUI();
    initParticleCanvas();
// Bắt đầu lắng nghe dữ liệu Firebase khi trang web chạy
    listenFirebaseMemories();
    const yearEl = document.getElementById('yearCopy');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Live Timer Update Loop
    setInterval(updateCounterEngine, 1000);
};