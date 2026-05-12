if (window.Chart) {
  const series = await fetch('data/series.json').then(r => r.json());

  Chart.defaults.color = '#B7AE99';
  Chart.defaults.borderColor = '#2A2D36';
  Chart.defaults.font.family = '"Manrope", sans-serif';
  Chart.defaults.font.size = 12;

  const baseOpts = (yLabel) => ({
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1.5,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#15171C',
        borderColor: '#C7A050',
        borderWidth: 1,
        padding: 10,
        titleColor: '#EDE6D6',
        bodyColor: '#EDE6D6'
      }
    },
    scales: {
      x: { grid: { color: '#2A2D36' }, ticks: { color: '#7A7466' } },
      y: {
        grid: { color: '#2A2D36' },
        ticks: { color: '#7A7466' },
        title: { display: !!yLabel, text: yLabel, color: '#B7AE99' }
      }
    }
  });

  const mkLine = (canvasId, s, color, fill = true) => {
    const c = document.getElementById(canvasId);
    if (!c) return;
    new Chart(c, {
      type: 'line',
      data: {
        labels: s.data.map(d => d[0]),
        datasets: [{
          label: s.label,
          data: s.data.map(d => d[1]),
          borderColor: color,
          backgroundColor: fill ? color + '22' : 'transparent',
          fill,
          tension: 0.25,
          pointRadius: 3,
          pointHoverRadius: 6,
          borderWidth: 2
        }]
      },
      options: baseOpts()
    });
  };

  mkLine('chart-gold',     series.gold_price_usd_oz,         '#C7A050');
  mkLine('chart-russia',   series.russia_gold_production_t,  '#B97A4A');
  mkLine('chart-seligdar', series.seligdar_gold_production_kg, '#E0BE6A');
}
