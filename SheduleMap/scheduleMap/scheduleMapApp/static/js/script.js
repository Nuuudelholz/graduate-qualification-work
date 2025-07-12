const allowedRoomTypes = [
  'Кабинет','Служебное помещение', 'С/У', 'Охрана', 'Гардероб', 'Электрощитовая',
  'Тех. помещение', 'Склад', 'Охранная', 'Вахта', 'Склад 1', 'Склад 2', 'Помещение',
  'Преподавательская', 'Комендантская', 'Мусорокамера', 'Техмастерская',
  'Фотолаборатория', 'Подсобка', 'Испытательская', 'Приёмная', 'Буфет', 'Кинозал', 'Сцена',
  'Конструкторское бюро', 'Серверная', 'Служебное', 'Техническое',
  'Аудитория', 'Лабораторная', 'Класс', 'Лаборатория', 'Семинарская', 'Лекционная'
];

function onEachFeature(feature, layer) {
    const props = feature.properties;
    if (allowedRoomTypes.includes(props['Room_type'])) {
        const neededProps = {
            'Room_type': 'Тип комнаты',
            'Floor': 'Этаж',
            'Room': 'Номер аудитории',
            'Slot': 'Мест',
            'Department': 'Кафедра',
        };

        let popupContent = "<strong>Информация:</strong><br>";
        for (const key in neededProps) {
            if (props[key]) {
                popupContent += neededProps[key] + ": " + props[key] + "<br>";
            }
        }
        layer.bindPopup(popupContent);

        layer.bindTooltip(props["Room"], {
        permanent: true,
        direction: 'center',
        className: 'room-label'
        });
    }
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
            onEachFeature: onEachFeature
        }).addTo(map);
    }
}

function resetLayer() {
    if (geoJsonLayer) {
        map.removeLayer(geoJsonLayer);

        geoJsonLayer = L.geoJSON(originalData, {
            style: styleByFloor,
            onEachFeature: onEachFeature
        }).addTo(map);

        map.fitBounds(geoJsonLayer.getBounds(), { maxZoom: 22 });
    }
}

let minZoomValue;

if (window.innerWidth <= 1000) {
    minZoomValue = 19;
}
else {
    minZoomValue = 20;
}

let map = L.map('map', {
    zoomControl: false,
    center: [0, 0],
    zoom: 2,
    maxZoom: 23,
    minZoom: minZoomValue
});

L.tileLayer('', {
    attribution: ''
}).addTo(map);

let geoJsonLayer;
let originalData;

const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

let currentFloorBtn = null;
let currentTimeBtn = null;

function updateFloorText(floorText) {
    document.getElementById('selectedFloorText').textContent = `Этаж: ${floorText}`;
}

function updateTimeText(timeText) {
    document.getElementById('selectedTimeText').textContent = `Время: ${timeText}`;
}

function fetchOccupancyStatus() {
    const fileSelect = document.getElementById("fileSelect");
    const building = fileSelect.value;

    const week = document.getElementById("weekSelect").value;
    const day = document.getElementById("daySelect").value;
    const floor = document.getElementById("selectedFloorText").textContent.replace("Этаж: ", "");
    const time = document.getElementById("selectedTimeText").textContent.replace("Время: ", "");

    if (!building || !week || !day || !floor || floor === "не выбран" || !time || time === "не выбрано") return;

    console.log({ building, week, day, time });

    fetch('/analyze/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({ building, week, day, time })
    })
    .then(res => {
        console.log("Status:", res.status);
        return res.json();
    })
    .then(data => {
        console.log("Data:", data);
        if (data.occupied_rooms) {
            colorRoomsOnMap(data.occupied_rooms);
        }
    })
    .catch(error => console.error("Ошибка запроса:", error));
}

function colorRoomsOnMap(occupiedRooms) {
    const selectedFloor = document.getElementById("selectedFloorText").textContent.replace("Этаж: ", "");

    geoJsonLayer.eachLayer(layer => {
        const props = layer.feature.properties;
        const rawRoomName = props['Room'];
        const roomName = rawRoomName?.split('-')[1];
        const roomFloor = roomName?.charAt(0);

        if ([
                'Кабинет','Служебное помещение', 'С/У', 'Охрана', 'Гардероб', 'Электрощитовая',
                'Тех. помещение', 'Склад', 'Охранная', 'Вахта', 'Склад 1', 'Склад 2', 'Помещение',
                'Преподавательская', 'Комендантская', 'Мусорокамера', 'Техмастерская',
                'Фотолаборатория', 'Подсобка', 'Испытательская', 'Приёмная', 'Буфет', 'Кинозал', 'Сцена',
                'Конструкторское бюро', 'Серверная', 'Служебное', 'Техническое'
             ].includes(props["Room_type"])) { layer.setStyle({ fillColor: '#2a1468', fillOpacity: 0.8 });}

        if (roomFloor !== selectedFloor) return;

        if (["Аудитория", "Лабораторная", "Класс", "Лаборатория", "Лекционная", "Семинарская"].includes(props["Room_type"])) {
            if (occupiedRooms.includes(roomName)) {
                layer.setStyle({ fillColor: '#FF0000', fillOpacity: 0.8 });
            } else{
                layer.setStyle({ fillColor: '#00FF00', fillOpacity: 0.8 });
            }
        }
    });
}

function handleFloorButtonClick(button, floorNumber, label) {
    if (currentFloorBtn) {
        currentFloorBtn.classList.remove("active-button");
    }

    currentFloorBtn = button;
    currentFloorBtn.classList.add("active-button");

    updateFloorText(label);
    fetchOccupancyStatus();
}

function handleTimeButtonClick(button, timeRange) {
    if (currentTimeBtn) {
        currentTimeBtn.classList.remove("active-button");
    }

    currentTimeBtn = button;
    currentTimeBtn.classList.add("active-button");

    updateTimeText(timeRange);
    fetchOccupancyStatus();
}

function highlightRoomTypes() {
    const checkedTypes = Array.from(document.querySelectorAll('#roomTypeFilter input:checked'))
        .map(cb => cb.value);

    geoJsonLayer.eachLayer(layer => {
        const props = layer.feature.properties;
        const roomType = props['Room_type'];

        if (checkedTypes.includes(roomType)) {
            layer.setStyle({
                color: 'blue',
                weight: 5,
                fillOpacity: 0.5
            });
        } else {
            layer.setStyle({
                color: '#808080',
                weight: 1,
                dashArray: null,
                fillOpacity: 0.8
            });
        }
    });
}

document.querySelectorAll('#roomTypeFilter input').forEach(cb => {
    cb.addEventListener('change', highlightRoomTypes);
});


