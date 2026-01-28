document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".layout-option").forEach(option => {
    option.addEventListener("click", () => {
      const chosen = option.dataset.layout;

      // WAJIB pakai sessionStorage, bukan localStorage
      sessionStorage.setItem("selectedLayout", chosen);

      window.location.href = "camera.html";
    });
  });
});
