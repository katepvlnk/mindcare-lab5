"use strict";
/* =========================================================================
   Форма «Зворотній зв'язок»: допоміжні обробники.
   ========================================================================= */

/**
 * Обробник через HTML-атрибут onclick:
 *   <button type="reset" onclick="return confirmReset()">
 * window.confirm — метод BOM: показує системне вікно підтвердження.
 * Якщо повернути false, браузер скасує стандартну дію (очищення форми).
 */
function confirmReset() {
    return window.confirm("Очистити всі поля форми?");
}

/* Лічильник символів у полі «Детально» — обробник через властивість DOM-об'єкта (oninput) */
(function initCharCounter() {
    const field = document.getElementById("details");
    if (!field) return;

    const counter = document.createElement("small");
    counter.className = "char-counter";
    field.after(counter);                                  // вставляємо одразу після поля

    const update = () => {
        counter.textContent = `${field.value.length} / ${field.maxLength} символів`;
    };
    field.oninput = update;                                // подія input — після кожної зміни тексту
    field.form.addEventListener("reset", () => setTimeout(update));  // після очищення форми
    update();
})();
