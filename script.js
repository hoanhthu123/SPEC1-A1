// 2 nút tròn ở góc phải dưới canvas, mỗi nút mở 1 pop-up giữa màn hình:
//   "i" -> thông tin dự án (#note)
//   "?" -> cách dùng (#help)
// đóng bằng nút ×, bấm ra ngoài pop-up, hoặc phím Esc. artwork vẫn chạy bình thường

const popups = [
  { box: document.getElementById("note"), btn: document.getElementById("note-btn") },
  { box: document.getElementById("help"), btn: document.getElementById("help-btn") }
];

// mở 1 pop-up (đóng pop-up còn lại), hoặc đóng hết nếu p = null
function showPopup(p) {
  for (let q of popups) {
    let open = q === p;
    q.box.hidden = !open;
    q.btn.setAttribute("aria-expanded", open);
  }
  if (p) p.box.querySelector(".note-close").focus();
}

for (let p of popups) {
  // bấm nút tròn: đang mở thì đóng, đang đóng thì mở
  p.btn.addEventListener("click", () => showPopup(p.box.hidden ? p : null));
  p.box.querySelector(".note-close").addEventListener("click", () => showPopup(null));
  // bấm vào nền mờ (ngoài pop-up) -> đóng
  p.box.addEventListener("click", (e) => {
    if (e.target === p.box) showPopup(null);
  });
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") showPopup(null);
  // R: sketch.js vẽ lá mới -> đóng pop-up để xem
  if (e.key === "r" || e.key === "R") showPopup(null);
  // I: mở pop-up thông tin dự án (bấm lần nữa để đóng)
  if (e.key === "i" || e.key === "I") {
    let info = popups[0];
    showPopup(info.box.hidden ? info : null);
  }
});
