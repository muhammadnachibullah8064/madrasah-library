// ওয়েবসাইটের নাম ও লোকেশন
document.getElementById('headerTitle').innerText = "X পাঠাগার, গাজীপুর";
document.getElementById('location').innerText = "X জায়গায়";

const bookListEl = document.getElementById('bookList');

// Google Apps Script JSON URL
const JSON_URL = "https://script.google.com/macros/s/AKfycbycZmNas8RZB0VXUjnlupqG0LcKZpeWl_P27scMa7byxSI0VK3EGiNZNsyRShRIKohhtQ/exec";

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
          <p><strong>লেখক:</strong> ${b.author}</p>
          ${b.translator ? `<p><strong>অনুবাদক:</strong> ${b.translator}</p>` : ''}
        </div>
        <div class="card-details">
          <ul style="list-style:none; padding:0; margin:0; text-align:left;">
            <li><i class="fas fa-book"></i> খণ্ড: ${b.volume}</li>
            <li><i class="fas fa-building"></i> প্রকাশনী: ${b.publisher}</li>
            <li><i class="fas fa-money-bill-wave"></i> মূল্য: ${b.price}</li>
            <li><i class="fas fa-calendar-alt"></i> প্রকাশের তারিখ: ${b.date}</li>
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

// Load books on page load
loadBooks();
