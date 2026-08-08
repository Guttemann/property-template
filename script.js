// =========================
// NAVIGATION
// =========================

const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {

    if (window.scrollY > 80) {
        navbar.classList.add("scrolled");
    } else {
        navbar.classList.remove("scrolled");
    }

});


// =========================
// MOBILE MENU
// =========================

const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

menuToggle.addEventListener("click", () => {

    navLinks.classList.toggle("open");

});

document.querySelectorAll(".nav-links a").forEach(link => {

    link.addEventListener("click", () => {

        navLinks.classList.remove("open");

    });

});


// =========================
// LANGUAGE SWITCH
// =========================

const languageButtons =
    document.querySelectorAll(".language-btn");


function setLanguage(language) {

    document.documentElement.lang = language;


    document.querySelectorAll("[data-i18n]").forEach(element => {

        const key = element.dataset.i18n;

        if (
            translations[language] &&
            translations[language][key]
        ) {

            element.innerHTML =
                translations[language][key];

        }

    });


    languageButtons.forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.lang === language
        );

    });


    localStorage.setItem(
        "property-language",
        language
    );

}


languageButtons.forEach(button => {

    button.addEventListener("click", () => {

        setLanguage(button.dataset.lang);

    });

});


const savedLanguage =
    localStorage.getItem("property-language") || "en";

setLanguage(savedLanguage);


// =========================
// SCROLL REVEAL
// =========================

const revealElements =
    document.querySelectorAll(
        ".reveal, .reveal-image"
    );


const observer =
    new IntersectionObserver(

        entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add(
                        "visible"
                    );

                    observer.unobserve(
                        entry.target
                    );

                }

            });

        },

        {
            threshold: 0.15
        }

    );


revealElements.forEach(element => {

    observer.observe(element);

});


// =========================
// SMOOTH ANCHOR SCROLL
// =========================

document
    .querySelectorAll('a[href^="#"]')
    .forEach(anchor => {

        anchor.addEventListener(
            "click",
            function (event) {

                const target =
                    document.querySelector(
                        this.getAttribute("href")
                    );

                if (!target) return;

                event.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }
        );

    });