document.addEventListener("DOMContentLoaded", () => {
  // Mark JS as available only after this file has started successfully.
  document.documentElement.classList.add("js-ready");

  // Mobile menu
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav-links");
  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.textContent = open ? "×" : "☰";
    });
  }

  // ========================================
// BACKGROUND MUSIC WITH AUTOPLAY
// ========================================

const music = document.getElementById("bgMusic");

const musicButtons = document.querySelectorAll(
    "[data-music-toggle]"
);

function updateMusicButtons(playing) {
    musicButtons.forEach(button => {
        button.setAttribute(
            "aria-pressed",
            String(playing)
        );

        const label = button.querySelector(
            "[data-music-label]"
        );

        const icon = button.querySelector(
            ".music-icon"
        );

        if (label) {
            label.textContent = playing
                ? "Pause our song"
                : "Play our song";
        }

        if (icon) {
            icon.textContent = playing ? "Ⅱ" : "♫";
        }

        if (!label && !icon) {
            button.textContent = playing
                ? "Ⅱ Pause music"
                : "♫ Put on the soundtrack";
        }
    });
}

// Try to start music automatically when the page opens.
if (music) {
    music.volume = 0.5;

    music.play()
        .then(() => {
            updateMusicButtons(true);
        })
        .catch(() => {
            // Autoplay may be blocked by the browser.
            updateMusicButtons(false);

            console.log(
                "Autoplay blocked. Waiting for user interaction."
            );
        });

    music.addEventListener("play", () => {
        updateMusicButtons(true);
    });

    music.addEventListener("pause", () => {
        updateMusicButtons(false);
    });
}

// Music play/pause buttons.
musicButtons.forEach(button => {
    button.addEventListener("click", async () => {
        if (!music) return;

        if (music.paused) {
            try {
                await music.play();
                updateMusicButtons(true);
            } catch (error) {
                console.error(
                    "Unable to play music:",
                    error
                );
            }
        } else {
            music.pause();
            updateMusicButtons(false);
        }
    });
});
  // Scroll reveal: if observer support is unavailable, show everything.
  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add("is-visible"));
  }

  // Gallery: tries photo1.jpg through photo200.jpg and keeps only files that exist.
  // This means photo32.jpg, photo33.jpg, etc. work without editing this list.
  const wall = document.getElementById("memoryWall");
  const count = document.getElementById("photoCount");
  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const lightboxCounter = document.getElementById("lightboxCounter");
  const maxPhotoNumber = 200;
  const memories = [];
  let activePhoto = 0;

  function openPhoto(index) {
    if (!lightbox || !lightboxImage || !lightboxCaption || !memories.length) return;
    activePhoto = (index + memories.length) % memories.length;
    const memory = memories[activePhoto];
    lightboxImage.src = memory.src;
    lightboxImage.alt = memory.caption;
    lightboxCaption.textContent = memory.caption;
    if (lightboxCounter) lightboxCounter.textContent = `${activePhoto + 1} / ${memories.length}`;
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closePhoto() {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  function movePhoto(direction) { openPhoto(activePhoto + direction); }

  if (wall) {
    let loadedCount = 0;
    let checkedCount = 0;
    if (count) count.textContent = "Finding photos…";

    for (let number = 1; number <= maxPhotoNumber; number++) {
      const src = `images/photo${number}.jpg`;
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        checkedCount++;
        const caption = `memory no. ${number}`;
        memories.push({ src, caption, number });
        // Keep gallery order numeric even if images finish loading in a different order.
        memories.sort((a, b) => a.number - b.number);
        renderWall();
        if (count) count.textContent = loadedCount;
      };
      img.onerror = () => {
        checkedCount++;
        if (checkedCount === maxPhotoNumber && loadedCount === 0 && count) {
          count.textContent = "No photos found";
          wall.innerHTML = '<p class="empty-gallery">No photos were found. Check that your files are named photo1.jpg, photo2.jpg, etc., and are inside the images folder. If your first image is photo32.jpg, it will still be found.</p>';
        }
      };
      img.src = src;
    }

    function renderWall() {
      wall.innerHTML = "";
      memories.forEach((memory, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "wall-photo";
        button.style.setProperty("--tilt", `${[-2, 1.5, -1, 2, -1.5, 1][index % 6]}deg`);
        button.setAttribute("aria-label", `Open ${memory.caption}`);
        const image = document.createElement("img");
        image.src = memory.src;
        image.alt = memory.caption;
        image.loading = "lazy";
        const caption = document.createElement("span");
        caption.className = "wall-caption";
        caption.textContent = memory.caption;
        const number = document.createElement("span");
        number.className = "wall-number";
        number.textContent = String(memory.number).padStart(2, "0");
        button.append(image, caption, number);
        button.addEventListener("click", () => openPhoto(index));
        wall.appendChild(button);
      });
    }
  }

  if (lightbox) {
    lightbox.querySelector(".lightbox-close")?.addEventListener("click", closePhoto);
    lightbox.querySelector(".lightbox-prev")?.addEventListener("click", () => movePhoto(-1));
    lightbox.querySelector(".lightbox-next")?.addEventListener("click", () => movePhoto(1));
    lightbox.addEventListener("click", event => { if (event.target === lightbox) closePhoto(); });
    document.addEventListener("keydown", event => {
      if (!lightbox.classList.contains("open")) return;
      if (event.key === "Escape") closePhoto();
      if (event.key === "ArrowLeft") movePhoto(-1);
      if (event.key === "ArrowRight") movePhoto(1);
    });
  }
});
