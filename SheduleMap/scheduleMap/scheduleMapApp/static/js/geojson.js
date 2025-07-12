document.getElementById('fileSelect').addEventListener('change', function(event) {
    const selected = event.target.value;

    if (selected === "6") {
        const isMobile = window.innerWidth < 768;
        const filename = isMobile ? '6_MB.geojson' : '6_PC.geojson';
        loadGeoJSONFile(filename);
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

            highlightRoomTypes();

            map.fitBounds(geoJsonLayer.getBounds(), { maxZoom: 22 });
        })
        .catch(error => {
            console.error('Ошибка при загрузке GeoJSON:', error);
        });
}