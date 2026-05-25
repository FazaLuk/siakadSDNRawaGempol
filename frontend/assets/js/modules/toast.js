const toastIcons = {
  success: "bi-check-circle-fill",
  error: "bi-x-circle-fill",
  warning: "bi-exclamation-triangle-fill",
  info: "bi-info-circle-fill",
  delete: "bi-trash-fill",
};

function getToastContainer() {
  let container = document.getElementById("toastContainer");

  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
  }

  if (container.parentElement !== document.body) {
    document.body.appendChild(container);
  }

  return container;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function showToast({
  type = "info",
  title = "Informasi",
  message = "",
  duration = 3000,
  actions = [],
} = {}) {
  const container = getToastContainer();
  const toast = document.createElement("div");
  const icon = toastIcons[type] || toastIcons.info;
  let closeTimer;

  toast.className = `app-toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-icon">
      <i class="bi ${icon}"></i>
    </div>
    <div class="toast-content">
      <h6>${escapeHtml(title)}</h6>
      ${message ? `<p>${escapeHtml(message)}</p>` : ""}
      ${actions.length ? `<div class="toast-actions"></div>` : ""}
    </div>
    <button class="toast-close" type="button" aria-label="Tutup notifikasi">
      <i class="bi bi-x"></i>
    </button>
  `;

  const closeToast = () => {
    window.clearTimeout(closeTimer);
    toast.classList.add("hide");
    toast.addEventListener("animationend", () => toast.remove(), {
      once: true,
    });
  };

  const actionsContainer = toast.querySelector(".toast-actions");

  actions.forEach((action) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `toast-action ${action.variant || "secondary"}`;
    button.textContent = action.label;
    button.addEventListener("click", () => {
      action.onClick?.();
      closeToast();
    });
    actionsContainer.appendChild(button);
  });

  toast.querySelector(".toast-close").addEventListener("click", closeToast);
  container.appendChild(toast);

  if (duration > 0 && !actions.length) {
    closeTimer = window.setTimeout(closeToast, duration);
  }

  return closeToast;
}
