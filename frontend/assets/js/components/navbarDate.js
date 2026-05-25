/* =========================
   REALTIME NAVBAR DATE
========================== */

const currentDateElements = document.querySelectorAll("[data-current-date]");

function getFormattedDate(date) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function renderCurrentDate() {
  const formattedDate = getFormattedDate(new Date());

  currentDateElements.forEach((element) => {
    element.textContent = formattedDate;
  });
}

if (currentDateElements.length) {
  renderCurrentDate();
  window.setInterval(renderCurrentDate, 60000);
}
