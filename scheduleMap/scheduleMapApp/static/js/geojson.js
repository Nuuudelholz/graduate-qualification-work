// Загрузка списка файлов GeoJSON с сервера и добавление их в выпадающий список
fetch('/geojson-files/')
    .then(response => response.json())
    .then(data => {
        const selectElement = document.getElementById('fileSelect');
        data.files.forEach(file => {
            const option = document.createElement('option');
            option.value = file;
            option.textContent = file;
            selectElement.appendChild(option);
        });
    });

// Функция загрузки и отображения GeoJSON данных на карту
document.getElementById('fileSelect').addEventListener('change', function(event) {
    let selectedFile = event.target.value;
    if (selectedFile) {
        loadGeoJSONFile(selectedFile);
    }
});

function loadGeoJSONFile(fileName) {
    fetch(`/static/geojson/${fileName}`)
        .then(response => response.json())
        .then(data => {
            if (geoJsonLayer) {
                map.removeLayer(geoJsonLayer);
            }
            originalData = data;

            geoJsonLayer = L.geoJSON(data, {
                style: styleByFloor,
                onEachFeature: function (feature, layer) {
                    let popupContent = "<strong>Информация об объекте:</strong><br>";
                    for (let property in feature.properties) {
                        popupContent += property + ": " + feature.properties[property] + "<br>";
                    }
                    layer.bindPopup(popupContent);
                }
            }).addTo(map);

            map.fitBounds(geoJsonLayer.getBounds(), { maxZoom: 22 });
        })
        .catch(error => {
            console.error('Ошибка при загрузке GeoJSON:', error);
        });
}