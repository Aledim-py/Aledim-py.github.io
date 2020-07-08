// Когда загрузилось всё, кроме изображений и стилей:
document.addEventListener('DOMContentLoaded', async function() {
    var tpl = 'background: linear-gradient(180deg, #C549E6 0%, #7E42DB 100%);'
    + 'font-size:20px; font-weight: 400; padding:8px 20px; color:#fefefe; border-radius:16px;';
    console.log('%cРаботает почти так, как должно :)', tpl);

    Render.background();
});