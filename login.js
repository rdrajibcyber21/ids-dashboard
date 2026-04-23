async function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const error = document.getElementById("error");
    const button = document.getElementById("login-btn");

    error.innerText = "";

    if (!username || !password) {
        error.innerText = "Credentials required";
        return;
    }

    try {
        button.classList.add("loading");
        button.disabled = true;

        await fakeScan(); // 🔥 hacker scan animation

        const res = await fetch("http://127.0.0.1:8000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (!res.ok) throw new Error("ACCESS DENIED");

        localStorage.setItem("token", data.access_token);

        await showTerminal("ACCESS GRANTED ✅", "success");

        setTimeout(() => {
            window.location.href = "index.html";
        }, 1200);

    } catch (err) {
        await showTerminal("ACCESS DENIED ❌", "error");
        error.innerText = "Invalid credentials";

    } finally {
        button.classList.remove("loading");
        button.disabled = false;
    }
}

/* 👁 PASSWORD */
function togglePassword() {
    const input = document.getElementById("password");
    const icon = document.querySelector(".toggle-password");

    input.type = input.type === "password" ? "text" : "password";
    icon.textContent = input.type === "password" ? "👁️" : "🙈";
}

/* ⌨️ TYPING */
const texts = [
    "Initializing system...",
    "Scanning network...",
    "Detecting threats...",
    "Awaiting authentication..."
];

let i = 0, j = 0, deleting = false;

function typeLoop() {
    const el = document.getElementById("typing-text");
    if (!el) return;

    let text = texts[i];

    el.textContent = deleting ? text.substring(0, j--) : text.substring(0, j++);

    if (!deleting && j === text.length) {
        deleting = true;
        return setTimeout(typeLoop, 1000);
    }

    if (deleting && j === 0) {
        deleting = false;
        i = (i + 1) % texts.length;
    }

    setTimeout(typeLoop, deleting ? 40 : 60);
}

window.addEventListener("load", typeLoop);

/* 🔥 FAKE SCAN */
function fakeScan() {
    return showTerminal("Scanning credentials...", "scan", 800);
}

/* 🖥️ TERMINAL OUTPUT */
function showTerminal(message, type = "", delay = 1000) {
    return new Promise(resolve => {
        const terminal = document.getElementById("terminal");

        terminal.innerText = message;
        terminal.className = "terminal " + type;
        terminal.style.display = "block";

        setTimeout(() => {
            terminal.style.display = "none";
            resolve();
        }, delay);
    });
}