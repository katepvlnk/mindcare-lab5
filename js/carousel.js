"use strict";
/* =========================================================================
   Вимога 2 («Послуги»). Під блоком з назвою і логотипом по центру —
   карусель із зображень послуг. Висота елементів — не більше 20 % висоти
   вікна перегляду (у CSS: height: 20vh).
   Слайди збираються з карток послуг, що вже є на сторінці.
   ========================================================================= */

class Carousel {
    /**
     * @param {HTMLElement} root   — контейнер .carousel
     * @param {Array<{src:string, alt:string, title:string}>} slides
     * @param {number} interval    — пауза автопрокручування, мс
     */
    constructor(root, slides, interval = 3500) {
        this.root = root;
        this.slides = slides;
        this.interval = interval;
        this.current = 0;
        this._timer = null;

        this.track = root.querySelector(".carousel-track");
        this.viewport = root.querySelector(".carousel-viewport");
        this.caption = root.querySelector(".carousel-caption");
        this.dots = root.querySelector(".carousel-dots");

        this._render();
        this._bindEvents();
        this.goTo(0);
        this.play();
    }

    _render() {
        this.track.innerHTML = "";
        this.dots.innerHTML = "";
        this.slides.forEach((slide, index) => {
            const item = document.createElement("li");
            item.className = "carousel-slide";
            const img = document.createElement("img");
            img.src = slide.src;
            img.alt = slide.alt;
            item.appendChild(img);
            item.addEventListener("click", () => this.goTo(index));
            this.track.appendChild(item);

            const dot = document.createElement("button");
            dot.type = "button";
            dot.className = "carousel-dot";
            dot.setAttribute("aria-label", `Слайд ${index + 1}: ${slide.title}`);
            dot.addEventListener("click", () => this.goTo(index));
            this.dots.appendChild(dot);
        });
        this.items = [...this.track.children];
    }

    _bindEvents() {
        // обробник через властивість DOM-об'єкта (onclick): у кнопки може бути лише один такий
        this.root.querySelector(".carousel-prev").onclick = () => this.prev();
        this.root.querySelector(".carousel-next").onclick = () => this.next();

        // пауза, поки користувач дивиться на карусель
        this.root.addEventListener("mouseenter", () => this.pause());
        this.root.addEventListener("mouseleave", () => this.play());
        this.root.addEventListener("focusin", () => this.pause());
        this.root.addEventListener("focusout", () => this.play());

        this.root.addEventListener("keydown", (event) => {
            if (event.key === "ArrowLeft") this.prev();
            if (event.key === "ArrowRight") this.next();
        });
        window.addEventListener("resize", () => this.goTo(this.current));
        // зображення мають різну ширину, тож центруємо ще раз після їх завантаження
        this.items.forEach((item) => item.querySelector("img").addEventListener("load", () => this.goTo(this.current)));
    }

    goTo(index) {
        const count = this.slides.length;
        this.current = (index + count) % count;              // «по колу»
        const active = this.items[this.current];

        // зсуваємо стрічку так, щоб активний слайд опинився по центру
        const offset = this.viewport.clientWidth / 2 - (active.offsetLeft + active.offsetWidth / 2);
        this.track.style.transform = `translateX(${offset}px)`;

        this.items.forEach((item, i) => item.classList.toggle("is-active", i === this.current));
        [...this.dots.children].forEach((dot, i) => dot.setAttribute("aria-current", i === this.current));
        this.caption.textContent = `${this.current + 1} / ${count} · ${this.slides[this.current].title}`;
    }

    next() { this.goTo(this.current + 1); }
    prev() { this.goTo(this.current - 1); }

    play() {
        this.pause();
        this._timer = setInterval(() => this.next(), this.interval);
    }

    pause() {
        clearInterval(this._timer);
    }
}

/* ---------- Запуск ---------- */
(function initCarousel() {
    const root = document.querySelector(".carousel");
    if (!root) return;
    const slides = [...document.querySelectorAll(".services article")].map((card) => {
        const img = card.querySelector("figure img");
        const source = card.querySelector("figure source");   // у <picture> беремо SVG-джерело
        return {
            src: source ? source.srcset : img.src,
            alt: img.alt,
            title: card.querySelector("h3").textContent
        };
    });
    new Carousel(root, slides);
})();
