// pop-up
// và lúc đó artwork mới bắt đầu chạy.

const popup = document.getElementById("popup");
const closeBtn = document.getElementById("popup-close");
let started = false; // để chỉ chạy 1 lần

function closePopup() {
  if (started) return;
  started = true;

  popup.classList.add("hidden"); // mờ dần (xem style.css)
  setTimeout(() => popup.remove(), 400); // xoá hẳn sau khi mờ xong

  loop(); // cho draw() trong sketch.js chạy tiếp
}

closeBtn.addEventListener("click", closePopup);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closePopup();
});
