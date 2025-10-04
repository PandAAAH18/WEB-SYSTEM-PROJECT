// =========================================================
// Utility Functions
// =========================================================

/**
 * Formats seconds into a "M:SS" string.
 * @param {number} seconds - The time in seconds.
 * @returns {string} - The formatted time string.
 */
const formatTime = (seconds) => {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec.toString().padStart(2, "0")}`;
};

// =========================================================
// Spotlight Grid Mouse Interactions
// =========================================================

const gridController = (() => {
  const grid = document.querySelector(".grid-overlay");
  const breathingGrid = document.querySelector(".breathing-grid");
  const modelViewer = document.querySelector("model-viewer");

  if (!grid || !breathingGrid) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let spotX = mouseX;
  let spotY = mouseY;
  let radius = 0;
  let targetRadius = 0;

  /**
   * Handles mouse movement for grid and 3D model perspective.
   * @param {MouseEvent} e
   */
  const handleMouse = (e) => {
    // Grid Parallax Effect
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    grid.style.transform = `translate(${x}px,${y}px)`;
    breathingGrid.style.transform = `translate(${x * 0.5}px,${y * 0.5}px)`;

    // Spotlight Center and Radius
    mouseX = e.pageX;
    mouseY = e.pageY;
    const speed = Math.hypot(e.movementX || 0, e.movementY || 0);
    targetRadius = 120 + Math.min(speed * 0.5, 150);

    // 3D Model Camera Orbit
    if (modelViewer) {
      const normX = (e.clientX / window.innerWidth - 0.5) * 2;
      const normY = (e.clientY / window.innerHeight - 0.5) * 2;
      modelViewer.cameraOrbit = `${normX * 30}deg ${90 - normY * 30}deg auto`;
    }
  };

  /**
   * Smoothly animates the spotlight mask position and radius using requestAnimationFrame.
   */
  const updateMask = () => {
    // Smoothed movement for spotlight center (spotX, spotY)
    spotX += (mouseX - spotX) * 0.08;
    spotY += (mouseY - spotY) * 0.08;
    // Smoothed radius change
    radius += (targetRadius - radius) * 0.1;

    grid.style.setProperty("--mouse-x", `${spotX}px`);
    grid.style.setProperty("--mouse-y", `${spotY}px`);
    grid.style.setProperty("--radius", `${radius}px`);

    window.requestAnimationFrame(updateMask);
  };

  window.addEventListener("mousemove", handleMouse);
  window.requestAnimationFrame(updateMask);
})();

// =========================================================
// Typewriter Effect
// =========================================================

/**
 * Initializes the typewriter effect on a single element.
 * @param {HTMLElement} el - The element to apply the typewriter effect to.
 */
const initTypewriter = (el) => {
  const texts = JSON.parse(el.getAttribute("data-texts") || "[]");
  const loop = el.getAttribute("data-loop") === "true";
  if (texts.length === 0) return;


  const textDisplayEl = el.querySelector('span') || el; 

  let textIndex = 0;
  let charIndex = 0;
  let isTyping = true;
  const TYPING_SPEED = 120;
  const DELETING_SPEED = 60;
  const PAUSE_AFTER_TYPE = 1200;
  const PAUSE_AFTER_DELETE = 500;

  const tick = () => {
    const currentText = texts[textIndex] || "";

    if (isTyping) {
      if (charIndex < currentText.length) {
        textDisplayEl.textContent += currentText.charAt(charIndex++);
        setTimeout(tick, TYPING_SPEED);
      } else {
        isTyping = false;
        setTimeout(tick, PAUSE_AFTER_TYPE);
      }
    } else { // Deleting
      if (charIndex > 0) {
        textDisplayEl.textContent = currentText.substring(0, --charIndex);
        setTimeout(tick, DELETING_SPEED);
      } else {
        isTyping = true;
        textIndex = (textIndex + 1) % texts.length;
        if (!loop && textIndex === 0) return;
        setTimeout(tick, PAUSE_AFTER_DELETE);
      }
    }
  };
  tick();
};

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".typewriter").forEach(initTypewriter);
});
// ---------------------------------------------------------

// =========================================================
// Parallax Scroll Effects
// =========================================================

const parallaxController = (() => {
  const aboutIntro = document.getElementById("about-intro");
  const aboutTitle = document.getElementById("about-title");
  const aboutSchool = document.getElementById("about-school");
  const aboutSchoolTitle = document.getElementById("about-school-title");
  const parallaxBg = document.querySelector(".parallax-bg"); // From the last section

  /**
   * Applies parallax effects based on scroll position.
   */
  const animateParallax = () => {
    const scrollY = window.scrollY;

    // About Section Title Parallax
    if (aboutIntro && aboutTitle) {
      const offset = aboutIntro.offsetTop;
      const localScroll = scrollY - offset;
      if (localScroll >= 0) {
        aboutTitle.style.transform = `translateY(${localScroll * 0.3}px)`;
      } else {
        aboutTitle.style.transform = `translateY(0px)`;
      }
    }

    // About School Section Parallax
    if (aboutSchool && aboutSchoolTitle) {
      const offset = aboutSchool.offsetTop;
      const localScroll = scrollY - offset;
      if (localScroll >= 0) {
        aboutSchoolTitle.style.transform = `translateY(${localScroll * 0.4}px)`;
        aboutSchool.style.backgroundPositionY = `${localScroll * 0.2}px`;
      } else {
         aboutSchoolTitle.style.transform = `translateY(0px)`;
         aboutSchool.style.backgroundPositionY = `0px`;
      }
    }

    // Generic Parallax Background
    if (parallaxBg) {
        parallaxBg.style.transform = `translateY(${scrollY * 0.4}px)`;
    }

    window.requestAnimationFrame(animateParallax);
  };

  window.requestAnimationFrame(animateParallax);
})();

// =========================================================
// Intersection Observer Helper
// =========================================================

/**
 * Creates an IntersectionObserver to toggle a class on intersecting elements.
 * @param {string} className - The class to toggle (e.g., 'visible', 'active').
 * @param {object} options - Options for the IntersectionObserver.
 * @param {boolean} [removeClassOnExit=true] - Whether to remove the class when exiting the viewport.
 * @returns {IntersectionObserver}
 */
const createObserver = (className, options, removeClassOnExit = true) => {
    return new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add(className);
            } else if (removeClassOnExit) {
                entry.target.classList.remove(className);
            }
        });
    }, options);
};

// =========================================================
// Visibility Observers (Fade, Member Text, Team Member)
// =========================================================

const visibilityController = (() => {
    // 1. Fade/Visibility Observer (removes 'hidden' and adds 'visible')
    const fadeEls = document.querySelectorAll(".fade-text");
    const fadeObs = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                entry.target.classList.remove("hidden");
            } else {
                // Keep the 'hidden' state if needed, but remove 'visible'
                entry.target.classList.remove("visible");
                // Original logic: entry.target.classList.add("hidden"); - keeping this for original behavior
                entry.target.classList.add("hidden");
            }
        });
    }, { threshold: 0.25 });
    fadeEls.forEach((el) => fadeObs.observe(el));


    // 2. Member Text Observer (adds 'visible') - simplified using helper
    const memberTexts = document.querySelectorAll(".member-text");
    const memberObs = createObserver("visible", { threshold: 0.2 }, false); // Don't remove on exit
    memberTexts.forEach(el => memberObs.observe(el));

    // 3. Team Member Observer (adds 'visible') - simplified using helper
    const teamMembers = document.querySelectorAll(".team-member");
    const teamObs = createObserver("visible", { threshold: 0.2 }, false); // Don't remove on exit
    teamMembers.forEach(el => teamObs.observe(el));
})();

// =========================================================
// Title and Box Animations
// =========================================================

const animationObservers = (() => {
    const coreValuesTitle = document.querySelector("#core-values .title");
    const letters = document.querySelectorAll("#core-values .title span");

    // Core Values Title Letter Animation
    const letterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                letters.forEach((span, i) => {
                    setTimeout(() => span.classList.add("active"), i * 100);
                });
            } else {
                letters.forEach(span => span.classList.remove("active"));
            }
        });
    }, { threshold: 0.5 });
    if (document.querySelector("#core-values")) {
        letterObserver.observe(document.querySelector("#core-values"));
    }


    // Value Boxes Animation
    const valueBoxes = document.querySelectorAll(".value-box");
    const boxObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                if (coreValuesTitle) coreValuesTitle.classList.add("highlight");
            } else {
                entry.target.classList.remove("active");
                if (coreValuesTitle) coreValuesTitle.classList.remove("highlight");
            }
        });
    }, { threshold: 0.3 });
    valueBoxes.forEach(box => boxObserver.observe(box));

    // Mission & Vision boxes
    const mvBoxes = document.querySelectorAll(".mv-box");
    const mvObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                // Animate letters inside the mv-title
                entry.target.querySelectorAll(".mv-title span").forEach((span, i) => {
                    setTimeout(() => span.classList.add("active"), i * 100);
                });
            } else {
                entry.target.classList.remove("active");
                entry.target.querySelectorAll(".mv-title span").forEach(span => span.classList.remove("active"));
            }
        });
    }, { threshold: 0.3 });
    mvBoxes.forEach(box => mvObserver.observe(box));
})();


// =========================================================
// Music Player + Team Card Interactions
// =========================================================


const musicPlayerController = (() => {
  const musicPlayer = document.getElementById("music-player");
  const playPauseBtn = document.getElementById("play-pause");
  const progressBar = document.getElementById("progress-bar");
  const timeDisplay = document.getElementById("time");
  const songTitle = document.getElementById("song-title");
  const cardContainer = document.querySelector(".cards-container"); // Assuming cards are in a container

  let currentAudio = null;
  let isPlaying = false;
  let activeCard = null; // Store the currently active card element

  if (!musicPlayer || !playPauseBtn) return;

  /**
   * Clears the current audio state and hides the player.
   */
  const stopAndHidePlayer = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
    musicPlayer.classList.add("hidden");
    isPlaying = false;
    playPauseBtn.textContent = "▶";
    activeCard = null;
  };

  /**
   * Plays the audio for a given card.
   * @param {HTMLElement} card - The team member card.
   * @param {string} musicSrc - The audio source URL.
   */
  const playCardMusic = (card, musicSrc) => {
    // 1. Stop current and prepare new
    stopAndHidePlayer();
    activeCard = card;

    // 2. Play new audio
    currentAudio = new Audio(musicSrc);
    currentAudio.volume = 0.5; // Optional: set an initial volume
    currentAudio.play().catch(err => console.error("Autoplay blocked:", err));
    isPlaying = true;

    // 3. Update player UI
    musicPlayer.classList.remove("hidden");
    songTitle.textContent = musicSrc.split("/").pop();
    playPauseBtn.textContent = "⏸";

    // 4. Attach Audio Events
    currentAudio.addEventListener("loadedmetadata", () => {
      progressBar.max = 100;
      timeDisplay.textContent = `0:00 / ${formatTime(currentAudio.duration)}`;
    });
    currentAudio.addEventListener("ended", () => {
      isPlaying = false;
      playPauseBtn.textContent = "▶";
    });

    // 5. Start progress animation
    updateProgress();
  };

  /**
   * Updates the progress bar and time display via requestAnimationFrame.
   */
  const updateProgress = () => {
    if (currentAudio && isPlaying) {
      const progress = (currentAudio.currentTime / currentAudio.duration) * 100;
      progressBar.value = progress || 0;
      timeDisplay.textContent = `${formatTime(currentAudio.currentTime)} / ${formatTime(currentAudio.duration)}`;
      window.requestAnimationFrame(updateProgress);
    }
  };

  /**
   * Handles the card click logic.
   * @param {HTMLElement} card - The clicked card element.
   */
  const handleCardClick = (card) => {
    const musicSrc = card.getAttribute("data-music");

    if (!card.classList.contains("animate")) {
      // 1. Close any previously active card first
      if (activeCard && activeCard !== card) {
        handleCardClick(activeCard);
      }

      // 2. Play music and open card
      if (musicSrc) {
        playCardMusic(card, musicSrc);
      }

      // 3. Card open animation
      card.classList.add("animate");
      setTimeout(() => {
        card.classList.add("show-text");
      }, 1200);

    } else {
      // 1. Close card and stop audio
      stopAndHidePlayer();

      // 2. Close animation
      card.classList.remove("show-text");
      card.classList.remove("animate");
      card.classList.add("closing");

      setTimeout(() => {
        card.classList.remove("closing");
      }, 1000);
    }
  };


  // --- Event Listeners ---

  // Use event delegation for cards to be more efficient
  if (cardContainer) {
    cardContainer.addEventListener("click", (e) => {
      let card = e.target.closest(".card");
      if (card) {
        handleCardClick(card);
      }
    });
  } else {
     document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", () => handleCardClick(card));
     });
  }


  // Player controls
  playPauseBtn.addEventListener("click", () => {
    if (!currentAudio) return;

    if (isPlaying) {
      currentAudio.pause();
      isPlaying = false;
      playPauseBtn.textContent = "▶";
    } else {
      currentAudio.play();
      isPlaying = true;
      playPauseBtn.textContent = "⏸";
      updateProgress(); // Restart RAF loop
    }
  });

  progressBar.addEventListener("input", () => {
    if (currentAudio && currentAudio.duration) {
      currentAudio.currentTime = (progressBar.value / 100) * currentAudio.duration;
    }
  });

})();


// =========================================================
// Profile Overlay Interactions
// =========================================================

const profileOverlayController = (() => {
  // Profile overlay elements
  const overlay = document.getElementById("learnMoreOverlay");
  const closeOverlayBtn = document.getElementById("closeOverlay");
  const profileModel = document.getElementById("profileModel");
  const profileName = document.getElementById("profileName");
  const profileRole = document.getElementById("profileRole");

  // Bio elements
  const bioBday = document.getElementById("bio-bday");
  const bioContact = document.getElementById("bio-contact");
  const bioSpecialty = document.getElementById("bio-special");

  // Stat elements
  const statGender = document.getElementById("stat-gender");
  const statAge = document.getElementById("stat-age");
  const statHeight = document.getElementById("stat-height");
  const statWeight = document.getElementById("stat-weight");

  const memberData = {
    "Angelo Jesus Y. Caballero": {
      model: "model/source/Caballero.glb",
      role: "| FULL STACK DEVELOPER |",
      Bday: "03/18/2006",
      Contact: "ajcaballero@kld.edu.ph",
      Specialty: "FullStack",
      stats: {
        gender: "Male", age: "19", height: "175cm", weight: "60kg",
      }
    },
    "Alexandra Lykemae T. Concepcion": {
      model: "model/source/Concepcion.glb",
      role: "| PROJECT MANAGER |",
      Bday: "09/08/2005",
      Contact: "alconcepcion@kld.edu.ph",
      Specialty: "Support specialist",
      stats: {
        gender: "Female", age: "20", height: "150cm", weight: "50kg",
      }
    },
    "Shairil Kriztel O. Capungcol": {
      model: "model/source/Capungcol.glb",
      role: "| BACK END DEVELOPER |",
      Bday: "03/18/2006",
      Contact: "skcapungcol@kld.edu.ph", // Corrected dummy contact
      Specialty: "Back-end", // Corrected specialty
      stats: {
        gender: "Female", age: "20", height: "149cm", weight: "49kg",
      }
    },
    "Kurt Andrew F. Dapat": {
      model: "model/source/Dapat.glb",
      role: "| DESIGNER |",
      Bday: "03/18/2006",
      Contact: "kadapat@kld.edu.ph", // Corrected dummy contact
      Specialty: "UI/UX Design", // Corrected specialty
      stats: {
        gender: "Male", age: "18", height: "154cm", weight: "43kg",
      }
    },
    "Jovan C. Certifico": {
      model: "model/source/Certifico.glb",
      role: "| FRONT END DEVELOPER |",
      Bday: "03/18/2006",
      Contact: "jcertifico@kld.edu.ph", // Corrected dummy contact
      Specialty: "Front-end", // Corrected specialty
      stats: {
        gender: "Male", age: "19", height: "162cm", weight: "53kg",
      }
    }
  };

  /**
   * Opens the overlay and populates it with member data.
   * @param {string} name - The name of the team member.
   */
  const openOverlay = (name) => {
    const data = memberData[name];

    if (!data || !overlay) return;

    // CENTER PANEL UPDATE
    profileName.textContent = name;
    profileRole.textContent = data.role;
    // Set 'src' attribute for the <model-viewer>
    if (profileModel) profileModel.setAttribute("src", data.model);

    // LEFT PANEL (BIO) UPDATE
    if (bioBday) bioBday.textContent = data.Bday;
    if (bioContact) bioContact.textContent = data.Contact;
    if (bioSpecialty) bioSpecialty.textContent = data.Specialty;

    // RIGHT PANEL (STATS) UPDATE
    const stats = data.stats;
    if (statGender) statGender.textContent = stats.gender;
    if (statAge) statAge.textContent = stats.age;
    if (statHeight) statHeight.textContent = stats.height;
    if (statWeight) statWeight.textContent = stats.weight;

    overlay.classList.add("active");
  };

  /**
   * Closes the profile overlay.
   */
  const closeOverlay = () => {
    if (overlay) overlay.classList.remove("active");
  };

  // --- Event Listeners ---

  // Event delegation or direct listeners for member-text elements
  document.querySelectorAll(".member-text").forEach(member => {
    member.addEventListener("click", (e) => {
      // Find the h3 content, which holds the name
      const nameElement = member.querySelector("h3");
      if (nameElement) {
        openOverlay(nameElement.textContent.trim());
      }
    });
  });

  // Close overlay listener
  if (closeOverlayBtn) {
    closeOverlayBtn.addEventListener("click", closeOverlay);
  }
})();


const mottoWords = document.querySelectorAll(".motto-word");
const mottoObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      mottoWords.forEach((word, i) => {
        setTimeout(() => {
          word.classList.add("visible");
        }, i * 400); // delay each word
      });
    } else {
      // Reset when scrolling back up
      mottoWords.forEach(word => word.classList.remove("visible"));
    }
  });
}, { threshold: 0.5 });

if (mottoWords.length > 0) {
  mottoObs.observe(document.querySelector(".motto"));
}