document.addEventListener('DOMContentLoaded', function () {
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    const runButtons = document.querySelectorAll('.run-btn');
    const solutionButtons = document.querySelectorAll('.solution-btn');
    const explainButtons = document.querySelectorAll('.explain-btn');

    function showSection(hash) {
        const targetHash = hash || '#pendahuluan';

        contentSections.forEach(section => {
            if ('#' + section.id === targetHash) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });

        navLinks.forEach(link => {
            if (link.getAttribute('href') === targetHash) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetHash = this.getAttribute('href');
            history.pushState(null, null, targetHash);
            showSection(targetHash);
        });
    });

    runButtons.forEach(button => {
        button.addEventListener('click', function () {
            const outputDiv = this.nextElementSibling;
            if (outputDiv && outputDiv.classList.contains('code-output')) {
                outputDiv.style.display = 'block';
            }
        });
    });

    solutionButtons.forEach(button => {
        button.addEventListener('click', function () {
            const outputDiv = this.nextElementSibling;
            if (outputDiv && outputDiv.classList.contains('code-output')) {
                outputDiv.style.display = outputDiv.style.display === 'block' ? 'none' : 'block';
            }
        });
    });

    explainButtons.forEach(button => {
        button.addEventListener('click', async function () {
            const interactiveBlock = this.closest('.interactive-code-block') || this.closest('.code-output');
            const codeBlock = interactiveBlock.querySelector('.code-block');
            const outputBlock = this.previousElementSibling; // The <pre> tag before the explain button
            const loadingIndicator = this.nextElementSibling;
            const explanationBlock = loadingIndicator.nextElementSibling;

            if (!codeBlock || !outputBlock || !explanationBlock) {
                console.error("Could not find necessary elements for explanation.");
                return;
            }

            const code = codeBlock.textContent.trim();
            const output = outputBlock.textContent.trim();

            explanationBlock.textContent = ''; // Clear previous explanation
            explanationBlock.style.display = 'none';
            loadingIndicator.style.display = 'block';

            try {
                let chatHistory = [];
                chatHistory.push({
                    role: "user",
                    parts: [{
                        text: `Jelaskan output SymPy berikut ini. Kode yang digunakan: \`${code}\`. Outputnya: \`${output}\`. Berikan penjelasan yang ringkas dan mudah dipahami dalam bahasa Indonesia.`
                    }]
                });
                const payload = {
                    contents: chatHistory
                };
                const apiKey = "AIzaSyAynOvXpKEvEXX-XGEAdyvUHWtUp9vIq0s"; // If you want to use models other than gemini-2.0-flash or imagen-3.0-generate-002, provide an API key here. Otherwise, leave this as-is.
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
                const result = await response.json();

                if (result.candidates && result.candidates.length > 0 &&
                    result.candidates[0].content && result.candidates[0].content.parts &&
                    result.candidates[0].content.parts.length > 0) {
                    const text = result.candidates[0].content.parts[0].text;
                    explanationBlock.textContent = text;
                    explanationBlock.style.display = 'block';
                } else {
                    explanationBlock.textContent = 'Gagal mendapatkan penjelasan. Mohon coba lagi.';
                    explanationBlock.style.display = 'block';
                }
            } catch (error) {
                console.error("Error fetching explanation:", error);
                explanationBlock.textContent = 'Terjadi kesalahan saat memuat penjelasan.';
                explanationBlock.style.display = 'block';
            } finally {
                loadingIndicator.style.display = 'none';
            }
        });
    });

    window.addEventListener('popstate', function () {
        showSection(window.location.hash);
    });

    showSection(window.location.hash);
});