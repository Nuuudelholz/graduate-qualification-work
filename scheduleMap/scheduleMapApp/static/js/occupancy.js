document.addEventListener('DOMContentLoaded', function() {
    const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
    const analyzeBtn = document.getElementById('analyze-btn');
    const resultsContainer = document.getElementById('occupancy-results');
    const chartContainer = document.getElementById('chart-container');

    const showOccupancy = document.getElementById('analyze-btn');
    const analysisSection = document.getElementById('analysis-section');
    const closeOccupancy = document.getElementById('closeOccupancy');

    closeOccupancy.addEventListener('click', function() {
        if (analysisSection.classList.contains('close')) {
            analysisSection.classList.remove('close');
            analysisSection.classList.add('open');
        }
        else {
            analysisSection.classList.add('close');
            analysisSection.classList.remove('open');
        }
    });

    showOccupancy.addEventListener('click', function() {
        if (analysisSection.classList.contains('open')) {
            analysisSection.classList.remove('open');
            analysisSection.classList.add('close');
        }
        else {
            analysisSection.classList.add('open');
            analysisSection.classList.remove('close');
        }
    });

    function analyzeOccupancy() {
        fetch('/analyze/', {  // Используйте отдельный URL
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({ action: 'analyze_occupancy' })
        })
        .then(response => {
            console.log('Status:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('Data:', data);
            renderChart(data);
            showResults(data);
        })
        .catch(error => console.error('Error:', error));
    }

    function renderChart(data) {
        const ctx = document.createElement('canvas');
        chartContainer.innerHTML = '';
        chartContainer.appendChild(ctx);

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.rooms,
                datasets: [{
                    label: 'Количество занятий',
                    data: data.counts,
                    backgroundColor: 'rgba(77, 26, 204, 0.5)',
                    borderColor: 'rgba(42, 20, 104, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function showResults(data) {
        if (!data.rooms || !data.counts) {
            resultsContainer.innerHTML = '<div class="error">Нет данных для отображения</div>';
            return;
        }

        resultsContainer.innerHTML = data.rooms.map((room, i) =>
            `<div class="result-item">Аудитория ${room} - занята ${data.counts[i]} раз</div>`
        ).join('');
    }

    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', analyzeOccupancy);
    }
});