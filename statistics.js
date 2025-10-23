// Google Apps Script URL (doGet URL)
const JSON_URL = "https://script.google.com/macros/s/AKfycbzRM8PrY-e-ZRgyJAVpjZFEYmb2rngjBVKpueclNWFJFrkfuBFkoOy6sTRS8VD5y5RT-g/exec?type=stats"; // <-- এখানে ?type=stats গুরুত্বপূর্ণ

// Chart color palette
const colors = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
  '#FF9F40', '#C9CBCF', '#8A89A6', '#F67019', '#4D5360'
];

async function loadStatistics() {
  try {
    const res = await fetch(JSON_URL);
    const stats = await res.json(); // এখন stats.books এবং stats.readers থাকবে

    // ---------- Top 10 সর্বাধিক পঠিত বই ----------
    const sortedBooks = Object.entries(stats.books);
    const bookLabels = sortedBooks.map(e => e[0]);
    const bookData = sortedBooks.map(e => e[1]);

    new Chart(document.getElementById('mostReadBooksChart'), {
      type: 'bar',
      data: {
        labels: bookLabels,
        datasets: [{
          label: 'পাঠ সংখ্যা',
          data: bookData,
          backgroundColor: colors,
          borderColor: '#333',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } }
      }
    });

    // ---------- Top 10 সর্বাধিক পাঠক ----------
    const sortedReaders = Object.entries(stats.readers);
    const userLabels = sortedReaders.map(e => e[0]);
    const userData = sortedReaders.map(e => e[1]);

    new Chart(document.getElementById('mostActiveReadersChart'), {
      type: 'bar',
      data: {
        labels: userLabels,
        datasets: [{
          label: 'বই সংখ্যা',
          data: userData,
          backgroundColor: colors,
          borderColor: '#333',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } }
      }
    });

  } catch (err) {
    console.error("Statistics load failed", err);
  }
}

// লোড হওয়ার সাথে সাথে কল
loadStatistics();
