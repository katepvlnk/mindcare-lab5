"use strict";
/* =========================================================================
   Вимога 4 («Зворотній зв'язок»). При наведенні курсора на поле «Детально»
   воно змінює колір фону, з'являється рамка та тінь від неї, а праворуч
   з'являється підказка (tooltip):
   «Вдячні за Ваш час! Конкретизуйте мету звернення, будь ласка».
   ========================================================================= */

const TOOLTIP_TEXT = "Вдячні за Ваш час! Конкретизуйте мету звернення, будь ласка";
const TOOLTIP_GAP = 16;     // відстань від поля до підказки, px

(function initDetailsTooltip() {
    const field = document.getElementById("details");
    if (!field) return;
    const wrapper = field.closest(".field-details");

    // створюємо підказку через DOM
    const tooltip = document.createElement("span");
    tooltip.id = "details-tooltip";
    tooltip.className = "tooltip";
    tooltip.setAttribute("role", "tooltip");
    tooltip.textContent = TOOLTIP_TEXT;
    wrapper.appendChild(tooltip);
    field.setAttribute("aria-describedby", tooltip.id);

    /** Праворуч від поля, а якщо там не вистачає місця (вузький екран) — під полем */
    function placeTooltip() {
        const right = field.offsetLeft + field.offsetWidth + TOOLTIP_GAP;
        const fitsRight = right + tooltip.offsetWidth <= wrapper.clientWidth;
        tooltip.classList.toggle("tooltip--right", fitsRight);
        tooltip.classList.toggle("tooltip--below", !fitsRight);
        tooltip.style.left = `${fitsRight ? right : field.offsetLeft}px`;
        // ЛР5: під полем є лічильник символів — на вузькому екрані підказка стає під ним, а не на нього
        const counter = field.nextElementSibling;
        const below = counter && counter.classList.contains("char-counter") ? counter : field;
        tooltip.style.top = `${fitsRight ? field.offsetTop + 12 : below.offsetTop + below.offsetHeight + TOOLTIP_GAP / 2}px`;
    }

    function show() {
        placeTooltip();
        field.classList.add("is-hovered");      // фон, рамка і тінь — у css/dynamic.css
        tooltip.classList.add("is-visible");
    }

    function hide() {
        field.classList.remove("is-hovered");
        tooltip.classList.remove("is-visible");
    }

    field.addEventListener("mouseenter", show);
    field.addEventListener("mouseleave", hide);
    window.addEventListener("resize", () => {
        if (tooltip.classList.contains("is-visible")) placeTooltip();
    });
})();
