/** ============================================================
    PRINT SOUND FIX – Stable Autoplay (Chrome + Android)
============================================================ */

function playPrintSound(audioEl) {
    if (!audioEl) return;

    const tryPlay = () => {
        audioEl.currentTime = 0;
        audioEl.volume = 1;
        audioEl.play().catch(() => {});
    };

    // 1) coba langsung
    tryPlay();

    // 2) fallback 150ms (bypass autoplay block)
    setTimeout(tryPlay, 150);

    // 3) fallback 350ms (case Android)
    setTimeout(tryPlay, 350);
}



// preview.js – V5 (Final Fix)

document.addEventListener("DOMContentLoaded", () => {
    const imgEl       = document.getElementById("final-photo");
    const outputEl    = document.getElementById("print-output");
    const readyTextEl = document.querySelector(".print-ready-text");
    const btnWrapEl   = document.querySelector(".action-buttons");
    const shareBtn    = document.querySelector(".action-btn.share");
    const downloadBtn = document.querySelector(".action-btn.download");
    const soundEl     = document.getElementById("print-sound");

    const finalImage = sessionStorage.getItem("finalImage");
    const shouldPlaySound = sessionStorage.getItem("playPrintSound") === "1";

    /** FIX 1 — jika foto tidak ada */
    if (!finalImage) {
        imgEl.src = "assets/placeholder.png";
    } else {
        imgEl.src = finalImage;
    }

    /** ketika foto hasil layout selesai load */
    imgEl.addEventListener("load", () => {
        
        /** FIX 2 — ukuran harus EXACT agar tidak kepotong */
        const MAX_WIDTH = 216;
        let targetWidth = MAX_WIDTH;
        let targetHeight = imgEl.naturalHeight * (MAX_WIDTH / imgEl.naturalWidth);

        outputEl.style.width = `${targetWidth}px`;
        outputEl.style.height = "0px";
        outputEl.style.overflow = "hidden";
        outputEl.style.transition = "height 6s ease-out";

        // trigger reflow
        void outputEl.offsetHeight;

        // animasi print
        outputEl.style.height = `${targetHeight}px`;

        /** FIX 3 — autoplay sound (lebih kuat dan stabil) */
        if (shouldPlaySound && soundEl) {
    playPrintSound(soundEl);
}


        /** selesai animasi print → tampilkan teks & tombol */
        const ANIM_DURATION = 6000;

        setTimeout(() => {
            readyTextEl?.classList.add("show");
            btnWrapEl?.classList.add("show");

            // scroll otomatis
            readyTextEl?.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

            // reset flag
            sessionStorage.removeItem("playPrintSound");
        }, ANIM_DURATION);
    });

    /* SHARE */
    if (shareBtn) {
        shareBtn.addEventListener("click", async () => {
            if (!finalImage) return;

            if (navigator.share && navigator.canShare) {
                try {
                    const resp = await fetch(finalImage);
                    const blob = await resp.blob();
                    const file = new File([blob], "cherrybox-photo.png", {
                        type: blob.type || "image/png"
                    });

                    if (navigator.canShare({ files: [file] })) {
                        // Tambahkan animasi sebelum share terbuka
                            document.body.classList.add("share-opening");
                            setTimeout(() => document.body.classList.add("show"), 10);

                            await navigator.share({
                                title: "Cherrybox Photobooth",
                                text: "My photo from Cherrybox ✨",
                                files: [file]
                            });

                            // Hapus animasi setelah selesai
                            setTimeout(() => {
                                document.body.classList.remove("share-opening", "show");
                            }, 400);

                        return;
                    }
                } catch (err) {
                    console.warn("Native share failed", err);
                }
            }

            const text = "My photo from Cherrybox ✨";
            window.open(
                `https://wa.me/?text=${encodeURIComponent(text)}`,
                "_blank"
            );
        });
    }

    /* DOWNLOAD */
    if (downloadBtn) {
        downloadBtn.addEventListener("click", () => {
            if (!finalImage) return;

            const a = document.createElement("a");
            a.href = finalImage;
            a.download = "cherrybox-photo.png";
            document.body.appendChild(a);
            a.click();
            a.remove();
        });
    }
});
