"use strict";
/* =========================================================================
   Вимога 3 («Послуги»). Якщо користувач 40 с фокусується на будь-якому лоті
   (курсор над карткою або фокус з клавіатури), поверх сторінки з'являється
   модальне вікно з блокуванням сторінки. Воно ставить питання, щоб перевірити,
   чи підходить послуга під запит користувача, і має поле для відповіді.
   Для перевірки на відео: services.html?focusDelay=5 (5 секунд замість 40).
   ========================================================================= */

const FOCUS_DELAY_MS = (Number(new URLSearchParams(location.search).get("focusDelay")) || 40) * 1000;

/** Уточнювальні питання до кожної послуги (за назвою картки) */
const LOT_QUESTIONS = {
    "Перша зустріч-знайомство":
        "Що спонукало вас шукати підтримку психолога саме зараз?",
    "Індивідуальна консультація":
        "З якою ситуацією чи почуттям ви хотіли б розібратися насамперед?",
    "Робота з тривогою та панічними атаками":
        "Як часто ви відчуваєте тривогу або панічні напади і в яких ситуаціях вони посилюються?",
    "Сімейна та парна терапія":
        "Хто братиме участь у консультації і що найбільше турбує у ваших стосунках?",
    "Дитячий та підлітковий психолог":
        "Скільки років дитині і які зміни в її поведінці або настрої вас непокоять?",
    "Кризова підтримка":
        "Чи перебуваєте ви зараз у безпеці? Коротко опишіть, що сталося.",
    "Профілактика професійного вигорання":
        "Скільки годин на тиждень ви працюєте і як давно відчуваєте втому, яка не минає після відпочинку?",
    "Групова підтримка":
        "Яку тему ви хотіли б обговорити в групі з людьми зі схожим досвідом?"
};

const CRISIS_NOTE = "Якщо вам загрожує небезпека, телефонуйте 112 або на лінію Lifeline Ukraine — 7333.";

class LotFocusWatcher {
    constructor(cards, dialog, delay) {
        this.cards = cards;
        this.dialog = dialog;
        this.delay = delay;
        this._asked = new Set();          // лоти, щодо яких уже питали
        this._timers = new Map();         // картка → таймер
        this._state = new Map();          // картка → { hovered, focused }

        this._form = dialog.querySelector("form");
        this._title = dialog.querySelector("#lot-dialog-title");
        this._question = dialog.querySelector("#lot-dialog-question");
        this._note = dialog.querySelector("#lot-dialog-note");
        this._answer = dialog.querySelector("#lot-dialog-answer");
        this._thanks = dialog.querySelector("#lot-dialog-thanks");

        document.documentElement.style.setProperty("--focus-delay", `${delay}ms`);
        cards.forEach((card) => this._watch(card));
        this._bindDialog();
    }

    _watch(card) {
        card.tabIndex = 0;                               // картку можна обрати клавішею Tab
        this._state.set(card, { hovered: false, focused: false });
        const update = (key, value) => {
            this._state.get(card)[key] = value;
            this._sync(card);
        };
        card.addEventListener("mouseenter", () => update("hovered", true));
        card.addEventListener("mouseleave", () => update("hovered", false));
        card.addEventListener("focusin", () => update("focused", true));
        card.addEventListener("focusout", () => update("focused", false));
    }

    /** Запускає або скасовує 40-секундний відлік для картки */
    _sync(card) {
        const { hovered, focused } = this._state.get(card);
        const attending = (hovered || focused) && !this._asked.has(card) && !this.dialog.open;

        if (attending && !this._timers.has(card)) {
            card.classList.add("is-focusing");           // смужка прогресу внизу картки
            this._timers.set(card, setTimeout(() => this._ask(card), this.delay));
        } else if (!attending && this._timers.has(card)) {
            clearTimeout(this._timers.get(card));
            this._timers.delete(card);
            card.classList.remove("is-focusing");
        }
    }

    _ask(card) {
        this._timers.delete(card);
        card.classList.remove("is-focusing");
        this._asked.add(card);

        const title = card.querySelector("h3").textContent.trim();
        this._title.textContent = `«${title}»: уточнимо ваш запит`;
        this._question.textContent = LOT_QUESTIONS[title] ?? "Розкажіть, будь ласка, з чим ви хотіли б звернутися?";
        this._note.textContent = title === "Кризова підтримка" ? CRISIS_NOTE : "";
        this._note.hidden = title !== "Кризова підтримка";
        this._answer.value = "";
        this._thanks.hidden = true;
        this._form.hidden = false;

        this._lastCard = card;
        document.body.classList.add("modal-open");       // блокуємо прокручування сторінки
        // ЛР5: кросбраузерність — якщо браузер не знає <dialog> (Safari < 15.4, Firefox < 98),
        // вікно просто показується атрибутом open
        if (typeof this.dialog.showModal === "function") {
            this.dialog.showModal();                     // решта сторінки стає недоступною
        } else {
            this.dialog.setAttribute("open", "");
        }
        this._answer.focus();
    }

    _bindDialog() {
        this._form.addEventListener("submit", (event) => {
            event.preventDefault();
            const answer = this._answer.value.trim();
            if (!answer) {
                this._answer.setCustomValidity("Напишіть, будь ласка, кілька слів");
                this._answer.reportValidity();
                return;
            }
            console.log("Відповідь на уточнювальне питання:", { lot: this._title.textContent, answer });
            this._form.hidden = true;
            this._thanks.hidden = false;
        });
        this._answer.addEventListener("input", () => this._answer.setCustomValidity(""));

        this.dialog.querySelectorAll("[data-close]").forEach((button) =>
            button.addEventListener("click", () => {
                if (typeof this.dialog.close === "function") {
                    this.dialog.close();
                } else {                                 // ЛР5: запасний варіант без <dialog>
                    this.dialog.removeAttribute("open");
                    this.dialog.dispatchEvent(new Event("close"));
                }
            }));

        this.dialog.addEventListener("close", () => {
            document.body.classList.remove("modal-open");
            this._lastCard?.focus({ preventScroll: true });
        });
    }
}

/* ---------- Запуск ---------- */
(function initLotWatcher() {
    const dialog = document.querySelector("#lot-dialog");
    const cards = [...document.querySelectorAll(".services article")];
    if (!dialog || cards.length === 0) return;
    new LotFocusWatcher(cards, dialog, FOCUS_DELAY_MS);
})();
