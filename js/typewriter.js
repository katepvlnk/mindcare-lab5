"use strict";
/* =========================================================================
   Вимога 1 (Головна). Під назвою, на тому ж фоні шапки, самодрукується
   текст: вітання з прийдешнім святом, графік роботи, зміни в роботі.
   Колір — зелений, товщина гліфа — у 1,5 раза більша, ніж у назви.
   ========================================================================= */

/** Свята, з якими вітаємо (місяць 1–12) */
const HOLIDAYS = [
    { month: 1,  day: 1,  name: "Новим роком" },
    { month: 3,  day: 8,  name: "Міжнародним жіночим днем" },
    { month: 8,  day: 24, name: "Днем Незалежності України" },
    { month: 10, day: 10, name: "Всесвітнім днем психічного здоров’я" },
    { month: 12, day: 6,  name: "Днем святого Миколая" },
    { month: 12, day: 25, name: "Різдвом Христовим" }
];

const MS_IN_DAY = 24 * 60 * 60 * 1000;

/** Найближче свято, яке ще не настало (сьогоднішнє теж вважається прийдешнім) */
function nextHoliday(today = new Date()) {
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const upcoming = HOLIDAYS.map((h) => {
        let date = new Date(start.getFullYear(), h.month - 1, h.day);
        if (date < start) date = new Date(start.getFullYear() + 1, h.month - 1, h.day);
        return { ...h, date, daysLeft: Math.round((date - start) / MS_IN_DAY) };
    });
    return upcoming.reduce((nearest, h) => (h.daysLeft < nearest.daysLeft ? h : nearest));
}

/** Правильна форма слова «день»: 1 день, 2 дні, 5 днів, 11 днів */
function daysWord(n) {
    const lastTwo = n % 100;
    const last = n % 10;
    if (lastTwo >= 11 && lastTwo <= 14) return "днів";
    if (last === 1) return "день";
    if (last >= 2 && last <= 4) return "дні";
    return "днів";
}

/** Тексти, що друкуються по черзі */
function buildMessages(today = new Date()) {
    const holiday = nextHoliday(today);
    const greeting = holiday.daysLeft === 0
        ? `Вітаємо з ${holiday.name}! Бажаємо спокою і тепла.`
        : `Вітаємо з прийдешнім ${holiday.name}! До свята ${holiday.daysLeft} ${daysWord(holiday.daysLeft)}.`;
    return [
        greeting,
        "Графік роботи: пн–пт 08:00–21:00, сб–нд 10:00–18:00.",
        "Зміни в роботі: 31 грудня консультації до 15:00, 1 січня — вихідний."
    ];
}

/** Ефект друкарської машинки: друкує, тримає паузу, стирає, береться за наступний текст */
class Typewriter {
    constructor(element, messages, { typeDelay = 55, eraseDelay = 25, holdDelay = 2200 } = {}) {
        this.element = element;
        this.messages = messages;
        this.typeDelay = typeDelay;
        this.eraseDelay = eraseDelay;
        this.holdDelay = holdDelay;
        this._messageIndex = 0;
        this._charIndex = 0;
        this._erasing = false;
    }

    start() {
        // користувачам, які вимкнули анімацію в системі, показуємо текст одразу
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            this.element.textContent = this.messages[0];
            return;
        }
        this._tick();
    }

    _tick() {
        const message = this.messages[this._messageIndex];
        this._charIndex += this._erasing ? -1 : 1;
        this.element.textContent = message.slice(0, this._charIndex);

        let delay = this._erasing ? this.eraseDelay : this.typeDelay;
        if (!this._erasing && this._charIndex === message.length) {
            this._erasing = true;                         // надрукували — пауза, потім стираємо
            delay = this.holdDelay;
        } else if (this._erasing && this._charIndex === 0) {
            this._erasing = false;                        // стерли — наступний текст
            this._messageIndex = (this._messageIndex + 1) % this.messages.length;
            delay = 400;
        }
        setTimeout(() => this._tick(), delay);
    }
}

/* ---------- Запуск ---------- */
(function initTypewriter() {
    const title = document.querySelector("header h1");
    const line = document.querySelector("#typewriter");
    if (!title || !line) return;

    // товщина гліфа = товщина назви × 1,5 (у межах допустимих 100–1000)
    const titleWeight = Number(getComputedStyle(title).fontWeight);
    line.style.fontWeight = String(Math.min(1000, Math.round(titleWeight * 1.5)));
    line.style.color = "hsl(130, 65%, 68%)";              // зелений, читабельний на темній шапці

    new Typewriter(line, buildMessages()).start();
})();
