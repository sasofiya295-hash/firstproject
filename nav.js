document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll(".nav-link");

  // ambil nama file/page dari URL
  let currentPage = window.location.pathname.split("/").pop().toLowerCase();

  // fallback untuk halaman yang tidak punya nama file (misal domain langsung)
  if (currentPage === "" || currentPage === "/") {
    currentPage = "index.html";
  }

  links.forEach(link => {
    const href = link.getAttribute("href").toLowerCase();

    // highlight untuk file HTML & PHP
    if (href === currentPage) {
      link.classList.add("active-pill");
    }

    // extra: kalau file HTML ke PHP sama-sama mewakili "Contact"
    if (
      (currentPage.includes("contact") && href.includes("contact")) ||
      (currentPage === "contact-user.php" && href === "contact-user.php")
    ) {
      link.classList.add("active-pill");
    }
  });
});
