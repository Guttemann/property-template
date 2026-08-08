// =========================
// STATE
// =========================
let currentLanguage = localStorage.getItem("property-language") || "en";
let lightboxIndex = 0;

const navbar = document.querySelector(".navbar");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const languageButtons = document.querySelectorAll(".language-btn");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxCaption = document.getElementById("lightboxCaption");
const factsGrid = document.getElementById("factsGrid");
const galleryGrid = document.getElementById("galleryGrid");
const amenitiesGrid = document.getElementById("amenitiesGrid");
const distanceGrid = document.getElementById("distanceGrid");

let observer;

function getText(value) {
    if (typeof value === "string") return value;
    return value?.[currentLanguage] || value?.en || "";
}

function iconSvg(name) {
    const icons = {
        bed: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V8m0 12h16m-16 0v-5h16v5m0-5V11a2 2 0 0 0-2-2h-5a2 2 0 0 0-2 2v4m9 0H4"/></svg>',
        bath: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12V7a4 4 0 0 1 8 0m-8 5h12a3 3 0 0 1 0 6H7a4 4 0 0 1-4-4v-1h3"/></svg>',
        users: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1m14 0h3v-1a4 4 0 0 0-3-3.87M13 5.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Zm7 4a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"/></svg>',
        pool: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 19h20M4 15c1.5 0 1.5-1 3-1s1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1m-8-7-2-2-2 2m2-2v8"/></svg>',
        pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s6-5.5 6-11a6 6 0 0 0-12 0c0 5.5 6 11 6 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/></svg>',
        wifi: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12a13 13 0 0 1 14 0m-11 4a8 8 0 0 1 8 0m-5 4a3 3 0 0 1 2 0"/></svg>',
        snow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2v20M5 5l14 14M19 5 5 19M3 12h18"/></svg>',
        kitchen: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h14v18H5zM8 7h2m4 0h2M8 11h8M8 15h5"/></svg>',
        car: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 16h18l-1-5H4l-1 5Zm3 0v3m12-3v3M6 11l2-4h8l2 4"/></svg>',
        laundry: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h12v16H6zM8 4l2 4m0-4 2 4m6 0a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"/></svg>',
        tv: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v11H4zM8 20h8M9 10l5 2-5 2z"/></svg>',
        grill: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14M7 8l2 8h6l2-8M9 19h6M12 16v3M4 5h16"/></svg>',
        table: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11h16M7 11v7m10-7v7M6 18h12M5 8h14"/></svg>'
    };
    return icons[name] || icons.pin;
}

function observeRevealElements() {
    if (!observer) return;
    document.querySelectorAll(".reveal, .reveal-image").forEach(element => {
        if (element.dataset.observed === "true") return;
        observer.observe(element);
        element.dataset.observed = "true";
    });
}

function renderFacts() {
    const config = window.propertyConfig;
    factsGrid.innerHTML = config.facts.map(item => `
        <article class="fact-card reveal">
            <span class="fact-icon">${iconSvg(item.icon)}</span>
            <div>
                <div class="fact-value">${item.value}</div>
                <div class="fact-label">${getText(item.label)}</div>
            </div>
        </article>
    `).join("");
}

function renderGallery() {
    const config = window.propertyConfig;
    galleryGrid.innerHTML = config.gallery.map((image, index) => `
        <button class="gallery-item ${image.span || ""} reveal-image" type="button"
            data-gallery-index="${index}" aria-label="${getText(image.alt)}">
            <img src="${image.src}" alt="${getText(image.alt)}">
        </button>
    `).join("");

    galleryGrid.querySelectorAll(".gallery-item").forEach(button => {
        button.addEventListener("click", () => openLightbox(Number(button.dataset.galleryIndex)));
    });
}

function renderAmenities() {
    const config = window.propertyConfig;
    amenitiesGrid.innerHTML = config.amenities.map(item => `
        <article class="amenity-card reveal">
            <span class="amenity-icon">${iconSvg(item.icon)}</span>
            <div>
                <strong>${getText(item.label)}</strong>
            </div>
        </article>
    `).join("");
}

function renderDistances() {
    const config = window.propertyConfig;
    distanceGrid.innerHTML = config.distances.map(item => `
        <article class="distance-card reveal">
            <div class="distance-value">${item.value}</div>
            <div class="distance-label">${getText(item.label)}</div>
        </article>
    `).join("");
}

function renderStaticContent() {
    const config = window.propertyConfig;
    if (!config) return;

    document.querySelectorAll("[data-property-name]").forEach(el => el.textContent = getText(config.name));
    document.querySelectorAll("[data-property-location]").forEach(el => el.textContent = getText(config.location));
    document.querySelectorAll("[data-property-hero-title]").forEach(el => el.textContent = getText(config.heroTitle));
    document.querySelectorAll("[data-property-hero-description]").forEach(el => el.textContent = getText(config.heroDescription));
    document.querySelectorAll("[data-property-hero-details]").forEach(el => el.textContent = getText(config.heroDetails));
    document.querySelectorAll("[data-property-about-title]").forEach(el => el.textContent = getText(config.aboutTitle));
    document.querySelectorAll("[data-property-about-body]").forEach(el => el.textContent = getText(config.aboutBody));
    document.querySelectorAll("[data-property-about-body-2]").forEach(el => el.textContent = getText(config.aboutBody2));
    document.querySelectorAll("[data-property-location-body]").forEach(el => el.textContent = getText(config.locationBody));
    document.querySelectorAll("[data-property-location-body-2]").forEach(el => el.textContent = getText(config.locationBody2));
    document.querySelectorAll("[data-property-map-address]").forEach(el => el.textContent = getText(config.mapAddress));
    document.querySelectorAll("[data-property-email]").forEach(el => { if (config.email) { el.textContent = config.email; el.href = `mailto:${config.email}`; } else { el.textContent = "Contact via Facebook"; el.href = config.contactUrl; } });
    document.querySelectorAll("[data-property-phone]").forEach(el => { el.textContent = config.phone; el.href = `tel:${config.phone.replace(/\s+/g, "")}`; });
    document.querySelectorAll("[data-property-footer-copy]").forEach(el => el.textContent = getText(config.footerCopy));
    document.querySelectorAll("[data-property-hero-image]").forEach(el => el.src = config.heroImage);
    document.querySelectorAll("[data-property-map-link]").forEach(el => el.href = config.mapUrl);
    document.querySelectorAll("[data-property-contact-link]").forEach(el => el.href = config.contactUrl);
    document.querySelectorAll("[data-property-photos-link]").forEach(el => el.href = config.photosUrl);

    renderFacts();
    renderGallery();
    renderAmenities();
    renderDistances();
    observeRevealElements();
}

function setLanguage(language) {
    currentLanguage = language;
    document.documentElement.lang = language;

    document.querySelectorAll("[data-i18n]").forEach(element => {
        const key = element.dataset.i18n;
        if (translations[language] && translations[language][key]) {
            element.textContent = translations[language][key];
        }
    });

    languageButtons.forEach(button => {
        button.classList.toggle("active", button.dataset.lang === language);
    });

    localStorage.setItem("property-language", language);
    renderStaticContent();
}

window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 80);
});

menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
});

document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", () => navLinks.classList.remove("open"));
});

languageButtons.forEach(button => {
    button.addEventListener("click", () => setLanguage(button.dataset.lang));
});

// SCROLL REVEAL
observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

// SMOOTH ANCHOR SCROLL
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (event) {
        const target = document.querySelector(this.getAttribute("href"));
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
});

// LIGHTBOX
function openLightbox(index) {
    const config = window.propertyConfig;
    lightboxIndex = index;
    const image = config.gallery[lightboxIndex];
    lightboxImage.src = image.src;
    lightboxImage.alt = getText(image.alt);
    lightboxCaption.textContent = `${String(lightboxIndex + 1).padStart(2, "0")} / ${String(config.gallery.length).padStart(2, "0")} · ${getText(image.alt)}`;
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
}

function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}

function stepLightbox(direction) {
    const config = window.propertyConfig;
    lightboxIndex = (lightboxIndex + direction + config.gallery.length) % config.gallery.length;
    openLightbox(lightboxIndex);
}

document.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
document.querySelector(".lightbox-prev").addEventListener("click", () => stepLightbox(-1));
document.querySelector(".lightbox-next").addEventListener("click", () => stepLightbox(1));

lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
});

window.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") stepLightbox(-1);
    if (event.key === "ArrowRight") stepLightbox(1);
});

// INIT
setLanguage(currentLanguage);
