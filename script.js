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
