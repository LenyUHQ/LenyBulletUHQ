let combolist = null;
let proxies = null;
let selectedChecker = null;

// Gestion de l'importation de la combolist
document.getElementById('combolistInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        combolist = e.target.result.split('\n');
        console.log('Combolist chargée:', combolist);
    };

    reader.readAsText(file);
});

// Gestion de l'importation des proxies
document.getElementById('proxyInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        proxies = e.target.result.split('\n');
        console.log('Proxies chargés:', proxies);
    };

    reader.readAsText(file);
});

// Sélection du checker
function selectChecker(checker) {
    selectedChecker = checker;
    console.log(`Checker sélectionné : ${selectedChecker}`);
    document.querySelector('.upload-section').style.display = 'block';
    document.getElementById('startCheckerBtn').style.display = 'block';
}

// Fonction pour simuler l'appel à l'API (à remplacer par votre logique de checker)
function simulateApiCall(combo, proxy) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const statuses = ['premium', 'free', 'locked', 'invalid'];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            resolve({ status });
        }, 500);
    });
}

// Fonction pour télécharger les logs
function downloadLogs(results) {
    let logContent = 'Résultats du checker LenyBullet :\n\n';

    results.premium.forEach(result => {
        logContent += `✅ Premium: ${result}\n`;
    });
    results.free.forEach(result => {
        logContent += `🆓 Free: ${result}\n`;
    });
    results.locked.forEach(result => {
        logContent += `🔒 Locked: ${result}\n`;
    });
    results.invalid.forEach(result => {
        logContent += `❌ Invalid: ${result}\n`;
    });

    const blob = new Blob([logContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `checker_logs_${Date.now()}.txt`;
    link.click();
}

// Fonction principale du checker
document.getElementById('startCheckerBtn').addEventListener('click', function() {
    if (!combolist || !proxies) {
        alert('Veuillez charger à la fois une combolist et un fichier de proxies.');
        return;
    }
    if (!selectedChecker) {
        alert('Veuillez sélectionner un checker.');
        return;
    }

    startChecker(combolist, proxies, selectedChecker);
});

function startChecker(combolist, proxies, checkerType) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = ''; // Réinitialise les résultats précédents

    const results = {
        premium: [],
        free: [],
        locked: [],
        invalid: []
    };

    const totalCombos = combolist.length;
    let processedCombos = 0;

    const promises = combolist.map((combo, index) => {
        const proxy = proxies[index % proxies.length]; // Utilise un proxy en rotation
        return simulateApiCall(combo, proxy).then(response => {
            let resultElement = document.createElement('div');
            resultElement.classList.add('result');

            if (response.status === 'premium') {
                resultElement.textContent = `✅ Compte Premium : ${combo}`;
                resultElement.classList.add('valid');
                results.premium.push(combo);
            } else if (response.status === 'free') {
                resultElement.textContent = `🆓 Compte Free : ${combo}`;
                resultElement.classList.add('valid');
                results.free.push(combo);
            } else if (response.status === 'locked') {
                resultElement.textContent = `🔒 Compte Lock : ${combo}`;
                resultElement.classList.add('locked');
                results.locked.push(combo);
            } else {
                resultElement.textContent = `❌ Compte Invalide : ${combo}`;
                resultElement.classList.add('invalid');
                results.invalid.push(combo);
            }
            resultsDiv.appendChild(resultElement);

            // Mise à jour de la barre de progression
            processedCombos++;
            const progressPercent = (processedCombos / totalCombos) * 100;
            document.getElementById('progress').style.width = progressPercent + '%';
        });
    });

    // Une fois toutes les promesses résolues, télécharger les logs
    Promise.all(promises).then(() => {
        downloadLogs(results);
        alert('Checker terminé !');
    });
}
