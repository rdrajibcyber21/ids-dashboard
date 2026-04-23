let chart;
let map;
let markers = [];

// 🔐 AUTH
function getToken() {
    return localStorage.getItem("token");
}

function checkAuth() {
    const token = getToken();
    if (!token) {
        window.location.href = "login.html";
        return false;
    }
    return true;
}

function getAuthHeaders() {
    const token = getToken();
    if (!token) return null;

    return {
        "Authorization": "Bearer " + token
    };
}

// 🌍 INIT MAP
function initMap() {
    map = L.map('map').setView([20, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);
}

// 🌍 GEO (NO API)
function getGeoData(ip) {
    if (
        ip.startsWith("192.") ||
        ip.startsWith("127.") ||
        ip.startsWith("10.")
    ) {
        return { country: "Local Network", coords: null };
    }

    return { country: "Unknown", coords: null };
}

// 📊 FETCH STATS
async function fetchStats() {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
        const res = await fetch("http://127.0.0.1:8000/stats", { headers });

        if (res.status === 401) return logout();

        const data = await res.json();

        document.getElementById("total").innerText =
            "Total: " + data.total_attacks;
        document.getElementById("unique").innerText =
            "Unique IPs: " + data.unique_ips;
        document.getElementById("top").innerText =
            "Top IP: " + data.top_ip;

        const ctx = document.getElementById("chart").getContext("2d");

        if (chart) chart.destroy();

        chart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: Object.keys(data.attack_data),
                datasets: [{
                    label: "Attacks per IP",
                    data: Object.values(data.attack_data)
                }]
            }
        });

    } catch (err) {
        console.error("Stats error:", err);
    }
}

// 📡 FETCH ALERTS
async function fetchAlerts() {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
        const res = await fetch("http://127.0.0.1:8000/alerts", { headers });

        if (res.status === 401) return logout();

        const data = await res.json();

        const container = document.getElementById("alerts");
        container.innerHTML = "";

        for (let alert of data.slice(-5).reverse()) {
            const geo = getGeoData(alert.ip);

            const div = document.createElement("div");
            div.className = "card";
            div.innerHTML = `
                <strong>IP:</strong> ${alert.ip} <br>
                <strong>Type:</strong> ${alert.type} <br>
                <strong>Country:</strong> ${geo.country}
            `;
            container.appendChild(div);
        }

        updateMap(data);

    } catch (err) {
        console.error("Alerts error:", err);
    }
}

// 🗺️ MAP
function updateMap(alerts) {
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    for (let alert of alerts.slice(-5)) {
        const geo = getGeoData(alert.ip);

        if (geo.coords) {
            const marker = L.marker(geo.coords)
                .addTo(map)
                .bindPopup(`IP: ${alert.ip}`);

            markers.push(marker);
        }
    }
}

// 🔓 LOGOUT
function logout() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}

// 🚀 START
async function startApp() {
    if (!checkAuth()) return;

    initMap();

    async function updateAll() {
        await fetchStats();
        await fetchAlerts();
    }

    await updateAll();

    setInterval(updateAll, 8000); // stable
}

startApp();