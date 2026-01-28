/* =====================================================
   1. Ambil data layout & foto dari sessionStorage
===================================================== */
const selectedLayout = sessionStorage.getItem("selectedLayout") || "A";
const capturedPhotos = JSON.parse(sessionStorage.getItem("capturedPhotos") || "[]");

document.getElementById("editor-subtitle").textContent = `Layout ${selectedLayout}`;


/* =====================================================
   3. Render foto ke layout-frame
===================================================== */
const frameEl = document.getElementById("layout-frame");
frameEl.classList.add(`layout-${selectedLayout}`);

capturedPhotos.forEach((src) => {
  const img = document.createElement("img");
  img.src = src;
  img.className = "layout-photo";
  frameEl.insertBefore(img, frameEl.querySelector(".layout-caption"));
});

/* =====================================================
   FRAME COLOR PICKER
===================================================== */
const frameDots = document.querySelectorAll(".frame-color-dot");
const frameColorPicker = document.getElementById("frameColorPicker");

function setFrameColor(color) {
  frameEl.style.backgroundColor = color;
}
setFrameColor("#ffffff");

frameDots.forEach(dot => {
  dot.addEventListener("click", () => {
    if (dot.dataset.role === "custom") return frameColorPicker.click();
    setFrameColor(dot.dataset.color);
    frameDots.forEach(d => d.classList.remove("frame-active"));
    dot.classList.add("frame-active");
  });
});

frameColorPicker.addEventListener("input", (e) => {
  setFrameColor(e.target.value);
  frameDots.forEach(d => d.classList.remove("frame-active"));
  document.querySelector(".frame-color-custom").classList.add("frame-active");
});

/* =====================================================
   CAPTION SYSTEM
===================================================== */
const captionInput = document.getElementById("caption-input");
const captionFontSelect = document.getElementById("caption-font");
const captionAddDate = document.getElementById("caption-add-date");
const captionAddTime = document.getElementById("caption-add-time");
const applyCaptionBtn = document.getElementById("apply-caption-btn");

const captionMainEl = document.getElementById("layout-caption-text");
const captionSubEl = document.getElementById("layout-caption-date-time");

let currentTextColor = "#111111";

function pad2(n) { return n.toString().padStart(2, "0"); }
function formatDate(d) { return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`; }
function formatTime(d) { return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`; }

function applyCaptionStyles() {
  const font = captionFontSelect.value || "'Inter', sans-serif";
  captionMainEl.style.fontFamily = font;
  captionSubEl.style.fontFamily = font;
  captionMainEl.style.color = currentTextColor;
  captionSubEl.style.color = currentTextColor;
}

document.querySelectorAll(".text-color-dot").forEach(dot => {
  dot.addEventListener("click", () => {
    if (dot.dataset.role === "custom") return textColorPicker.click();
    currentTextColor = dot.dataset.color;
    textDots.forEach(d => d.classList.remove("text-active"));
    dot.classList.add("text-active");
    applyCaptionStyles();
  });
});

textColorPicker.addEventListener("input", (e) => {
  currentTextColor = e.target.value;
  textDots.forEach(d => d.classList.remove("text-active"));
  document.querySelector(".text-color-custom").classList.add("text-active");
  applyCaptionStyles();
});

applyCaptionBtn.addEventListener("click", () => {
  captionMainEl.textContent = captionInput.value.trim();
  const now = new Date();
  const parts = [];
  if (captionAddDate.checked) parts.push(formatDate(now));
  if (captionAddTime.checked) parts.push(formatTime(now));
  captionSubEl.textContent = parts.join(" ");
  applyCaptionStyles();
});

/* =====================================================
   STICKER SYSTEM
===================================================== */

const stickerListEl = document.getElementById("sticker-list");
const stickerFiles = Array.from({ length: 20 }, (_, i) => `assets/sticker/${i+1}.png`);

function loadStickers() {
  stickerFiles.forEach(src => {
    let img = document.createElement("img");
    img.src = src;
    img.className = "sticker-thumb";
    img.onclick = () => addStickerToFrame(src);
    stickerListEl.appendChild(img);
  });
}
loadStickers();

function addStickerToFrame(src) {
  const sticker = document.createElement("div");
  sticker.className = "sticker-item";

  const img = document.createElement("img");
  img.src = src;
  img.style.width = "100%";
  img.style.pointerEvents = "none";

  const del = document.createElement("div");
  del.className = "delete-handle";
  del.textContent = "×";

  const resize = document.createElement("div");
  resize.className = "resize-handle";

  const rotate = document.createElement("div");
  rotate.className = "rotate-handle";

  sticker.appendChild(img);
  sticker.appendChild(del);
  sticker.appendChild(resize);
  sticker.appendChild(rotate);

  frameEl.appendChild(sticker);

  sticker.style.left = "120px";
  sticker.style.top = "120px";

  enableDrag(sticker);
  enableResize(sticker, resize);
  enableRotate(sticker, rotate);

  del.onclick = () => sticker.remove();
}

/* =====================================================
   STICKER HANDLERS
===================================================== */

function enableDrag(el) {
  let isDrag = false;
  let startX, startY, startLeft, startTop;

  el.addEventListener("mousedown", e => {
    isDrag = true;
    startX = e.clientX;
    startY = e.clientY;
    startLeft = parseInt(el.style.left);
    startTop = parseInt(el.style.top);

    document.onmousemove = drag;
    document.onmouseup = stopDrag;
  });

  function drag(e) {
    if (!isDrag) return;
    el.style.left = startLeft + (e.clientX - startX) + "px";
    el.style.top = startTop + (e.clientY - startY) + "px";
  }

  function stopDrag() {
    isDrag = false;
    document.onmousemove = null;
    document.onmouseup = null;
  }
}

function enableResize(el, handle) {
  let isResize = false;
  let startX = 0;
  let startW = 0;

  handle.addEventListener("mousedown", e => {
    e.stopPropagation();
    isResize = true;
    startX = e.clientX;
    startW = el.offsetWidth;
    document.onmousemove = doResize;
    document.onmouseup = stopResize;
  });

  function doResize(e) {
    if (!isResize) return;
    el.style.width = Math.max(40, startW + (e.clientX - startX)) + "px";
  }

  function stopResize() {
    isResize = false;
    document.onmousemove = null;
    document.onmouseup = null;
  }
}

function enableRotate(el, handle) {
  let isRotate = false;
  let startX = 0;
  let startAngle = 0;

  handle.addEventListener("mousedown", e => {
    e.stopPropagation();
    isRotate = true;
    startX = e.clientX;
    startAngle = parseInt(el.dataset.angle || "0");
    document.onmousemove = doRotate;
    document.onmouseup = stopRotate;
  });

  function doRotate(e) {
    if (!isRotate) return;
    const angle = startAngle + (e.clientX - startX);
    el.dataset.angle = angle;
    el.style.transform = `rotate(${angle}deg)`;
  }

  function stopRotate() {
    isRotate = false;
    document.onmousemove = null;
    document.onmouseup = null;
  }
}

/* =====================================================
   SAVE DESIGN
===================================================== */

document.getElementById("saveDesignBtn").addEventListener("click", () => {

  // unlock autoplay untuk preview
  sessionStorage.setItem("hasGesture", "yes");

  // hide handles
  document.querySelectorAll(".resize-handle, .rotate-handle, .delete-handle")
    .forEach(h => h.style.display = "none");

  html2canvas(frameEl, {
    backgroundColor: null,
    scale: 3
  }).then(canvas => {

    // show handles again
    document.querySelectorAll(".resize-handle, .rotate-handle, .delete-handle")
      .forEach(h => h.style.display = "");

    const finalImage = canvas.toDataURL("image/png");
    sessionStorage.setItem("finalImage", finalImage);

    window.location.href = "preview.html";
  });
});
window.addEventListener("DOMContentLoaded", () => {

    // cek izin autoplay dari editor
    const allowSound = sessionStorage.getItem("allowSound");

    const printSound = document.getElementById("print-sound");

    // autoplay hanya jika user klik SAVE DESIGN sebelumnya
    if (allowSound === "yes") {
        printSound.volume = 1;

        printSound.play().catch(err => {
            console.log("Autoplay blocked:", err);
        });
    }

    // reset biar tidak repeat saat refresh
    sessionStorage.removeItem("allowSound");
});
