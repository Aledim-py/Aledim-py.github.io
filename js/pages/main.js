
// После загрузки всего, кроме изображений и стилей
document.addEventListener('DOMContentLoaded', async function() {
    var tpl = 'background: linear-gradient(180deg, #C549E6 0%, #7E42DB 100%);'
    + 'font-size:20px; font-weight: 400; padding:8px 20px; color:#fefefe; border-radius:16px;';
    console.log('%cРаботает почти так, как должно :)', tpl);

    // Инициализируем модальные окна
    App.update.modals();

    // Получаем cookies
    await App.update.cookies();

    // Получаем данные
    await App.request.getData();

    Render.graph(Data.nodes, Data.links);
    Render.citizens(Data.citizens);
});

window.onresize = function() {
    // Перерендер графа при изменении размеров экрана
    Render.graph(Data.nodes, Data.links);
};