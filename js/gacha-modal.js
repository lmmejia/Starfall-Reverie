(() => {
  const modal = document.getElementById("gacha-modal");
  const fab = document.getElementById("gacha-fab");
  const closeBtn = document.getElementById("gacha-close");

  if (!modal || !fab) return;

  function openModal() {
    if (typeof modal.showModal === "function") {
      modal.showModal();
    } else {
      modal.setAttribute("open", "");
    }
  }

  function closeModal() {
    if (typeof modal.close === "function") {
      modal.close();
    } else {
      modal.removeAttribute("open");
    }
  }

  fab.addEventListener("click", () => {
    openModal();
    closeBtn?.focus();
  });

  closeBtn?.addEventListener("click", () => closeModal());

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
})();
