/*!
 * Start Bootstrap - Small Business v5.0.6 (https://startbootstrap.com/template/small-business)
 * Copyright 2013-2023 Start Bootstrap
 * Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-small-business/blob/master/LICENSE)
 */
// This file is intentionally blank
// Use this file to add JavaScript to your project
const services = [
    {
        name: "Classic Manicure",
        price: 25,
        duration: 30,
        img: "https://i.pinimg.com/originals/00/9c/2e/009c2edda5fbc2b7df7e9930aecc58f9.jpg"
    },
    {
        name: "Gel Manicure",
        price: 40,
        duration: 45,
        img: "https://i.pinimg.com/originals/00/9c/2e/009c2edda5fbc2b7df7e9930aecc58f9.jpg"
    },
    {
        name: "Nail Art Design",
        price: 60,
        duration: 60,
        img: "https://i.pinimg.com/originals/00/9c/2e/009c2edda5fbc2b7df7e9930aecc58f9.jpg"
    },
    {
        name: "Nail Art Design",
        price: 60,
        duration: 60,
        img: "https://i.pinimg.com/originals/00/9c/2e/009c2edda5fbc2b7df7e9930aecc58f9.jpg"
    }
];

let selectedService = null;
let selectedDate = null;
let selectedTime = null;
let weekOffset = 0;

// Hier worden de boekingen opgeslagen: {"Wed Mar 25 2026-14:00": true}
const bookedSlots = {};

// --- MODAL CONTROLS ---
document.getElementById("openBooking").onclick = () => {
    document.getElementById("bookingModal").style.display = "flex";
    renderServices();
};

function closeModal() {
    document.getElementById("bookingModal").style.display = "none";
}

// --- NAVIGATIE (DE FIX VOOR JE CHANGE KNOPPEN) ---
function backToServices() {
    document.getElementById("stepCalendar").classList.add("hidden");
    document.getElementById("stepServices").classList.remove("hidden");
}

function backToCalendar() {
    document.getElementById("stepDetails").classList.add("hidden");
    document.getElementById("stepCalendar").classList.remove("hidden");
}

// --- STAP 1: SERVICES ---
function renderServices() {
    const container = document.getElementById("stepServices");
    container.innerHTML = "";
    services.forEach((s) => {
        container.innerHTML += `
            <div class="service">
                <div style="display:flex;gap:10px">
                    <img src="${s.img}" class="service-img">
                    <div class="service-info">
                        <strong>${s.name}</strong>
                        <div>€${s.price} • ${s.duration} min</div>
                    </div>
                </div>
                <button class="book-btn" onclick="selectService('${s.name}')">Book</button>
            </div>`;
    });
}

function selectService(name) {
    selectedService = services.find((s) => s.name === name);
    document.getElementById("summaryService").innerText = `${selectedService.name} • ${selectedService.duration}min`;
    document.getElementById("stepServices").classList.add("hidden");
    document.getElementById("stepCalendar").classList.remove("hidden");
    renderWeek();
}

// --- STAP 2: KALENDER & TIJD ---
function renderWeek() {
    const weekContainer = document.getElementById("weekDays");
    const dateHeader = document.getElementById("selectedDateTitle");
    weekContainer.innerHTML = "";

    const daysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];

    for (let i = 0; i < 7; i++) {
        let d = new Date();
        d.setDate(d.getDate() + i + weekOffset * 7);

        let isToday = new Date().toDateString() === d.toDateString();
        let isSelected = selectedDate && selectedDate.toDateString() === d.toDateString();

        let dayBtn = document.createElement("div");
        dayBtn.className = `day-card ${isSelected ? "active" : ""}`;
        dayBtn.innerHTML = `
            <span class="day-name">${isToday ? "Today" : daysShort[d.getDay()]}</span>
            <span class="day-number">${d.getDate()}</span>
        `;

        dayBtn.onclick = () => {
            selectedDate = new Date(d);
            dateHeader.innerText = `${isToday ? "Today, " : ""}${months[d.getMonth()]} ${d.getDate()}`;
            renderWeek();
            renderTimes();
        };
        weekContainer.appendChild(dayBtn);
    }
}

function changeWeek(v) {
    weekOffset += v;
    renderWeek();
}

function renderTimes() {
    if (!selectedDate) return;
    generateTimeGroup("timesMorning", 9, 12);
    generateTimeGroup("timesAfternoon", 12, 17);
    generateTimeGroup("timesEvening", 17, 20);
}

function generateTimeGroup(id, start, end) {
    const container = document.getElementById(id);
    container.innerHTML = "";

    for (let h = start; h < end; h++) {
        let time = `${h}:00`;
        let isAvailable = !isBooked(time);

        let btn = document.createElement("button");
        btn.innerText = time;
        btn.disabled = !isAvailable;

        btn.onclick = () => {
            selectedTime = time;
            openDetails();
        };
        container.appendChild(btn);
    }
}

function isBooked(time) {
    if (!selectedDate) return false;
    const key = `${selectedDate.toDateString()}-${time}`;
    return bookedSlots[key] === true;
}

// --- STAP 3: DETAILS ---
function openDetails() {
    document.getElementById("stepCalendar").classList.add("hidden");
    document.getElementById("stepDetails").classList.remove("hidden");
    document.getElementById("summaryFull").innerText =
        `${selectedService.name} • ${selectedDate.toDateString()} • ${selectedTime}`;
    loadOptions();
}

function loadOptions() {
    const select = document.getElementById("serviceOption");
    select.innerHTML = '<option value="">Choose an option...</option>';
    ["Standard", "Extra Shine", "Matte Finish"].forEach((o) => {
        select.innerHTML += `<option value="${o}">${o}</option>`;
    });
}

function confirmBooking() {
    const name = document.getElementById("name").value;
    if (!name) return alert("Please enter your name");

    const key = `${selectedDate.toDateString()}-${selectedTime}`;
    bookedSlots[key] = true; // Dit blokkeert het uur voor de volgende keer

    alert(`Gelukt! Afspraak staat voor ${name} op ${selectedTime}`);

    // Reset naar begin
    selectedDate = null;
    selectedTime = null;
    document.getElementById("stepDetails").classList.add("hidden");
    document.getElementById("stepServices").classList.remove("hidden");
    closeModal();
}
