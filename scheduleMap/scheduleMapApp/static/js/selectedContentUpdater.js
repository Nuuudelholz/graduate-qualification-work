function updateSelectedContent() {
    const buildingSelect = document.getElementById('fileSelect');
    const weekSelect = document.getElementById('weekSelect');
    const daySelect = document.getElementById('daySelect');

    document.getElementById('selectedBuildingText').textContent = `Корпус: ${buildingSelect.value || 'не выбран'}`;
    document.getElementById('selectedWeekText').textContent = `Неделя: ${weekSelect.value || 'не выбрана'}`;
    document.getElementById('selectedDayText').textContent = `День: ${daySelect.value || 'не выбран'}`;
}

function updateFloorText(floorText) {
    document.getElementById('selectedFloorText').textContent = `Этаж: ${floorText}`;
}

function updateTimeText(timeText) {
    document.getElementById('selectedTimeText').textContent = `Время: ${timeText}`;
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('fileSelect').addEventListener('change', updateSelectedContent);
    document.getElementById('weekSelect').addEventListener('change', updateSelectedContent);
    document.getElementById('daySelect').addEventListener('change', updateSelectedContent);

    updateSelectedContent();
    updateFloorText('не выбран');
    updateTimeText('не выбрано');
});