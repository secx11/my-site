if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker مسجل بنجاح:', registration);
      })
      .catch(error => {
        console.log('فشل تسجيل Service Worker:', error);
      });
  });
}

let websites = {};

// جلب البيانات من data.json
fetch("data.json")
  .then(response => {
    if (!response.ok) {
      throw new Error("فشل في جلب البيانات");
    }
    return response.json();
  })
  .then(data => {
    websites = data;
    console.log("تم تحميل البيانات:", websites);
  })
  .catch(error => {
    console.error("خطأ:", error);
    document.getElementById("resultsContainer").textContent = "حدث خطأ أثناء تحميل البيانات.";
  });

// باقي الكود (showSuggestions, performSearch, إلخ) كما هو

// عناصر DOM
const searchInput = document.getElementById("searchInput");
const resultsContainer = document.getElementById("resultsContainer");
const suggestionsContainer = document.getElementById("suggestions");

// جلب البيانات من ملف JSON
fetch("data.json")
  .then(response => {
    if (!response.ok) {
      throw new Error("فشل في جلب البيانات");
    }
    return response.json();
  })
  .then(data => {
    websites = data; // تعبئة الكائن بالبيانات
    console.log("تم تحميل البيانات:", websites); // للتأكد من التحميل
  })
  .catch(error => {
    console.error("خطأ:", error);
    resultsContainer.textContent = "حدث خطأ أثناء تحميل البيانات.";
    resultsContainer.className = "error-message";
  });

// البحث التلقائي مع تأخير (debounce)
let searchTimer;
searchInput.addEventListener("input", function() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    showSuggestions(this.value.trim());
  }, 300);
});

// ضغط Enter في حقل البحث
searchInput.addEventListener("keypress", function(e) {
  if (e.key === "Enter") {
    performSearch(this.value.trim());
    suggestionsContainer.style.display = "none";
  }
});

// إخفاء الاقتراحات عند النقر خارج الحقل
document.addEventListener("click", (e) => {
    if (e.target !== searchInput && !suggestionsContainer.contains(e.target)) {
      suggestionsContainer.style.display = "none";
    }
  });

function showSuggestions(searchTerm) {
  while (suggestionsContainer.firstChild) {
    suggestionsContainer.removeChild(suggestionsContainer.firstChild);
  }
  suggestionsContainer.style.display = "none";

  if (!searchTerm || Object.keys(websites).length === 0) {
    return;
  }

  const matchingKeys = Object.keys(websites).filter(key =>
    key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (matchingKeys.length > 0) {
    matchingKeys.forEach(key => {
      const suggestionItem = document.createElement("div");
      suggestionItem.textContent = key; // يمكنك إضافة websites[key].desc إذا استخدمت هيكل مع وصف
      suggestionItem.className = "suggestion-item";
      suggestionItem.addEventListener("click", () => {
        searchInput.value = key;
        performSearch(key);
        suggestionsContainer.style.display = "none";
      });
      suggestionsContainer.appendChild(suggestionItem);
    });
    suggestionsContainer.style.display = "block";
  }
}

function performSearch(searchTerm) {
  resultsContainer.innerHTML = "";

  if (!searchTerm || Object.keys(websites).length === 0) {
    return;
  }

  const foundKey = Object.keys(websites).find(key =>
    key.toLowerCase() === searchTerm.toLowerCase()
  );

  if (foundKey) {
    const linkElement = document.createElement("a");
    // التحقق مما إذا كان القيمة سلسلة أو كائن
    const url = typeof websites[foundKey] === "string" ? websites[foundKey] : websites[foundKey].url;
    linkElement.href = url;
    linkElement.textContent = "انقر هنا للانتقال إلى الموقع";
    linkElement.target = "_blank";
    linkElement.className = "result-link";
    resultsContainer.appendChild(linkElement);
  } else {
    resultsContainer.textContent = "لم يتم العثور على الموقع المطلوب.";
    resultsContainer.className = "error-message";
  }
}

function searchWebsite() {
  performSearch(searchInput.value.trim());
  suggestionsContainer.style.display = "none";
}