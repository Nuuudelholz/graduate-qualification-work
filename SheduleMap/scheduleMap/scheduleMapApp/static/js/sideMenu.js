document.addEventListener('DOMContentLoaded', function() {
    const sideMenu = document.getElementById('sideMenu');
    const showLegend = document.getElementById('showLegend');

    showLegend.addEventListener('click', function() {
        if (sideMenu.classList.contains('menuOpen')) {
            sideMenu.classList.remove('menuOpen');
            showLegend.classList.remove('menuOpened');
            showLegend.textContent = '<';
        }
        else {
            sideMenu.classList.add('menuOpen');
            showLegend.classList.add('menuOpened');
            showLegend.textContent = '>';
        }
    });

});
