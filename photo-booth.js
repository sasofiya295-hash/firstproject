/* =====================================================
   LAYOUT CONFIG
===================================================== */
const layoutConfig = {
  A: 1,
  B: 4,
  C: 2,
  D: 6,
  E: 4
};

let currentLayout = (sessionStorage.getItem("selectedLayout") || "A").toUpperCase();
let totalSlots = layoutConfig[currentLayout] || 1;

let shots = [];
let currentIndex = 1;

const subtitleEl = document.querySelector(".booth-subtitle");
function updateSubtitle() {
  subtitleEl.textContent = `Layout ${currentLayout} • Photo ${currentIndex}/${totalSlots}`;
}
updateSubtitle();

/* =====================================================
   CAMERA SETUP — STABLE VERSION (NO LOCK BUG)
===================================================== */
const video = document.getElementById("booth-video");
let currentStream = null;
let mirrorEnabled = true;
let useFrontCamera = true;

async function startCamera() {
  // stop stream sebelumnya
  if (currentStream) {
    currentStream.getTracks().forEach(t => t.stop());
    currentStream = null;
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    alert("Camera not supported by this browser.");
    return;
  }

  let constraints = {
    video: { facingMode: useFrontCamera ? "user" : "environment" },
    audio: false
  };

  try {
    currentStream = await navigator.mediaDevices.getUserMedia(constraints);
  } catch (errFacing) {
    console.warn("Facing mode failed, using default camera…");

    try {
      currentStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    } catch (err) {
      alert("Camera cannot be accessed.\nPlease close other apps using your camera.");
      console.error(err);
      return;
    }
  }

  // apply stream
  video.srcObject = currentStream;
  video.style.transform = mirrorEnabled ? "scaleX(-1)" : "scaleX(1)";
}

// Start camera
startCamera();

/* =====================================================
   SAFETY — Stop Camera only when LEAVING PAGE
===================================================== */
window.addEventListener("beforeunload", () => {
  if (currentStream) currentStream.getTracks().forEach(t => t.stop());
});

/* =====================================================
   SWITCH CAMERA
===================================================== */
const switchBtn = document.getElementById("switchCam");

switchBtn.addEventListener("click", () => {
  useFrontCamera = !useFrontCamera;

  switchBtn.classList.add("booth-active");
  setTimeout(() => switchBtn.classList.remove("booth-active"), 250);

  startCamera();
});

/* =====================================================
   MIRROR MODE
===================================================== */
const mirrorBtn = document.getElementById("mirrorBtn");

mirrorBtn.addEventListener("click", () => {
  mirrorEnabled = !mirrorEnabled;
  video.style.transform = mirrorEnabled ? "scaleX(-1)" : "scaleX(1)";
  mirrorBtn.innerText = mirrorEnabled ? "Mirror On" : "Mirror Off";
  mirrorBtn.classList.toggle("booth-active", mirrorEnabled);
});

/* =====================================================
   FILTER BUTTONS
===================================================== */
const filterButtons = document.querySelectorAll(".booth-filter-btn");
const filterCSS = {
  "None": "none",
  "B&W": "grayscale(100%)",
  "Sepia": "sepia(90%)",
  "Soft Pastel": "brightness(1.2) saturate(0.6)",
  "Retro": "contrast(1.2) sepia(0.5)",
  "Bright": "brightness(1.35)"
};

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("booth-active"));
    btn.classList.add("booth-active");

    video.style.filter = filterCSS[btn.innerText] || "none";
  });
});

/* =====================================================
   TIMER
===================================================== */
let selectedTimer = 0;
const timerButtons = document.querySelectorAll(".booth-timer-btn");

timerButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    timerButtons.forEach(b => b.classList.remove("booth-active"));
    btn.classList.add("booth-active");

    selectedTimer = btn.innerText === "Off" ? 0 : parseInt(btn.innerText);
  });
});

/* =====================================================
   COUNTDOWN
===================================================== */
const countdown = document.getElementById("countdown");

function startCountdown(sec) {
  let time = sec;
  countdown.textContent = time;
  countdown.classList.add("show");

  let timer = setInterval(() => {
    time--;

    if (time <= 0) {
      clearInterval(timer);
      countdown.classList.remove("show");
      takePhoto();
    } else {
      countdown.textContent = time;
    }
  }, 1000);
}

/* =====================================================
   FLASH EFFECT
===================================================== */
const flashEl = document.getElementById("flash");

function flashEffect() {
  flashEl.classList.add("show");
  setTimeout(() => flashEl.classList.remove("show"), 150);
}

/* =====================================================
   TAKE PHOTO
===================================================== */
const thumbs = document.getElementById("booth-thumbs");

function takePhoto() {
  if (shots.length >= totalSlots) return;

  flashEffect();

  const videoWidth = video.videoWidth;
  const videoHeight = video.videoHeight;

  // --- Bikin canvas square ---
  const size = Math.min(videoWidth, videoHeight);
  const startX = (videoWidth - size) / 2;
  const startY = (videoHeight - size) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");

  // Mirror
  if (mirrorEnabled) {
    ctx.translate(size, 0);
    ctx.scale(-1, 1);
  }

  // Apply filter
  ctx.filter = getComputedStyle(video).filter;

  // Crop tengah video → hasil 1:1
  ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);

  const imgURL = canvas.toDataURL("image/png");
  shots.push(imgURL);

  // Thumbnail
  let img = document.createElement("img");
  img.src = imgURL;
  img.classList.add("thumb-img");
  thumbs.appendChild(img);

  if (shots.length >= totalSlots) {
    captureBtn.style.display = "none";
    doneBtn.style.display = "inline-block";
  } else {
    currentIndex = shots.length + 1;
    updateSubtitle();
  }
}

/* =====================================================
   CAPTURE BUTTON
===================================================== */
const captureBtn = document.getElementById("captureBtn");
const retakeBtn = document.getElementById("retakeBtn");
const doneBtn = document.getElementById("doneBtn");

captureBtn.addEventListener("click", () => {
  if (shots.length >= totalSlots) return;

  if (selectedTimer > 0) startCountdown(selectedTimer);
  else takePhoto();
});

/* =====================================================
   RETAKE LAST PHOTO
===================================================== */
retakeBtn.addEventListener("click", () => {
  if (shots.length === 0) return;

  shots.pop();

  const lastThumb = thumbs.querySelector(".thumb-img:last-child");
  if (lastThumb) lastThumb.remove();

  currentIndex = Math.max(1, shots.length + 1);
  updateSubtitle();

  captureBtn.style.display = "inline-block";
  doneBtn.style.display = "none";
});

/* =====================================================
   DONE → SAVE & GO TO EDITOR
===================================================== */
doneBtn.addEventListener("click", () => {
  sessionStorage.setItem("capturedPhotos", JSON.stringify(shots));
  window.location.href = "editor.html";
});
