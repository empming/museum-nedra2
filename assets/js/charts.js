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

  // ── #4 двухосевой: цена золота (USD/oz) и курс USD/RUB ─────────────────────
  const dualEl = document.getElementById('chart-gold-rub');
  if (dualEl) {
    const goldData = series.gold_price_usd_oz.data;
    const rubData  = series.usd_rub.data;
    // объединяем по годам так, чтобы лейблы шли из union
    const yearsSet = new Set([...goldData.map(d => d[0]), ...rubData.map(d => d[0])]);
    const years = [...yearsSet].sort((a, b) => a - b);
    const lookup = (arr) => Object.fromEntries(arr);
    const goldMap = lookup(goldData);
    const rubMap  = lookup(rubData);
    new Chart(dualEl, {
      type: 'line',
      data: {
        labels: years,
        datasets: [
          {
            label: 'Цена золота, USD/oz',
            data: years.map(y => goldMap[y] ?? null),
            borderColor: '#C7A050',
            backgroundColor: '#C7A05022',
            yAxisID: 'y',
            tension: .25,
            borderWidth: 2,
            pointRadius: 2,
            pointHoverRadius: 6,
            spanGaps: true,
          },
          {
            label: 'Курс USD/RUB',
            data: years.map(y => rubMap[y] ?? null),
            borderColor: '#7AB6E0',
            backgroundColor: 'transparent',
            yAxisID: 'y1',
            tension: .25,
            borderWidth: 2,
            borderDash: [4, 3],
            pointRadius: 2,
            pointHoverRadius: 6,
            spanGaps: true,
          },
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1.5,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: true, labels: { color: '#B7AE99', boxWidth: 16, font: { size: 11 } } },
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
          y:  { type: 'linear', position: 'left',  grid: { color: '#2A2D36' }, ticks: { color: '#C7A050' }, title: { display: true, text: 'USD/oz', color: '#C7A050' } },
          y1: { type: 'linear', position: 'right', grid: { drawOnChartArea: false }, ticks: { color: '#7AB6E0' }, title: { display: true, text: '₽/USD',  color: '#7AB6E0' } },
        }
      }
    });
  }

  // ── #5 доля Селигдара в добыче РФ, % ──────────────────────────────────────
  const shareEl = document.getElementById('chart-seligdar-share');
  if (shareEl) {
    const ru = Object.fromEntries(series.russia_gold_production_t.data); // тонны
    const sg = series.seligdar_gold_production_kg.data;                    // кг
    const points = sg
      .map(([y, kg]) => [y, ru[y] ? (kg / (ru[y] * 1000)) * 100 : null])
      .filter(([, v]) => v != null);
    // если для конкретного года в ru нет точки — линейная интерполяция
    const interp = (year) => {
      const known = series.russia_gold_production_t.data;
      if (ru[year]) return ru[year];
      const before = known.filter(([y]) => y < year).pop();
      const after  = known.find(([y]) => y > year);
      if (!before || !after) return null;
      const t = (year - before[0]) / (after[0] - before[0]);
      return before[1] + t * (after[1] - before[1]);
    };
    const fullPoints = sg.map(([y, kg]) => {
      const ruT = interp(y);
      return [y, ruT ? (kg / (ruT * 1000)) * 100 : null];
    });
    new Chart(shareEl, {
      type: 'bar',
      data: {
        labels: fullPoints.map(d => d[0]),
        datasets: [{
          label: 'Доля Селигдара, %',
          data: fullPoints.map(d => +d[1].toFixed(2)),
          backgroundColor: '#C7A05088',
          borderColor: '#C7A050',
          borderWidth: 1,
        }]
      },
      options: {
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
            bodyColor: '#EDE6D6',
            callbacks: { label: ctx => ` ${ctx.formattedValue} %` }
          }
        },
        scales: {
          x: { grid: { color: '#2A2D36' }, ticks: { color: '#7A7466' } },
          y: { grid: { color: '#2A2D36' }, ticks: { color: '#7A7466', callback: v => v + ' %' }, title: { display: true, text: '% от добычи РФ', color: '#B7AE99' } }
        }
      }
    });
  }

  // ── #6 капитализация мейджоров (grouped bar) ──────────────────────────────
  const capsEl = document.getElementById('chart-caps');
  if (capsEl && series.market_cap_2014_2022) {
    const cap = series.market_cap_2014_2022;
    new Chart(capsEl, {
      type: 'bar',
      data: {
        labels: cap.years,
        datasets: cap.companies.map(c => ({
          label: c.name,
          data: c.values,
          backgroundColor: c.color + 'BB',
          borderColor: c.color,
          borderWidth: 1,
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1.5,
        plugins: {
          legend: { display: true, labels: { color: '#B7AE99', boxWidth: 14, font: { size: 11 } } },
          tooltip: {
            backgroundColor: '#15171C',
            borderColor: '#C7A050',
            borderWidth: 1,
            padding: 10,
            titleColor: '#EDE6D6',
            bodyColor: '#EDE6D6',
            callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.formattedValue} млрд ₽` }
          }
        },
        scales: {
          x: { grid: { color: '#2A2D36' }, ticks: { color: '#7A7466' } },
          y: { grid: { color: '#2A2D36' }, ticks: { color: '#7A7466' }, title: { display: true, text: 'млрд ₽', color: '#B7AE99' } }
        }
      }
    });
  }
}
