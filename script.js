document.addEventListener("DOMContentLoaded", () => {
    const images = document.querySelectorAll(".draggable");
    let activeImage = null;
    let offsetX, offsetY;
    let heartInterval;
    let animationFrameId;

    // Debounce function
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function startDrag(e) {
        e.preventDefault();
        activeImage = e.target;
        let touch = e.touches ? e.touches[0] : e;
        offsetX = touch.clientX - activeImage.getBoundingClientRect().left;
        offsetY = touch.clientY - activeImage.getBoundingClientRect().top;
        activeImage.style.cursor = "grabbing";
        activeImage.style.position = "absolute";
    }

    function moveDrag(e) {
        if (!activeImage) return;
        e.preventDefault();
        
        // Use requestAnimationFrame for smooth dragging
        cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(() => {
            let touch = e.touches ? e.touches[0] : e;
            activeImage.style.left = `${touch.clientX - offsetX}px`;
            activeImage.style.top = `${touch.clientY - offsetY}px`;
        });
    }

    function stopDrag() {
        if (activeImage) {
            activeImage.style.cursor = "grab";
            activeImage = null;
        }
        cancelAnimationFrame(animationFrameId);
    }

    // Optimized heart creation with object pooling
    const heartPool = new Set();
    const maxHearts = 20;

    function createHeart() {
        if (heartPool.size >= maxHearts) return;
        
        const heart = document.createElement("div");
        heart.classList.add("heart");
        heart.innerHTML = "❤";
        heart.style.left = `${Math.random() * 100}vw`;
        heart.style.fontSize = `${Math.random() * 25 + 15}px`;
        document.body.appendChild(heart);
        heartPool.add(heart);

        setTimeout(() => {
            document.body.removeChild(heart);
            heartPool.delete(heart);
        }, 5000);
    }

    // Optimized filter updates with debouncing
    const updateFilters = debounce((brightness, blur) => {
        requestAnimationFrame(() => {
            images.forEach(img => {
                img.style.filter = `brightness(${brightness}) blur(${blur}px)`;
            });
        });
    }, 16); // ~1 frame at 60fps

    // Event Listeners
    images.forEach(img => {
        img.addEventListener("mousedown", startDrag, { passive: false });
        img.addEventListener("touchstart", startDrag, { passive: false });
        // Optimize image loading
        img.loading = "lazy";
    });

    document.addEventListener("mousemove", moveDrag, { passive: false });
    document.addEventListener("touchmove", moveDrag, { passive: false });
    document.addEventListener("mouseup", stopDrag);
    document.addEventListener("touchend", stopDrag);

    // Slider controls
    const brightnessSlider = document.getElementById("brightness");
    const blurSlider = document.getElementById("blur");
    
    function handleSliderInput() {
        updateFilters(brightnessSlider.value, blurSlider.value);
    }

    brightnessSlider.addEventListener("input", handleSliderInput);
    blurSlider.addEventListener("input", handleSliderInput);

    // Start hearts animation with controlled interval
    heartInterval = setInterval(createHeart, 500);

    // Cleanup function
    function cleanup() {
        clearInterval(heartInterval);
        heartPool.forEach(heart => heart.remove());
        heartPool.clear();
        cancelAnimationFrame(animationFrameId);
    }

    // Clean up when page is hidden
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            cleanup();
        } else {
            heartInterval = setInterval(createHeart, 500);
        }
    });

    document.getElementById("toggle-mode").addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
    });

    setTimeout(() => {
        document.getElementById("message").style.display = "block";
        document.getElementById("bg-music").play();
    }, 2000);

    document.getElementById("close-message").addEventListener("click", () => {
        document.getElementById("message").style.display = "none";
    });

    // Music autoplay setup
    const bgMusic = document.getElementById("bg-music");
    
    // Function to handle user interaction and play music
    function startMusic() {
        bgMusic.play().catch(error => {
            console.log("Autoplay prevented:", error);
        });
        document.removeEventListener('click', startMusic);
    }

    // Add click listener to start music on first user interaction
    document.addEventListener('click', startMusic);

    // Try immediate autoplay (might be blocked by browser)
    bgMusic.play().catch(error => {
        console.log("Waiting for user interaction to play music");
    });
});
