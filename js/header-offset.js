/**
 * Лабораторна робота 5. Відступ під шапку за будь-якої ширини екрана.
 *
 * На Головній шапка позиціонована абсолютно, на «Послугах» — фіксовано,
 * тому вона не займає місця в потоці документа. Раніше відступ зверху
 * був сталим числом (265px / 440px), і на екрані 320px шапка заходила
 * на контент. Тепер реальна висота шапки записується в CSS-змінну
 * --header-h, а таблиця стилів додає до неї відступ у rem.
 */
(function initHeaderOffset() {
    const header = document.querySelector("body > header");
    if (!header) return;

    const root = document.documentElement;
    const update = () => root.style.setProperty("--header-h", `${header.offsetHeight}px`);

    // ResizeObserver реагує і на зміну ширини вікна, і на зміну тексту в шапці
    if ("ResizeObserver" in window) {
        new ResizeObserver(update).observe(header);
    } else {
        window.addEventListener("resize", update);   // запасний варіант для старих браузерів
    }
    update();
})();
