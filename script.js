// ওয়েবসাইটের নাম ও লোকেশন
document.getElementById('headerTitle').innerText = "X পাঠাগার, গাজীপুর";
document.getElementById('location').innerText = "X জায়গায়";

const bookListEl = document.getElementById('bookList');

// 🔹 তোমার Google Apps Script ওয়েব অ্যাপ URL (যেটা ডিপ্লয় করে পেয়েছো)
const JSON_URL = "https://script.google.com/macros/s/AKfycbyoOf9vHU5DNHppwAuzRxV5xCprj543PI86Vg_APsCoisfHZWP-T_C3HjsvtpIeBlXOXg/exec";

// বই লোড ফাংশন
async function loadBooks() {
  try {
    const res = await fetch(JSON_URL);
    const books = await res.json();

    bookListEl.innerHTML = '';

    books.forEach(b => {
      const div = document.createElement('div');
      div.className = 'card';

      // লোকাল ফোল্ডার থেকে ইমেজ
      const imgPath = `book image/${b.image}`;

      div.innerHTML = `
        <img src="${imgPath}" alt="${b.title}" />
        <div class="card-content">
          <h3>${b.title}</h3>
          <p>${b.author}</p>
        </div>

        <!-- ডান পাশে কমেন্ট ও বুক বাটন -->
        <div class="card-buttons">
          <button onclick="handleComment('${b.title}')">কমেন্ট</button>
          <button onclick="handleBook('${b.title}')">বুক</button>
        </div>

        <div class="card-details">
          <ul style="list-style:none; padding:0; margin:0; text-align:left;">
            <li><i class="fas fa-book"></i> খণ্ড: ${b.volume}</li>
            <li><i class="fas fa-building"></i> প্রকাশনী: ${b.publisher}</li>
            <li><i class="fas fa-money-bill-wave"></i> মূল্য: ${b.price}</li>
            <li><i class="fas fa-calendar-alt"></i> ${b.date}</li>
          </ul>
        </div>
      `;
      bookListEl.appendChild(div);
    });

  } catch (err) {
    console.error("Books load failed", err);
    bookListEl.innerHTML = '<p class="card">কোনো বই পাওয়া যায়নি।</p>';
  }
}

// ✅ বই লোড
loadBooks();

// 🗨️ কমেন্ট পাঠানোর ফাংশন
async function handleComment(title) {
  const name = prompt("আপনার নাম লিখুন:");
  if (!name) return alert("নাম দেওয়া প্রয়োজন।");

  const comment = prompt(`"${title}" বই সম্পর্কে আপনার মতামত লিখুন:`);
  if (!comment) return alert("মন্তব্য খালি রাখা যাবে না।");

  try {
    const res = await fetch(JSON_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `name=${encodeURIComponent(name)}&bookTitle=${encodeURIComponent(title)}&comment=${encodeURIComponent(comment)}&status=Commented`
    });

    alert(`✅ "${title}" বইয়ের জন্য আপনার মন্তব্য সংরক্ষিত হয়েছে।`);

  } catch (err) {
    alert("❌ সংযোগে সমস্যা। আবার চেষ্টা করুন।");
  }
}
async function handleBook(title) {
  const name = prompt("আপনার নাম লিখুন:");
  if (!name) return alert("নাম দেওয়া প্রয়োজন।");

  try {
    const res = await fetch(JSON_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `name=${encodeURIComponent(name)}&bookTitle=${encodeURIComponent(title)}&status=Booked`
    });

    alert(`✅ "${title}" বইটি সফলভাবে বুক করা হয়েছে!`);

  } catch (err) {
    alert("❌ সংযোগে সমস্যা। আবার চেষ্টা করুন।");
  }
}
let currentType = null;
function togglePayment(type) {
  const section = document.getElementById("payment-section");
  const infoDiv = document.getElementById("payment-info");
  const title = document.getElementById("payment-title");

  if (currentType === type && section.classList.contains("show")) {
    section.classList.remove("show");
    currentType = null;
    return;
  }

  currentType = type;
  section.classList.add("show");

  let number = "";
  let qr = "";
  let titleText = "";

  if (type === "bkash") {
    number = "01342675757";
    qr = "images/bkash-qr.jpg";
    titleText = "বিকাশ পেমেন্ট তথ্য";
  } else if (type === "nagad") {
    number = "01342675757";
    qr = "images/nagad-qr.jpg";
    titleText = "নগদ পেমেন্ট তথ্য";
  } else {
    number = "2050 338 02 02384808";
    qr = "images/bank-qr.jpg";
    titleText = "ব্যাংক পেমেন্ট তথ্য";
  }

  title.innerHTML = titleText;
  infoDiv.innerHTML = `
    <div class="payment-box">
      <div class="payment-number">${number}</div>
      <img src="${qr}" alt="QR" class="qr-img">
    </div>
  `;
}
// ================================
// পূর্বের সব কোড (headerTitle, loadBooks, handleComment, handleBook, togglePayment)
// ================================

// ✅ এখন Ajax দিয়ে About text লোড করো
fetch('about-text.html')
  .then(response => response.text())
  .then(data => {
    const aboutLeft = document.getElementById('aboutLeft');
    aboutLeft.insertAdjacentHTML('beforeend', data);
  })
  .catch(error => console.error('Error loading about text:', error));
