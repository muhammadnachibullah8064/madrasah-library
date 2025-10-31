// -----------------------------------------------------------
// ✅ নতুন প্যাজিনেশন ভ্যারিয়েবল
// -----------------------------------------------------------
let allBooks = []; // শীট থেকে লোড হওয়া সব বই এখানে থাকবে
const booksPerPage = 9; // প্রতি পেজে কটা বই দেখাবে (আপনি চাইলে পরিবর্তন করতে পারেন)
let currentPage = 1; // বর্তমানে ১ নম্বর পেজে আছি
let filteredBooks = [];

// ওয়েবসাইটের নাম ও লোকেশন
document.getElementById('headerTitle').innerText = "আল-ঈমান ইসলামিক পাঠাগার";
document.getElementById('location').innerText = "আড়াবাড়ী,মৌচাক,গাজীপুর";

const bookListEl = document.getElementById('bookList');

// 🔹 তোমার Google Apps Script ওয়েব অ্যাপ URL (যেটা ডিপ্লয় করে পেয়েছো)
const JSON_URL = "https://script.google.com/macros/s/AKfycbwK5I-dzATxojdoPYBjFAQ7d-lBk9heRBggp_CWQefYSp9RmZOHaY98IOB_owIm1oqjyg/exec";


// -----------------------------------------------------------
// ✅ ১. বই লোড ফাংশন (পরিবর্তিত)
// -----------------------------------------------------------
async function loadBooks() {
  try {
    const res = await fetch(JSON_URL);
    allBooks = await res.json(); 
    filteredBooks = allBooks; // ✅ নতুন: প্রাথমিক অবস্থায় সব বই filteredBooks এ থাকবে

    // এখন প্রাথমিক ডিসপ্লেতে displayFilteredBooks ব্যবহার করুন
    displayFilteredBooks(currentPage);

  } catch (err) {
    console.error("Books load failed", err);
    bookListEl.innerHTML = '<p class="card">কোনো বই পাওয়া যায়নি।</p>';
  }
}

// -----------------------------------------------------------
// ✅ ২. বই ডিসপ্লে ফাংশন (অপরিবর্তিত)
// -----------------------------------------------------------
// 📖 নির্দিষ্ট পেজের বই ডিসপ্লে করার ফাংশন
function displayBooks(page) {
    bookListEl.innerHTML = ''; // পুরোনো বই মুছে ফেলা
    currentPage = page;

    const startIndex = (page - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;

    // নির্দিষ্ট পেজের বইগুলো কেটে নেওয়া
    const pageBooks = allBooks.slice(startIndex, endIndex);

    pageBooks.forEach(b => {
        const div = document.createElement('div');
        div.className = 'card';
        const imgPath = `book image/${b.image}`;

        div.innerHTML = `
            <img src="${imgPath}" alt="${b.title}" />
            <div class="card-content">
                <h3>${b.title}</h3>
                <p>${b.author}</p>
            </div>

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

    // নতুন পেজ লোড হলে স্ক্রল করে উপরে যাওয়া
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // প্রতিবার বই ডিসপ্লে করার পর প্যাজিনেশন আপডেট করা
    setupPagination(allBooks.length); 
}

// -----------------------------------------------------------
// ✅ ৩. প্যাজিনেশন তৈরি ফাংশন (স্মার্ট প্যাজিনেশন লজিক)
// -----------------------------------------------------------
// 🔢 প্যাজিনেশন কন্ট্রোল তৈরি ও ডিসপ্লে (স্মার্ট প্যাজিনেশন)
function setupPagination(totalBooks) {
    const totalPages = Math.ceil(totalBooks / booksPerPage);
    if (totalPages <= 1) return; 

    // ✅ কতগুলো পেজ নম্বর দেখানো হবে তা এখানে সেট করা হলো (যেমন: বর্তমান পেজের ডানে ও বামে ২টি করে)
    const pageLimit = 1; 

    // 1. পুরোনো প্যাজিনেশন কন্টেইনার মুছে ফেলা
    let paginationContainer = document.getElementById('pagination-container');
    if (paginationContainer) {
        paginationContainer.remove();
    }
    
    // 2. নতুন প্রধান কন্টেইনার তৈরি
    paginationContainer = document.createElement('div');
    paginationContainer.id = 'pagination-container';
    paginationContainer.className = 'pagination'; 

    // 3. "আরো বই দেখুন" লেখাটি যোগ করা 
    const titleDiv = document.createElement('div');
    titleDiv.className = 'pagination-title'; 
    titleDiv.innerText = "আরো বই দেখুন:";
    paginationContainer.appendChild(titleDiv);

    // 4. বাটনগুলোর জন্য আলাদা কন্টেইনার
    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'pagination-buttons'; 
    
    // -----------------------------------------------------
    // 5. স্মার্ট প্যাজিনেশন লজিক
    // -----------------------------------------------------
    
    // 🔹 ফাংশন যা পেজ বাটন তৈরি করে যোগ করবে
    const addButton = (page, isEllipsis = false) => {
        if (isEllipsis) {
            const span = document.createElement('span');
            span.innerText = '...';
            // ডট ডট গুলো বাটন কন্টেইনারে যোগ করা
            buttonsDiv.appendChild(span); 
            return;
        }

        const button = document.createElement('button');
        button.innerText = page;
        
        if (page === currentPage) {
            button.classList.add('active');
        }

        button.addEventListener('click', () => {
            displayBooks(page);
        });

        buttonsDiv.appendChild(button);
    };

    // 🔹 প্রথম পেজ বাটন (যদি ১ নম্বর পেজ শেষ পেজ না হয়)
    if (totalPages >= 1) {
        addButton(1);
    }
    
    // 🔹 কখন '...' দেখাব
    let startPage = Math.max(2, currentPage - pageLimit);
    let endPage = Math.min(totalPages - 1, currentPage + pageLimit);

    let showStartEllipsis = startPage > 2;
    let showEndEllipsis = endPage < totalPages - 1;


    // 🔹 যদি বাম দিকের '...' দরকার হয়
    if (showStartEllipsis) {
        addButton(null, true);
    }

    // 🔹 মধ্যবর্তী পেজ বাটনগুলো
    for (let i = startPage; i <= endPage; i++) {
        addButton(i);
    }

    // 🔹 যদি ডান দিকের '...' দরকার হয়
    if (showEndEllipsis) {
        addButton(null, true);
    }
    
    // 🔹 শেষ পেজ বাটন (যদি শেষ পেজ ১ নম্বর পেজ না হয়)
    if (totalPages > 1) {
         if (totalPages !== 1) {
             addButton(totalPages);
        }
    }
    // -----------------------------------------------------

    paginationContainer.appendChild(buttonsDiv); 
    bookListEl.insertAdjacentElement('afterend', paginationContainer);
}


// ✅ বই লোড
loadBooks();

// 🗨️ কমেন্ট পাঠানোর ফাংশন (অপরিবর্তিত)
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

// -----------------------------------------------------------
// ReadMore এবং Payment ফাংশন (অপরিবর্তিত)
// -----------------------------------------------------------
function initReadMore() {
  try {
    console.log("🔁 initReadMore called");

    const aboutLeft = document.querySelector('.about-container .about-left');
    if (!aboutLeft) {
      console.warn('❌ .about-left element not found (inside initReadMore)');
      return;
    }

    const readMoreBtn = aboutLeft.querySelector('.read-more-btn');
    if (!readMoreBtn) {
      console.warn('❌ .read-more-btn not found inside .about-left');
      return;
    }

    console.log("✅ Found .about-left and button");

    const initialHeight = getComputedStyle(document.documentElement)
      .getPropertyValue('--left-initial-height')
      .trim() || '400px';

    aboutLeft.style.transition = 'max-height 330ms ease';
    aboutLeft.style.maxHeight = initialHeight;

    readMoreBtn.addEventListener('click', function(e){
      e.preventDefault();
      const isExpanded = aboutLeft.classList.toggle('expanded-box');
      console.log("🔘 Button clicked, expanded:", isExpanded);

      if (isExpanded) {
        aboutLeft.style.maxHeight = aboutLeft.scrollHeight + 'px';
        readMoreBtn.textContent = 'কম পড়ুন';
      } else {
        aboutLeft.style.maxHeight = initialHeight;
        readMoreBtn.textContent = 'আরো পড়ুন';
      }
    });

  } catch(err) {
    console.error("⚠ Error in initReadMore:", err);
  }
}

document.addEventListener('DOMContentLoaded', function(){
  console.log("✅ DOM loaded (index page)");
});

function initPaymentIcons() {
    const paymentIcons = document.querySelectorAll('.payment-icon');
    const unifiedForm = document.getElementById('unifiedPaymentForm');
    const donationForm = document.getElementById('donationForm');

    if (!unifiedForm) {
        console.warn('⚠ unifiedPaymentForm not found!');
        return;
    }
    
    // ফর্মের ডিফল্ট স্টাইল: 'payment-form' ক্লাসে থাকবে

    paymentIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            console.log('💡 Icon clicked:', icon.alt);
            // 💡 সমাধান: 'show' ক্লাসটি টগল করা
            unifiedForm.classList.toggle('show'); 
        });
    });

    if (donationForm) {
        donationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const donorName = document.getElementById('donorName').value;
            alert(`✅ ধন্যবাদ ${donorName}, আপনার দান গ্রহণ করা হয়েছে!`);
            donationForm.reset();
            unifiedForm.classList.remove('show'); // ফর্ম জমা হলে ফর্ম হাইড হবে
        });
    } else {
        console.warn('⚠ donationForm element not found!');
    }
}

// -----------------------------------------------------------
// ✅ সার্চ এবং ক্যাটাগরি ফাংশন
// -----------------------------------------------------------

// 🔍 সার্চ হ্যান্ডেলার ফাংশন
function handleSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    
    // ক্যাটাগরি ফিল্টার বাতিল করা
    document.getElementById('categoryBtn').innerText = "ক্যাটাগরি";
    
    if (query === "") {
        filteredBooks = allBooks; // সার্চ খালি হলে সব বই দেখাও
    } else {
        // বইয়ের নাম, লেখক বা প্রকাশনী দিয়ে ফিল্টার করা
        filteredBooks = allBooks.filter(book => 
            book.title.toLowerCase().includes(query) ||
            book.author.toLowerCase().includes(query) ||
            book.publisher.toLowerCase().includes(query)
        );
    }
    
    // নতুন ফিল্টার করা তালিকা দিয়ে ডিসপ্লে আপডেট করা
    displayFilteredBooks(1); 
}

// 📖 ডিসপ্লে ফাংশন যা ফিল্টার করা তালিকা ব্যবহার করবে
function displayFilteredBooks(page) {
    // এখন ডিসপ্লে ফাংশন allBooks এর বদলে filteredBooks ব্যবহার করবে
    bookListEl.innerHTML = ''; 
    currentPage = page;

    const currentBookList = filteredBooks.length > 0 ? filteredBooks : allBooks;

    // যদি filteredBooks এ কোনো বই না থাকে
    if (currentBookList.length === 0) {
        bookListEl.innerHTML = '<p class="card">আপনার সার্চ বা ক্যাটাগরির সাথে কোনো বইয়ের মিল পাওয়া যায়নি।</p>';
        setupPagination(0); // প্যাজিনেশন লুকিয়ে দাও
        return;
    }

    const startIndex = (page - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    const pageBooks = currentBookList.slice(startIndex, endIndex);

    // ... (বাকি বই ডিসপ্লে করার কোডটি এখানে কপি করে বসান)

    // দ্রুত সমাধানের জন্য: ডিসপ্লে ফাংশনটির এই অংশটি কপি করে বসান:
    pageBooks.forEach(b => {
        const div = document.createElement('div');
        div.className = 'card';
        const imgPath = `book image/${b.image}`;

        div.innerHTML = `
            <img src="${imgPath}" alt="${b.title}" />
            <div class="card-content">
                <h3>${b.title}</h3>
                <p>${b.author}</p>
            </div>

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
    // ... (কপি করার শেষ)

    window.scrollTo({ top: 0, behavior: 'smooth' });
    setupPagination(currentBookList.length); // ফিল্টার করা তালিকার উপর ভিত্তি করে প্যাজিনেশন তৈরি

}

// 🏷️ ক্যাটাগরি বাটন টগল ফাংশন
function toggleCategories() {
    const dropdown = document.getElementById('categoryDropdown');
    dropdown.classList.toggle('show');

    // যদি ড্রপডাউনটি সবেমাত্র খোলা হয়, তবে ক্যাটাগরি লোড করো
    if (dropdown.classList.contains('show')) {
        loadCategories();
    }
}

// 📚 ক্যাটাগরি লোড করার ফাংশন
function loadCategories() {
    const dropdown = document.getElementById('categoryDropdown');
    dropdown.innerHTML = ''; // পুরোনো ক্যাটাগরি মুছে ফেলা

    // সব বই থেকে ক্যাটাগরিগুলো বের করা
    const categories = new Set(allBooks.map(book => book.category));
    
    // "সমস্ত বই" অপশনটি যোগ করা
    const allBtn = document.createElement('p');
    allBtn.innerText = "সমস্ত বই";
    allBtn.onclick = () => filterByCategory(null, "সমস্ত বই");
    dropdown.appendChild(allBtn);

    categories.forEach(category => {
        if (category && category.trim() !== "") {
            const catBtn = document.createElement('p');
            catBtn.innerText = category;
            catBtn.onclick = () => filterByCategory(category, category);
            dropdown.appendChild(catBtn);
        }
    });
}

// 🔄 ক্যাটাগরি দিয়ে ফিল্টার করার ফাংশন
function filterByCategory(category, buttonText) {
    document.getElementById('categoryDropdown').classList.remove('show'); // ড্রপডাউন বন্ধ করো
    document.getElementById('searchInput').value = ''; // সার্চ বক্স খালি করো
    
    // ক্যাটাগরি বাটনের লেখা আপডেট করো
    document.getElementById('categoryBtn').innerText = buttonText;

    if (!category) {
        filteredBooks = allBooks; // "সমস্ত বই" দেখালে সব বই
    } else {
        filteredBooks = allBooks.filter(book => book.category === category);
    }

    // নতুন ফিল্টার করা তালিকা দিয়ে ডিসপ্লে আপডেট করা
    displayFilteredBooks(1);
}