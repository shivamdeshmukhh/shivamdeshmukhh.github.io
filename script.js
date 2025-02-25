document.addEventListener("DOMContentLoaded", () => {
    // Audio setup
    const bgMusic = document.getElementById("bg-music");
    
    // Try to play audio immediately
    bgMusic.play().catch(() => {
        // If autoplay was prevented, add click listener
        document.addEventListener('click', () => {
            bgMusic.play();
        }, { once: true });
    });

    // Keep track of audio state when tab visibility changes
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            bgMusic.pause();
        } else {
            bgMusic.play();
        }
    });

    const images = document.querySelectorAll(".draggable");
    let activeImage = null;
    let initialX, initialY;
    let currentX, currentY;
    let xOffset = 0, yOffset = 0;

    // Distribute images randomly in the gallery
    function distributeImages() {
        const gallery = document.querySelector(".gallery");
        const bounds = gallery.getBoundingClientRect();
        
        images.forEach(img => {
            const x = Math.random() * (bounds.width - img.offsetWidth);
            const y = Math.random() * (bounds.height - img.offsetHeight);
            img.style.transform = `translate(${x}px, ${y}px)`;
        });
    }

    function dragStart(e) {
        if (e.target.classList.contains("draggable")) {
            activeImage = e.target;
            initialX = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
            initialY = e.type === "touchstart" ? e.touches[0].clientY : e.clientY;

            const transform = window.getComputedStyle(activeImage).transform;
            const matrix = new DOMMatrix(transform);
            xOffset = matrix.m41;
            yOffset = matrix.m42;

            activeImage.style.zIndex = 1000;
        }
    }

    function dragEnd() {
        if (activeImage) {
            activeImage.style.zIndex = 1;
            activeImage = null;
        }
    }

    function drag(e) {
        if (activeImage) {
            e.preventDefault();
            
            currentX = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
            currentY = e.type === "touchmove" ? e.touches[0].clientY : e.clientY;

            const deltaX = currentX - initialX;
            const deltaY = currentY - initialY;

            activeImage.style.transform = 
                `translate(${xOffset + deltaX}px, ${yOffset + deltaY}px)`;
        }
    }

    // Simple slider functionality
    const brightnessSlider = document.getElementById("brightness");
    const blurSlider = document.getElementById("blur");

    function updateFilters() {
        const brightness = brightnessSlider.value;
        const blur = blurSlider.value;
        images.forEach(img => {
            img.style.filter = `brightness(${brightness}) blur(${blur}px)`;
        });
    }

    // Event listeners
    document.addEventListener("touchstart", dragStart, { passive: false });
    document.addEventListener("touchend", dragEnd);
    document.addEventListener("touchmove", drag, { passive: false });
    document.addEventListener("mousedown", dragStart);
    document.addEventListener("mouseup", dragEnd);
    document.addEventListener("mousemove", drag);

    brightnessSlider.addEventListener("input", updateFilters);
    blurSlider.addEventListener("input", updateFilters);

    document.getElementById("toggle-mode").addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
    });

    // Initialize
    distributeImages();
    window.addEventListener("resize", distributeImages);
});
