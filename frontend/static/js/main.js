// Helper to get API URL
const API_BASE = `${window.location.origin}/api`;

// Smart Background System
class SmartBackgroundSystem {
    constructor() {
        this.images = [`${window.location.origin}/api/images/background.jpg`];
        this.currentIndex = 0;
        this.fallbackImages = [
            `${window.location.origin}/api/images/background.jpg`
        ];
        this.init();
    }

    async init() {
        // Skip dynamic load, use fixed background
        this.createBackgroundCarousel();
        // this.startImageRotation();
        this.createParticles();
        this.createInteractiveElements();
    }

    async loadLocalImages() {
        try {
            const response = await fetch(`${API_BASE}/images/list`);
            const data = await response.json();
            console.log('Images API response:', data);
            if (data.images && data.images.length > 0) {
                // Test if images actually load
                const validImages = [];
                for (const img of data.images) {
                    const imgUrl = img.url.startsWith('http') ? img.url : `http://localhost:5000${img.url}`;
                    console.log('Testing image:', imgUrl);
                    if (await this.testImageLoad(imgUrl)) {
                        console.log('Image loaded successfully:', imgUrl);
                        validImages.push(imgUrl);
                    } else {
                        console.log('Image failed to load:', imgUrl);
                    }
                }
                this.images = validImages.length > 0 ? validImages : this.fallbackImages;
                console.log('Using images:', this.images);
            } else {
                console.log('No images found, using fallbacks');
                this.images = this.fallbackImages;
            }
        } catch (error) {
            console.log('Error loading images, using fallbacks:', error);
            this.images = this.fallbackImages;
        }

        // Ensure we have at least some images
        if (this.images.length === 0) {
            console.log('No images available, using fallbacks');
            this.images = this.fallbackImages;
        }
    }

    testImageLoad(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
            // Timeout after 3 seconds
            setTimeout(() => resolve(false), 3000);
        });
    }

    createBackgroundCarousel() {
        // Remove existing carousel if any
        const existing = document.querySelector('.bg-carousel');
        if (existing) existing.remove();

        const carousel = document.createElement('div');
        carousel.className = 'bg-carousel';
        document.body.insertBefore(carousel, document.body.firstChild);

        this.images.forEach((imgUrl, index) => {
            const item = document.createElement('div');
            item.className = 'bg-carousel-item';
            // Ensure full URL
            const fullUrl = imgUrl.startsWith('http') ? imgUrl : `http://localhost:5000${imgUrl}`;
            item.style.backgroundImage = `url(${fullUrl})`;
            item.style.backgroundSize = 'cover';
            item.style.backgroundPosition = 'center';
            item.style.backgroundRepeat = 'no-repeat';
            if (index === 0) item.classList.add('active');
            carousel.appendChild(item);
        });

        this.carouselItems = carousel.querySelectorAll('.bg-carousel-item');
    }

    startImageRotation() {
        if (this.images.length <= 1) return;

        setInterval(() => {
            this.carouselItems[this.currentIndex].classList.remove('active');
            this.currentIndex = (this.currentIndex + 1) % this.images.length;
            this.carouselItems[this.currentIndex].classList.add('active');
        }, 8000); // Change image every 8 seconds
    }

    createParticles() {
        const container = document.createElement('div');
        container.className = 'particles-container';
        document.body.appendChild(container);

        const particleCount = 15;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';

            const size = Math.random() * 60 + 20;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 20}s`;
            particle.style.animationDuration = `${15 + Math.random() * 10}s`;

            container.appendChild(particle);
        }
    }

    createInteractiveElements() {
        // Create floating icons/elements
        const icons = ['🌾', '🌱', '🌿', '🌽', '🌻'];
        icons.forEach((icon, index) => {
            const element = document.createElement('div');
            element.className = 'interactive-element';
            element.textContent = icon;
            element.style.fontSize = '30px';
            element.style.left = `${20 + index * 15}%`;
            element.style.top = `${30 + index * 10}%`;
            element.style.opacity = '0.1';

            // Animate on mouse move
            document.addEventListener('mousemove', (e) => {
                const x = e.clientX / window.innerWidth;
                const y = e.clientY / window.innerHeight;
                element.style.transform = `translate(${(x - 0.5) * 50}px, ${(y - 0.5) * 50}px)`;
            });

            document.body.appendChild(element);
        });
    }
}

// Image Gallery System
class ImageGallery {
    constructor(containerId, customImages = null) {
        this.container = document.getElementById(containerId);
        this.images = [];
        this.customImages = customImages;
        this.modalCreated = false;
        this.init();
    }

    async init() {
        if (this.customImages) {
            this.images = this.customImages;
            this.render();
            if (!this.modalCreated) {
                this.createModal();
                this.modalCreated = true;
            }
        } else {
            await this.loadImages();
            this.render();
            if (!this.modalCreated) {
                this.createModal();
                this.modalCreated = true;
            }
        }
    }

    async loadImages() {
        try {
            const response = await fetch(`${API_BASE}/images/list`);
            const data = await response.json();
            if (data.images && data.images.length > 0) {
                // Test and filter valid images
                const validImages = [];
                for (const img of data.images) {
                    const imgUrl = img.url.startsWith('http') ? img.url : `http://localhost:5000${img.url}`;
                    if (await this.testImageLoad(imgUrl)) {
                        validImages.push({ ...img, url: imgUrl });
                    }
                }
                this.images = validImages.length > 0 ? validImages : this.getFallbackImages();
            } else {
                this.images = this.getFallbackImages();
            }
        } catch (error) {
            console.log('Using fallback images:', error);
            this.images = this.getFallbackImages();
        }

        if (this.images.length === 0) {
            this.images = this.getFallbackImages();
        }
    }

    getFallbackImages() {
        return [
            { name: 'Farm Field', url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&h=600&fit=crop' },
            { name: 'Crop Growth', url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&h=600&fit=crop' },
            { name: 'Agriculture', url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop' },
            { name: 'Farm Life', url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop' },
            { name: 'Green Fields', url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=600&fit=crop' },
            { name: 'Crop Harvest', url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=600&fit=crop' }
        ];
    }

    testImageLoad(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
            setTimeout(() => resolve(false), 3000);
        });
    }

    render() {
        if (!this.container) return;

        if (this.images.length === 0) {
            this.container.innerHTML = '<p style="text-align: center; color: #666;">Loading images...</p>';
            return;
        }

        this.container.innerHTML = this.images.map((img, index) => {
            const imgUrl = img.url.startsWith('http') ? img.url : `http://localhost:5000${img.url}`;
            return `
                <div class="gallery-item" data-index="${index}">
                    <img src="${imgUrl}" alt="${img.name}" loading="lazy" 
                         onerror="this.src='https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&h=600&fit=crop'">
                    <div class="gallery-overlay">
                        <h4>${img.name}</h4>
                    </div>
                </div>
            `;
        }).join('');

        // Add click handlers
        this.container.querySelectorAll('.gallery-item').forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.index);
                this.openModal(index);
            });
        });
    }

    createModal() {
        // Only create modal if it doesn't exist
        if (document.getElementById('image-modal')) return;

        const modal = document.createElement('div');
        modal.className = 'image-modal';
        modal.id = 'image-modal';
        modal.innerHTML = `
            <span class="modal-close">&times;</span>
            <img class="modal-content" id="modal-image" src="" alt="">
        `;
        document.body.appendChild(modal);

        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => this.closeModal());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
        });
    }

    openModal(index) {
        const modal = document.getElementById('image-modal');
        const modalImg = document.getElementById('modal-image');
        if (modal && modalImg && this.images[index]) {
            const imgUrl = this.images[index].url.startsWith('http')
                ? this.images[index].url
                : `http://localhost:5000${this.images[index].url}`;
            modalImg.src = imgUrl;
            modalImg.alt = this.images[index].name || 'Image';
            modal.classList.add('active');
        }
    }

    closeModal() {
        const modal = document.getElementById('image-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    }
}

// Preview Image function
function previewImage(event) {
    const reader = new FileReader();
    reader.onload = function () {
        const output = document.getElementById('image-preview');
        output.src = reader.result;
        output.style.display = 'block';
    };
    reader.readAsDataURL(event.target.files[0]);
}

async function predict(endpoint, formId, resultId) {
    const form = document.getElementById(formId);
    const resultDiv = document.getElementById(resultId);
    const submitBtn = form.querySelector('button[type="submit"]');

    submitBtn.textContent = "Analyzing...";
    submitBtn.disabled = true;

    try {
        let options = { method: 'POST' };

        // Handle Image Upload vs JSON Data
        if (endpoint === 'disease') {
            const formData = new FormData(form);
            // No Content-Type header needed for FormData, browser sets it with boundary
            options.body = formData;
        } else {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            options.headers = { 'Content-Type': 'application/json' };
            options.body = JSON.stringify(data);
        }

        const response = await fetch(`${API_BASE}/predict/${endpoint}`, options);
        const result = await response.json();

        if (response.ok) {
            resultDiv.style.display = 'block';
            resultDiv.style.backgroundColor = '#e8f5e9';
            resultDiv.style.color = '#2e7d32';

            if (endpoint === 'fertilizer') {
                resultDiv.innerHTML = `Recommended Fertilizer: <h3>${result.prediction}</h3>`;
            } else if (endpoint === 'recommend-crop') {
                resultDiv.innerHTML = `Best Crop to Grow: <h3>${result.prediction}</h3>`;
            } else if (endpoint === 'yield') {
                resultDiv.innerHTML = `Predicted Yield: <h3>${result.prediction} Kg/Ha</h3>`;
            } else if (endpoint === 'disease') {
                resultDiv.innerHTML = `
                    <div style="text-align: left;">
                        <h3 style="margin-bottom: 10px; border-bottom: 2px solid #2e7d32; display: inline-block;">Detection Results</h3>
                        <p style="font-size: 1.2em;">Diagnosis: <strong style="color: #2e7d32;">${result.prediction}</strong></p>
                        
                        <div style="margin-top: 20px; background: #fff; padding: 15px; border-radius: 8px; border-left: 5px solid #ff9800;">
                            <h4 style="color: #ff9800;"><i class="fas fa-exclamation-triangle"></i> Severity & Impact</h4>
                            <p>${result.impact}</p>
                        </div>
                        
                        <div style="margin-top: 15px; background: #fff; padding: 15px; border-radius: 8px; border-left: 5px solid #2196f3;">
                            <h4 style="color: #2196f3;"><i class="fas fa-lightbulb"></i> Recommended Action</h4>
                            <p>${result.advice}</p>
                        </div>
                        
                        <div style="margin-top: 15px; text-align: right;">
                            <small style="color: grey; font-style: italic;">${result.message}</small>
                        </div>
                    </div>
                `;
            }
        } else {
            throw new Error(result.error || 'Prediction failed');
        }
    } catch (error) {
        resultDiv.style.display = 'block';
        resultDiv.style.backgroundColor = '#ffebee';
        resultDiv.style.color = '#c62828';
        resultDiv.textContent = `Error: ${error.message}`;
    } finally {
        submitBtn.textContent = "Submit";
        submitBtn.disabled = false;
    }
}

async function loadClimateCharts() {
    if (!document.getElementById('climateChart')) return;

    try {
        const response = await fetch(`${API_BASE}/climate-data`);
        const data = await response.json();

        if (!response.ok) throw new Error(data.error);

        const ctx = document.getElementById('climateChart').getContext('2d');
        const years = data.map(d => d.Year);
        const temp = data.map(d => d.Average_Temperature_C);
        const rain = data.map(d => d.Total_Precipitation_mm);

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: years,
                datasets: [
                    {
                        label: 'Avg Temp (°C)',
                        data: temp,
                        borderColor: '#ff9800',
                        yAxisID: 'y',
                    },
                    {
                        label: 'Precipitation (mm)',
                        data: rain,
                        borderColor: '#2196f3',
                        yAxisID: 'y1',
                    }
                ]
            },
            options: {
                responsive: true,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: { display: true, text: 'Temperature (°C)' }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: { display: true, text: 'Precipitation (mm)' },
                        grid: {
                            drawOnChartArea: false,
                        },
                    },
                }
            }
        });

    } catch (error) {
        console.error("Error loading climate data", error);
    }
}

// Chatbot Logic
function initChatbot() {
    // Inject HTML
    const chatHTML = `
        <div class="chat-widget">
            <button class="chat-btn" id="chat-toggle">
                <i class="fas fa-robot"></i>
            </button>
        </div>
        <div class="chat-window" id="chat-window">
            <div class="chat-header">
                <span><i class="fas fa-seedling"></i> Farm Assistant</span>
                <button class="chat-close" id="chat-close">&times;</button>
            </div>
            <div class="chat-messages" id="chat-messages">
                <div class="message bot-message">Hello! I'm your AI Farm Assistant. Ask me anything about crops, fertilizers, or disease!</div>
            </div>
            <form class="chat-input-area" id="chat-form">
                <input type="text" class="chat-input" id="chat-input" placeholder="Type a message..." required>
                <button type="submit" class="chat-send"><i class="fas fa-paper-plane"></i></button>
            </form>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', chatHTML);

    // Elements
    const chatToggle = document.getElementById('chat-toggle');
    const chatWindow = document.getElementById('chat-window');
    const chatClose = document.getElementById('chat-close');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');

    // Toggle Chat
    function toggleChat() {
        if (chatWindow.style.display === 'flex') {
            chatWindow.style.display = 'none';
        } else {
            chatWindow.style.display = 'flex';
            chatInput.focus();
        }
    }

    chatToggle.addEventListener('click', toggleChat);
    chatClose.addEventListener('click', toggleChat);

    // Add Message to UI
    function addMessage(text, sender) {
        const div = document.createElement('div');
        div.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');
        div.innerHTML = text; // Allow HTML for links
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Handle Submit
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = chatInput.value.trim();
        if (!message) return;

        // User Message
        addMessage(message, 'user');
        chatInput.value = '';

        // API Call
        try {
            // Show "Analysing..." message with countdown
            const typingDiv = document.createElement('div');
            typingDiv.classList.add('message', 'bot-message', 'typing-indicator');
            let timeLeft = 3;
            typingDiv.innerHTML = `Analysing... ${timeLeft}s`;
            chatMessages.appendChild(typingDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            const countdownInterval = setInterval(() => {
                timeLeft--;
                if (timeLeft > 0) {
                    typingDiv.innerHTML = `Analysing... ${timeLeft}s`;
                } else {
                    clearInterval(countdownInterval);
                }
            }, 1000);

            const response = await fetch(`${API_BASE}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: message })
            });
            const data = await response.json();

            // Wait for the full 3 seconds if API was faster
            setTimeout(() => {
                clearInterval(countdownInterval);
                typingDiv.remove();
                addMessage(data.response || "Sorry, I didn't understand that.", 'bot');
            }, 3000);
        } catch (error) {
            setTimeout(() => {
                const typingElements = chatMessages.querySelectorAll('.typing-indicator');
                typingElements.forEach(el => el.remove());
                addMessage("Error connecting to AI.", 'bot');
            }, 3000);
        }
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Smart Background System
    new SmartBackgroundSystem();

    // Initialize Image Gallery if container exists
    const galleryContainer = document.getElementById('image-gallery');
    if (galleryContainer) {
        new ImageGallery('image-gallery');
    }

    initChatbot(); // Initialize Chat
    loadClimateCharts();

    const fertilizerForm = document.getElementById('fertilizer-form');
    if (fertilizerForm) {
        fertilizerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            predict('fertilizer', 'fertilizer-form', 'result');
        });
    }

    const recommendForm = document.getElementById('recommend-form');
    if (recommendForm) {
        recommendForm.addEventListener('submit', (e) => {
            e.preventDefault();
            predict('recommend-crop', 'recommend-form', 'result');
        });
    }

    const yieldForm = document.getElementById('yield-form');
    if (yieldForm) {
        yieldForm.addEventListener('submit', (e) => {
            e.preventDefault();
            predict('yield', 'yield-form', 'result');
        });
    }

    const diseaseForm = document.getElementById('disease-form');
    if (diseaseForm) {
        diseaseForm.addEventListener('submit', (e) => {
            e.preventDefault();
            predict('disease', 'disease-form', 'result');
        });
    }
});

// Crop Guide Logic
function handleEnter(e) {
    if (e.key === 'Enter') searchCrop();
}

async function searchCrop() {
    const input = document.getElementById('cropInput');
    const query = input.value.trim();
    const resultDiv = document.getElementById('resultContainer');
    const errorDiv = document.getElementById('errorMsg');
    const loading = document.getElementById('loading');

    if (!query) return;

    loading.style.display = 'block';
    resultDiv.style.display = 'none';
    if (errorDiv) errorDiv.style.display = 'none';

    try {
        const response = await fetch(`${API_BASE}/guide?crop=${encodeURIComponent(query)}`);
        const data = await response.json();

        loading.style.display = 'none';

        if (response.ok) {
            // Populate UI
            document.getElementById('cropName').textContent = query.charAt(0).toUpperCase() + query.slice(1);
            if (data.scientific_name) document.getElementById('sciName').textContent = data.scientific_name;
            document.getElementById('cropDesc').textContent = data.description;

            // Helper to fill lists
            const fillList = (id, items) => {
                const dl = document.getElementById(id);
                if (!dl) return;
                dl.innerHTML = '';
                if (Array.isArray(items)) {
                    items.forEach(item => {
                        const li = document.createElement('li');
                        li.textContent = item;
                        dl.appendChild(li);
                    });
                } else if (typeof items === 'object') {
                    for (const [key, val] of Object.entries(items)) {
                        const li = document.createElement('li');
                        li.innerHTML = `<strong>${key.charAt(0).toUpperCase() + key.slice(1)}:</strong> ${val}`;
                        dl.appendChild(li);
                    }
                } else {
                    const li = document.createElement('li');
                    li.textContent = items;
                    dl.appendChild(li);
                }
            };

            fillList('conditionsList', data.ideal_conditions);
            fillList('plantingList', data.planting_tips);
            fillList('careList', data.care_maintenance);
            fillList('diseaseList', data.diseases);

            resultDiv.style.display = 'block';
        } else {
            if (errorDiv) {
                errorDiv.textContent = data.error || "Crop not found. Try Rice, Wheat, Maize, Cotton, etc.";
                errorDiv.style.display = 'block';
            }
        }
    } catch (error) {
        loading.style.display = 'none';
        if (errorDiv) {
            errorDiv.textContent = "Connection error. Please try again.";
            errorDiv.style.display = 'block';
        }
        console.error(error);
    }
}

// Smart Farm UI Features initialization
document.addEventListener('DOMContentLoaded', () => {
    // 1. Highlight Active Link in Navbar
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });

    // 2. Scroll Reveal Animation
    const reveals = document.querySelectorAll('.reveal');
    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const revealPoint = 150;
        reveals.forEach(reveal => {
            const revealTop = reveal.getBoundingClientRect().top;
            if (revealTop < windowHeight - revealPoint) {
                reveal.classList.add('active');
            }
        });
    };
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Initial check
});
