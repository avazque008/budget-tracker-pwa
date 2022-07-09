let db;
const request = indexedDB.open('budget_tracker', 1);

request.onupgradeneeded = function (event) {

    const db = event.target.result;

    db.createObjectStore('new_transaction', { autoIncrement: true });
};

request.onsuccess = function (event) {

    db = event.target.result;

    if (navigator.onLine) {

        uploadTransaction();
    }
};

request.onerror = function (event) {

    console.log(event.target.errorCode);
};


function saveRecord(data) {

    const transaction = db.transaction(['new_transaction'], 'readwrite');

    const transactionObjectStore = transaction.objectStore('new_transaction');

    transactionObjectStore.add(data);
};

function uploadTransaction() {

    const transaction = db.transaction(['new_transaction'], 'readwrite');

    const transactionObjectStore = transaction.objectStore('new_transaction');

    const getAll = transactionObjectStore.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch("/api/transaction", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
                .then(response => {
                    return response.json();
                })
                .then(data => {
                    if (data.errors) {
                        errorEl.textContent = "Missing Information";
                    }
                    else {
                        const transaction = db.transaction(['new_transaction'], 'readwrite');

                        const transactionObjectStore = transaction.objectStore('new_transaction');

                        transactionObjectStore.clear();

                        nameEl.value = "";
                        amountEl.value = "";
                    }
                })
                .catch(err => {
                    console.log(err);
                });
        }
    };
};

window.addEventListener('online', uploadTransaction);
