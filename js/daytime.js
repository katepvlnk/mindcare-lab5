"use strict";
/* =========================================================================
   Вимога 5 (Головна). Користувачу, що зайшов з 06:00 до 21:00, колір фону
   всіх елементів світліший на 30 %, ніж в інший час.

   Як це влаштовано: усі кольори фону сторінки задані CSS-змінними.
   Денні значення — базові. Увечері й уночі JS зменшує світлоту (L у HSL)
   кожного кольору в 1,3 раза, тож удень фон на 30 % світліший:
   L_день = 1,3 × L_ніч.
   Для перевірки в будь-який час: index.html?hour=22
   ========================================================================= */

const DAY_START = 6;          // 06:00 — початок «світлого» періоду (включно)
const DAY_END = 21;           // 21:00 — кінець (21:00 уже «темний»)
const LIGHTNESS_RATIO = 1.3;  // удень світлота на 30 % більша

/** CSS-змінні, які задають колір фону елементів */
const BACKGROUND_VARIABLES = [
    "--forest", "--sage", "--sage-light", "--sand", "--clay", "--clay-dark",
    "--card", "--card-hover", "--row-alt", "--spot-1", "--spot-2", "--spot-3"
];

function isDaytime(hour) {
    return hour >= DAY_START && hour < DAY_END;
}

/** Будь-який CSS-колір → {r, g, b, a}: браузер сам перетворює його на rgb()/rgba() */
function parseColor(cssColor) {
    const probe = document.createElement("span");
    probe.style.color = cssColor;
    document.body.appendChild(probe);
    const rgb = getComputedStyle(probe).color;           // напр. "rgba(255, 255, 255, 0.82)"
    probe.remove();
    const [r, g, b, a = 1] = rgb.match(/[\d.]+/g).map(Number);
    return { r, g, b, a };
}

function rgbToHsl({ r, g, b }) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) return { h: 0, s: 0, l };
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h;
    switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        default: h = (r - g) / d + 4;
    }
    return { h: h * 60, s, l };
}

/** Колір із тим самим тоном і насиченістю, але світлота поділена на ratio */
function darkerColor(cssColor, ratio = LIGHTNESS_RATIO) {
    const color = parseColor(cssColor);
    const { h, s, l } = rgbToHsl(color);
    const pct = (x) => `${Math.round(x * 1000) / 10}%`;
    return `hsla(${Math.round(h)}, ${pct(s)}, ${pct(l / ratio)}, ${color.a})`;
}

/** Застосовує режим відповідно до години */
function applyDaytimeTheme(hour) {
    const root = document.documentElement;
    const day = isDaytime(hour);
    root.dataset.daytime = day ? "day" : "night";

    if (!day) {
        const styles = getComputedStyle(root);
        BACKGROUND_VARIABLES.forEach((name) => {
            const base = styles.getPropertyValue(name).trim();
            if (base) root.style.setProperty(name, darkerColor(base));
        });
    }
    return day;
}

/* ---------- Запуск ---------- */
(function initDaytime() {
    const param = new URLSearchParams(location.search).get("hour");
    const hour = param !== null && param !== "" ? Number(param) : new Date().getHours();
    const day = applyDaytimeTheme(hour);

    // підпис у підвалі, щоб користувач бачив, який режим діє
    const badge = document.createElement("p");
    badge.className = "daytime-badge";
    badge.textContent = day
        ? `☀ Денний режим (${hour}:00 — між 06:00 і 21:00): фон на 30 % світліший`
        : `☾ Вечірній режим (${hour}:00 — поза 06:00–21:00): фон темніший`;
    document.querySelector("footer")?.prepend(badge);
})();
