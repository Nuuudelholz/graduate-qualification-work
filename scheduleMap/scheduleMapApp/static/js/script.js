let map = L.map('map', {
    zoomControl: false,
    center: [0, 0],
    zoom: 2,
    maxZoom: 22
});

L.tileLayer('', {
    attribution: ''
}).addTo(map);

let geoJsonLayer;
let originalData;

function getRandomColor() {
    return Math.random() > 0.5 ? '#FF0000' : '#00FF00';
}

function styleByFloor(feature) {
    return {
        color: '#808080',
        fillColor: '#D3D3D3',
        weight: 2,
        opacity: 1,
        fillOpacity: 1
    };
}

function filterLayer(floor) {
    if (geoJsonLayer) {
        map.removeLayer(geoJsonLayer);

        geoJsonLayer = L.geoJSON(originalData, {
            filter: function(feature) {
                return feature.properties['Floor'] === floor;
            },
            style: styleByFloor,
            onEachFeature: function (feature, layer) {
                let popupContent = "<strong>Информация об объекте:</strong><br>";
                for (let property in feature.properties) {
                    popupContent += property + ": " + feature.properties[property] + "<br>";
                }
                layer.bindPopup(popupContent);
            }
        }).addTo(map);
    }
}

function resetLayer() {
    if (geoJsonLayer) {
        map.removeLayer(geoJsonLayer);

        geoJsonLayer = L.geoJSON(originalData, {
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
    }
}

function test() {
    if (!geoJsonLayer) return;

    geoJsonLayer.eachLayer(layer => {
        if (layer.feature) {
            const props = layer.feature.properties;
            if (['Аудитория', 'Лабораторная', 'Класс', 'Лаборатория'].includes(props['Room_type'])) {
                layer.setStyle({
                    fillColor: getRandomColor(),
                    fillOpacity: 0.7
                });
            }
            else if ([
                      'Кабинет','Служебное помещение', 'С/У', 'Охрана', 'Гардероб', 'Электрощитовая',
                      'Тех. помещение', 'Склад', 'Охранная', 'Вахта', 'Склад', 'Склад 1', 'Склад 2', 'Помещение',
                      'Преподавательская', 'Комендантская', 'Мусорокамера', 'Кабинет', 'Техмастерская',
                      'Фотолаборатория', 'Подсобка', 'Испытательская', 'Приёмная', 'Буфет', 'Кинозал', 'Сцена',
                      'Конструкторское бюро', 'Серверная', 'Служебное', 'Техническое'
                      ].includes(props['Room_type'])) {
                layer.setStyle({
                    fillColor: '#2a1468',
                    fillOpacity: 0.8
                });
            }
        }
    });
}

