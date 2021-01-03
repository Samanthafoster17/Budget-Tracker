let db;

const request = window.indexedDB.open("budget", 1);


request.onupgradeneeded = function (event) {
    db = event.target.result;
    db.createObjectStore("pendingFunds", {
        autoIncrement: true
    });
};


request.onsuccess = function (event){
    db = event.target.result;
    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function (event){
 db = event.target.result;
};

function saveRecord(record) {
    const transaction = db.transaction(["pendingFunds"], "readwrite");
    const pendingFunds = transaction.objectStore("pendingFunds");
    pendingFunds.add(record)
};

function checkDatabase(){
const transaction = db.transaction(["pendingFunds"], "readwrite");
const pendingFunds = transaction.objectStore("pendingFunds");    
const getAll = pendingFunds.getAll();
getAll.onsuccess = () => {
    console.log(getAll.result, "RESULT");
};

getAll.onsuccess = function () {
    if (getAll.result.length > 0){
        fetch('/api/transaction/bulk', {
            method: "POST",
            body: JSON.stringify(getAll.result),
            headers: {
                Accept: 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
            },
        }).then((response) => response.json())
        .then(() => {
            const transaction = db.transaction(["pendingFunds"], "readwrite");
            const pendingFunds = transaction.objectStore("pendingFunds");
             db = request.result;
            pendingFunds.clear();
        })
    }
}
}

window.addEventListener('online', checkDatabase);