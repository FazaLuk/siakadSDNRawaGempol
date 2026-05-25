let studentChart = null;
let genderChart = null;

export function renderStudentChart(labels = [], data = [], options = {}) {
  const ctx = document.getElementById("studentChart");

  if (!ctx || typeof Chart === "undefined") return;

  if (studentChart) {
    studentChart.destroy();
  }

  const isCompact = options.compact === true;
  const colors = options.colors || ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd"];

  studentChart = new Chart(ctx, {
    type: isCompact ? "bar" : "bar",

    data: {
      labels,

      datasets: [
        {
          label: "Jumlah Siswa",

          data,

          borderRadius: 12,
          maxBarThickness: isCompact ? 56 : 72,

          backgroundColor: labels.map((_, index) => colors[index % colors.length]),
        },
      ],
    },

    options: {
      responsive: true,

      maintainAspectRatio: false,

      plugins: {
        legend: {
          display: false,
        },
      },

      scales: {
        y: {
          beginAtZero: true,

          ticks: {
            precision: 0,
          },

          grid: {
            color: "#e2e8f0",
          },
        },
        x: {
          grid: {
            display: false,
          },
        },
      },
    },
  });
}

export function renderGenderChart(maleCount = 0, femaleCount = 0) {
  const ctx = document.getElementById("genderChart");

  if (!ctx || typeof Chart === "undefined") return;

  if (genderChart) {
    genderChart.destroy();
  }

  genderChart = new Chart(ctx, {
    type: "doughnut",

    data: {
      labels: ["Laki-laki", "Perempuan"],
      datasets: [
        {
          data: [maleCount, femaleCount],
          backgroundColor: ["#2563eb", "#ec4899"],
          borderWidth: 0,
          hoverOffset: 6,
        },
      ],
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "68%",
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            usePointStyle: true,
            padding: 16,
          },
        },
      },
    },
  });
}

export function destroyGenderChart() {
  if (!genderChart) return;

  genderChart.destroy();
  genderChart = null;
}
