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
const sampleModal = document.getElementById('sampleModal');
const pdfViewer = document.getElementById('pdfViewer');
const pdfFolderId = "readsample"
const activeTimers = {};
const CURRENT_USER_NAME = 'ব্যবহারকারীর নাম';


// 🔹 তোমার Google Apps Script ওয়েব অ্যাপ URL (যেটা ডিপ্লয় করে পেয়েছো)
const JSON_URL = "https://script.google.com/macros/s/AKfycby8W7DtG4F-vqWv58V16g_N3veyh6imtT14mPLnSVQsUpfUbMWP1NSPb8U36J8AeMXLSw/exec";


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
            displayFilteredBooks(page);
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

    // ✅ আপডেট করা বই ডিসপ্লে করার কোড:
    pageBooks.forEach(b => {
        const div = document.createElement('div');
        div.className = 'card';
        
        // ⭐ নতুন সংযোজন: কার্ডে ক্লিক করলে openModal ফাংশনটি কল হবে
        div.onclick = () => openModal(b); 
        
        const imgPath = `book image/${b.image}`;

        div.innerHTML = `
            <img src="${imgPath}" alt="${b.title}" />
            <div class="card-content">
                <h3>${b.title}</h3>
                <p>${b.author}</p>
                <p>${b.translator}</p>
            </div>
            
            `;
        bookListEl.appendChild(div);
    });

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
// -----------------------------------------------------------
// ✅ ৪. ডিটেইলস পপআপ ফাংশন
// -----------------------------------------------------------

const bookModal = document.getElementById('bookModal'); // ✅ এই লাইনটি রাখুন

// =====================================================================
// ⭐ ১. সহযোগী ফাংশনসমূহ (সংখ্যা ও প্রত্যয়)
// =====================================================================

function convertEnglishNumberToBangla(n) {
    if (typeof n !== 'number') return n;
    const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(n).split('').map(digit => banglaDigits[parseInt(digit)]).join('');
}

function getBanglaOrdinal(n) {
    const banglaNum = convertEnglishNumberToBangla(n);
    if (n === 1) return `${banglaNum}ম`;
    if (n === 2) return `${banglaNum}য়`;
    if (n === 3) return `${banglaNum}য়`;
    if (n === 4) return `${banglaNum}র্থ`;
    if (n === 5) return `${banglaNum}ম`;
    if (n === 6) return `${banglaNum}ষ্ঠ`;
    return `${banglaNum}ম`;
}

function convertBanglaNumberToEnglish(str) {
    if (!str) return str;
    const bangla = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    const english = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    return str.replace(/[০-৯]/g, function (match) {
        return english[bangla.indexOf(match)];
    });
}


// =====================================================================
// ⭐ ২. বুকিং/টাইমার ম্যানেজমেন্ট ফাংশনসমূহ (JSON_URL ব্যবহার করে সেভ)
// =====================================================================

// ⭐⭐ বুকিং ডিসপ্লে করার সাধারণ ফাংশন ⭐⭐
function displayBookedVolume(bookedData, bookTitle, endTime) {
    const bookedVolumeEl = document.getElementById('userBookedVolume');
    const timerId = `timer_${bookTitle.replace(/\s/g, '_')}`; 
    
    // শুধু খণ্ড অংশটি বের করা 
    const volumeOnly = bookedData.volumeName ? bookedData.volumeName.replace(bookedData.bookTitle, '').trim() : bookedData.bookTitle;

    if (bookedVolumeEl) {
        // নিশ্চিত করতে যে বুকিং ডিসপ্লে এর আগে hr ট্যাগ চলে আসে
        bookedVolumeEl.innerHTML = `
            <hr class="modal-detail-list-divider">
            <p style="font-size: 1.1em; margin-bottom: 5px;">
                <i class="fas fa-check-circle" style="color: green; margin-right: 8px;"></i> 
                <strong>${volumeOnly}:</strong> 
                <span id="${timerId}" style="font-weight: bold; color: #e74c3c; margin-left: 10px;"></span>
            </p>
        `;
    }
    
    // টাইমার শুরু করা
    updateTimer(endTime, timerId);
}

// ⭐⭐ ৭ দিনের কাউন্টডাউন টাইমার আপডেট করার ফাংশন ⭐⭐
function updateTimer(endTime, elementId) {
    // চলমান টাইমার বন্ধ করা
    if (activeTimers[elementId]) {
        clearInterval(activeTimers[elementId]);
    }
    
    const timerInterval = setInterval(() => {
        const now = new Date().getTime();
        const distance = endTime - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        const banglaDays = convertEnglishNumberToBangla(days);
        const banglaHours = convertEnglishNumberToBangla(hours);
        const banglaMinutes = convertEnglishNumberToBangla(minutes);
        const banglaSeconds = convertEnglishNumberToBangla(seconds);
        
        const timerElement = document.getElementById(elementId);
        if (timerElement) {
            timerElement.innerHTML = `
                ${banglaDays} দিন ${banglaHours} ঘণ্টা ${banglaMinutes} মিনিট ${banglaSeconds} সেকেন্ড 
            `;
        }

        if (distance < 0) {
            clearInterval(timerInterval);
            delete activeTimers[elementId];
            
            const bookedVolumeEl = document.getElementById('userBookedVolume');
            if (bookedVolumeEl) {
                // বুকিং শেষ হলে শুধু HTML পরিবর্তন করা
                bookedVolumeEl.innerHTML = '<p style="font-style: italic; color: red;">বুকিংয়ের সময় শেষ হয়েছে।</p>';
            }
        }
    }, 1000);
    
    activeTimers[elementId] = timerInterval;
}


// ⭐⭐ মূল বুকিং হ্যান্ডেল করার ফাংশন (JSON_URL ব্যবহার করে Apps Script-এ সেভ) ⭐⭐
function handleVolumeBooking(bookTitle, volumeNumber, volumeName) {
    if (!CURRENT_USER_NAME || CURRENT_USER_NAME === 'ব্যবহারকারীর নাম') {
        alert("বুকিং করার জন্য প্রথমে আপনার ব্যবহারকারীর নাম সেট করুন।");
        return;
    }
    
    // 1. ডেটা তৈরি
    const bookingData = {
        name: CURRENT_USER_NAME,
        bookTitle: volumeName, 
        status: "Booked"
    };
    
    // 2. Apps Script-এ POST করা (বুকিং সেভ)
    fetch(JSON_URL, { // <--- JSON_URL ব্যবহার করা হলো
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
        mode: 'no-cors' 
    })
    .then(response => {
        console.log("Booking request sent to server.");
        
        // বুকিং সেভ সফল হলে, সাত দিনের বুকিং টাইম শুরু হবে
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        const endTime = new Date().getTime() + sevenDays;

        // তাৎক্ষণিক ডিসপ্লে আপডেট করা
        displayBookedVolume({bookTitle: bookTitle, volumeName: volumeName}, bookTitle, endTime);
    })
    .catch(error => {
        console.error('Error saving booking:', error);
        alert('বুকিং সেভ করতে সমস্যা হয়েছে।');
    });
}


// ⭐⭐ শীট থেকে বুকিং ডেটা লোড করার ফাংশন (লোকাল স্টোরেজ বাদ দিয়ে পরিষ্কার করা হলো) ⭐⭐
function checkAndDisplayBookedVolume(book) {
    // লোকাল স্টোরেজ ব্যবহার করা হচ্ছে না, তাই কেবল ডিসপ্লে এরিয়া পরিষ্কার করা হলো।
    // শীট থেকে লোড করার লজিক আপনার Apps Script এ যুক্ত হলে এই ফাংশনটি আপডেট করা যাবে।
    const bookedVolumeEl = document.getElementById('userBookedVolume');
    if (bookedVolumeEl) bookedVolumeEl.innerHTML = '';
}


// ⭐⭐ খণ্ড ড্রপডাউন লোড করার ফাংশন ⭐⭐
function loadVolumeDropdown(book, count) {
    const dropdown = document.getElementById('volumeDropdown');
    if (!dropdown) return;
    
    dropdown.innerHTML = '';
    
    if (count > 1) {
        for (let i = 1; i <= count; i++) {
            const ordinal = getBanglaOrdinal(i);
            const volumeName = `${book.title} ${ordinal} খণ্ড`;
            
            const item = document.createElement('a');
            item.href = '#';
            item.innerText = volumeName;
            
            item.onclick = (e) => {
                e.preventDefault();
                handleVolumeBooking(book.title, i, volumeName);
                toggleVolumeDropdown(e);
            };
            dropdown.appendChild(item);
        }
    } else {
        const item = document.createElement('span');
        item.innerText = "একটিমাত্র খণ্ড";
        item.style.padding = '12px 16px';
        dropdown.appendChild(item);
    }
}

// ⭐⭐ ড্রপডাউন টগল করার ফাংশন ⭐⭐
function toggleVolumeDropdown(event) {
    event.stopPropagation();
    document.getElementById("volumeDropdown").classList.toggle("show");
}


// =====================================================================
// ⭐ ৩. openModal ফাংশন (চূড়ান্ত পরিবর্তিত)
// =====================================================================

// 📖 পপআপ খোলে এবং ডেটা লোড করে (চূড়ান্ত পরিবর্তিত)
function openModal(book) {
    // 1. ডেটা লোড করা
    document.getElementById('modalImage').src = `book image/${book.image}`;
    document.getElementById('modalTitle').innerText = book.title;
    
    // 2. অনুবাদক কলামের জন্য বিশেষ হ্যান্ডলিং
    const translatorData = book.translator && book.translator.trim() !== '' ? book.translator : null;
    
    // modal-details-grid এর HTML কন্টেন্ট তৈরি
    const detailsGrid = document.querySelector('.modal-details-grid');
    
    // খণ্ড গণনা লজিক
    const volumeText = book.volume;
    let volumeCount = 0;
    
    const match = volumeText.match(/[০-৯\d]+/); 
    
    if (match) {
        const englishNumberStr = convertBanglaNumberToEnglish(match[0]);
        volumeCount = parseInt(englishNumberStr, 10);
    }
    
    // ⭐ ১. মূল ডিটেইলস অংশ:
    let baseDetailsHTML = `
        <p><i class="fas fa-pen-nib"></i> <strong>লেখক:</strong> <span id="modalAuthor">${book.author}</span></p>
        
        ${translatorData ? 
            `<p><i class="fas fa-language"></i> <strong>অনুবাদক:</strong> <span id="modalTranslator">${translatorData}</span></p>` 
            : 
            ''
        }
        
        <p>
            <i class="fas fa-book-open"></i> 
            <strong>খণ্ড:</strong> 
            <span id="modalVolume">${volumeText}</span>
        </p>
        
        <p><i class="fas fa-building"></i> <strong>প্রকাশনী:</strong> <span id="modalPublisher">${book.publisher}</span></p>
        <p><i class="fas fa-tags"></i> <strong>মূল্য:</strong> <span id="modalPrice">${book.price}</span></p>
        <p><i class="fas fa-calendar-alt"></i> <strong>তারিখ:</strong> <span id="modalDate">${book.date}</span></p>
        <p><i class="fas fa-bookmark"></i> <strong>ক্যাটাগরি:</strong> <span id="modalCategory">${book.category}</span></p>
    `;
    
    // ⭐ ২. বুকিং এবং কমেন্ট বাটন কন্টেইনার তৈরি
    let actionButtonsHTML = `
        <hr class="modal-detail-list-divider">
        <div id="bookingActions" style="grid-column: 1 / -1; display: flex; justify-content: space-between; align-items: center; padding: 10px 0;">
            <div class="dropdown-container">
                <button class="action-button primary" onclick="toggleVolumeDropdown(event)">
                    <i class="fas fa-book-bookmark"></i> বুক করুন
                </button>
                <div id="volumeDropdown" class="dropdown-content">
                    </div>
            </div>
            
            <button class="action-button secondary" onclick="handleComment('${book.title}')">
                <i class="fas fa-comment"></i> কমেন্ট
            </button>
        </div>
        <div id="userBookedVolume" style="grid-column: 1 / -1; padding-top: 10px;"></div>
    `;

    // ৩. সব ডিটেইলস একত্রিত করা
    detailsGrid.innerHTML = `
        ${baseDetailsHTML} 
        ${actionButtonsHTML}
    `;

    // ৪. খণ্ড ড্রপডাউন লোড করা
    loadVolumeDropdown(book, volumeCount);

    // ⭐ বুকিং স্ট্যাটাস লোড করা (লোকাল স্টোরেজ বাদ দেওয়া হয়েছে)
    checkAndDisplayBookedVolume(book); 

    // ৫. "একটু পড়ুন" এর জন্য ক্লিক ইভেন্ট সেট করা
    const readSampleContainer = document.querySelector('.read-sample-container');
    readSampleContainer.onclick = () => openSampleModal(book.readsamplelink, book.title); 

    // ৬. পপআপ দেখানো
    bookModal.classList.add('active');
    
    // ৭. পপআপের বাইরে ক্লিক করলে বন্ধ করা ও ড্রপডাউন লজিক
    window.onclick = function(event) {
        if (event.target == bookModal) {
            closeModal();
        }
        if (!event.target.matches('.action-button')) {
            const dropdowns = document.getElementsByClassName("dropdown-content");
            for (let i = 0; i < dropdowns.length; i++) {
                const openDropdown = dropdowns[i];
                if (openDropdown.classList.contains('show')) {
                    openDropdown.classList.remove('show');
                }
            }
        }
    }
}

// ❌ পপআপ বন্ধ করে (এই ফাংশনে কোনো পরিবর্তন নেই)
function closeModal() {
    bookModal.classList.remove('active');
    window.onclick = null; // ইভেন্ট লিসেনার মুছে ফেলা
}

// Esc key চাপলে পপআপ বন্ধ করার জন্য (এই ফাংশনে কোনো পরিবর্তন নেই)
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && bookModal.classList.contains('active')) {
        closeModal();
    }
});
// -----------------------------------------------------------
// ✅ ৫. Read Sample (একটু পড়ুন) মডাল ফাংশন (লোকাল পাথ আপডেট ও ট্র্যাকিং)
// -----------------------------------------------------------

function openSampleModal(pdfFileName, bookTitle) {
    
    // 🛑 নিরাপত্তা চেক: ফাইলের নাম খালি কিনা
    if (!pdfFileName || pdfFileName.trim() === '') {
        console.error("❌ ERROR: pdfFileName is empty or null.");
        alert("দুঃখিত, এই বইটির কোনো স্যাম্পল পৃষ্ঠা উপলব্ধ নেই।");
        return;
    }
    
    // PDF ফাইলটি সার্ভারের 'readsample' ফোল্ডার থেকে লোড করা হচ্ছে
    // নিশ্চিত করুন যে আপনার ওয়েবসাইটে 'readsample' নামে একটি ফোল্ডার আছে
    const pdfPath = `readsample/${pdfFileName}`; 
    
    // ⭐⭐ ১. কনসোলে চূড়ান্ত লোডিং পাথটি দেখুন ⭐⭐
    console.log(`✅ Attempting to load PDF for book: ${bookTitle}`);
    console.log(`🔎 PDF Path: ${pdfPath}`); 
    
    // 1. মডালের টাইটেল সেট করা
    document.getElementById('sampleTitle').innerText = `একটু পড়ুন: ${bookTitle}`;
    
    // 2. সরাসরি PDF ভিউয়ারের সোর্স সেট করা
    pdfViewer.src = pdfPath; 

    // 3. স্যাম্পল পপআপ দেখানো
    sampleModal.classList.add('active');
    
    // ⭐⭐ ২. iframe এর src সেট হওয়ার পরেও কনসোলে চেক করুন ⭐⭐
    // এই পাথটি URL বারে সরাসরি প্রবেশ করালে ফাইলটি লোড হওয়া উচিত
    setTimeout(() => {
        console.log(`✅ PDF Viewer SRC set to: ${pdfViewer.src}`);
    }, 100);
}
// ... closeSampleModal ফাংশনটি নিচে অপরিবর্তিত থাকবে ...

function closeSampleModal() { // এই ফাংশনটি অপরিবর্তিত থাকবে
    sampleModal.classList.remove('active');
    pdfViewer.src = ''; 
}