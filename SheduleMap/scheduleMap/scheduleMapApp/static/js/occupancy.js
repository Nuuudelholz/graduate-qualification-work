
let chartData = null;
let chartInstance = null;
let сhartType = 'bar';

document.addEventListener('DOMContentLoaded', function() {
    const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
    const analyzeBtn = document.getElementById('analyze-btn');
    const resultsContainer = document.getElementById('occupancy-results');
    const chartContainer = document.getElementById('chart-container');

    const showOccupancy = document.getElementById('analyze-btn');
    const analysisSection = document.getElementById('analysis-section');
    const closeOccupancy = document.getElementById('closeOccupancy');

    showOccupancy.addEventListener('click', function() {
        if (analysisSection.classList.contains('open')) {
            analysisSection.classList.remove('open');
            analysisSection.classList.add('close');
        } else {
            analysisSection.classList.remove('close');
            analysisSection.classList.add('open');
        }
    });


    closeOccupancy.addEventListener('click', function() {
        if (analysisSection.classList.contains('open')) {
            analysisSection.classList.remove('open');
            analysisSection.classList.add('close');
        } else {
            analysisSection.classList.remove('close');
            analysisSection.classList.add('open');
        }
    });

    function analyzeOccupancy() {
        fetch('/analyze/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({})
        })
        .then(res => res.json())
        .then(data => {
            console.log("График: ", data);
            chartData = data;
            chartInstance = renderOccupancyChart(data);
            showResults(data);
        })
        .catch(error => console.error("Ошибка анализа:", error));
    }

    function renderOccupancyChart(data) {
        chartContainer.innerHTML = '';
        const canvas = document.createElement('canvas');
        chartContainer.appendChild(canvas);

        const isBar = сhartType === 'bar';

        return new Chart(canvas, {
            type: сhartType,
            data: {
                labels: data.rooms,
                datasets: [{
                    label: 'Количество занятий',
                    data: data.counts,
                    backgroundColor: generateColors(data.rooms.length),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: !isBar,
                        position: 'right'
                    }
                },
                scales: isBar ? {
                    x: {
                        title: {
                            display: true,
                            text: 'Аудитории'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Количество занятий'
                        }
                    }
                } : {}
            }
        });
    }

    function showResults(data) {
        resultsContainer.innerHTML = data.rooms.map((room, i) =>
            `<div class="result-item">Аудитория ${room} — ${data.counts[i]} занятий</div>`
        ).join('');
    }

    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', analyzeOccupancy);
    }

    document.getElementById('floorFilter').addEventListener('change', function () {
        const selectedFloor = this.value;
        if (!chartData || !chartInstance) return;

        const filtered = filterChartData(chartData, selectedFloor);
        updateChart(chartInstance, filtered);
        showResults(filtered);
    });

    function filterChartData(data, floor) {
        if (!floor) return data;

        const filtered = { rooms: [], counts: [] };
        data.rooms.forEach((room, i) => {
            const match = room.match(/(\d+)/);
            const roomFloor = match?.[1]?.charAt(0);

            if (roomFloor === floor) {
                filtered.rooms.push(room);
                filtered.counts.push(data.counts[i]);
            }
        });
        return filtered;
    }

    function updateChart(chart, newData) {
        chart.data.labels = newData.rooms;
        chart.data.datasets[0].data = newData.counts;
        chart.update();
    }

    document.getElementById('chartTypeSelect').addEventListener('change', function() {
        сhartType = this.value;
        if (chartData) {
            chartInstance = renderOccupancyChart(chartData);
            showResults(chartData);
        }
    });

    document.getElementById('download-pdf').addEventListener('click', function () {
        const section = document.getElementById('analysis-section');

        html2canvas(section, {
            scale: 2,
            useCORS: true
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jspdf.jsPDF('p', 'mm', 'a4');

            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save('Анализ_занятости.pdf');
        });
    });

    function generateColors(count) {
        const colors = [];
        const steps = 360 / count;
        for (let i = 0; i < count; i++) {
            colors.push(`hsl(${Math.round(i * steps)}, 100%, 50%)`);
        }
        return colors;
    }

    document.getElementById('roomSelect').addEventListener('change', function () {
        const room = this.value;
        if (!room) return;

        fetch('/room-schedule/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('meta[name="csrf-token"]').content
            },
            body: JSON.stringify({ room })
        })
        .then(res => res.json())
        .then(data => {
            renderRoomScheduleChart(data);
        })
        .catch(err => {
            console.error("Ошибка загрузки графика по аудитории:", err);
        });
    });

    let roomChartInstance = null;

    function renderRoomScheduleChart(data) {
    console.log("График по аудитории:", data);

        const ctx = document.getElementById('room-schedule-chart').getContext('2d');

        if (roomChartInstance) {
            roomChartInstance.destroy();
        }

        roomChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Количество занятий по неделям',
                    data: data.data,
                    fill: false,
                    borderColor: '#8c75e4',
                    tension: 0.2,
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'top' }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Номер недели'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        },
                        title: {
                            display: true,
                            text: 'Количество занятий'
                        }
                    }
                }
            }

        });

    }

    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

          const tabId = btn.dataset.tab;
          document.getElementById(tabId).classList.add('active');
        });
    });

});
