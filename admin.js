import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    onSnapshot, 
    doc, 
    updateDoc, 
    deleteDoc, 
    query, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase Configuration (Same as app.js)
const firebaseConfig = {
    apiKey: "AIzaSyDOYfbZ64eITHubPcFRrmK5umnccOKWhW0",
    authDomain: "loop-1b6b2.firebaseapp.com",
    projectId: "loop-1b6b2",
    storageBucket: "loop-1b6b2.firebasestorage.app",
    messagingSenderId: "792965836326",
    appId: "1:792965836326:web:d23d4799de8b07c237c0e7",
    measurementId: "G-ZKCSHB40G9"
};

// Initialize Firebase & Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Global State holding list data for real-time local search filtering
let allOrders = [];
let allReservations = [];
let allSubscribers = [];

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. PIN GATE AUTHENTICATION
    // ==========================================
    const pinGate = document.getElementById('pin-gate');
    const pinField = document.getElementById('pin-field');
    const pinError = document.getElementById('pin-error');
    const logoutBtn = document.getElementById('logout-btn');
    const ADMIN_PIN = "1234";

    function checkAuth() {
        if (sessionStorage.getItem('admin_authenticated') === 'true') {
            pinGate.style.display = 'none';
            // Start fetching database once authenticated
            initRealtimeListeners();
        } else {
            pinGate.style.display = 'flex';
            if (pinField) pinField.focus();
        }
    }

    if (pinField) {
        pinField.addEventListener('input', (e) => {
            const val = e.target.value;
            pinError.textContent = ''; // Clear previous error

            if (val.length === 4) {
                if (val === ADMIN_PIN) {
                    sessionStorage.setItem('admin_authenticated', 'true');
                    
                    // Smooth transition
                    pinGate.style.transition = 'opacity 0.4s ease';
                    pinGate.style.opacity = '0';
                    setTimeout(() => {
                        pinGate.style.display = 'none';
                        initRealtimeListeners();
                    }, 400);
                } else {
                    pinError.textContent = 'Invalid PIN. Access Denied.';
                    pinField.value = ''; // Reset input
                    
                    // Subtle shake animation
                    pinGate.querySelector('.pin-gate-box').style.animation = 'none';
                    setTimeout(() => {
                        pinGate.querySelector('.pin-gate-box').style.animation = 'scaleUp 0.1s ease-in-out';
                    }, 10);
                }
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('admin_authenticated');
            location.reload();
        });
    }

    // Run Auth Check
    checkAuth();

    // ==========================================
    // 2. TAB NAVIGATION SYSTEM
    // ==========================================
    const tabButtons = document.querySelectorAll('.admin-tab-btn');
    const tabPanels = document.querySelectorAll('.admin-tab-panel');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            tabButtons.forEach(b => b.classList.remove('active'));
            tabPanels.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(`panel-${targetTab}`).classList.add('active');
        });
    });

    // Display current local time nicely in the header
    const timeDisplay = document.getElementById('current-time-display');
    if (timeDisplay) {
        setInterval(() => {
            const now = new Date();
            timeDisplay.textContent = now.toLocaleDateString(undefined, { 
                weekday: 'short', month: 'short', day: 'numeric' 
            }) + ' | ' + now.toLocaleTimeString(undefined, { 
                hour: '2-digit', minute: '2-digit', second: '2-digit' 
            });
        }, 1000);
    }

    // ==========================================
    // 3. FIRESTORE REAL-TIME SYNCHRONIZATION
    // ==========================================
    function initRealtimeListeners() {
        
        // --- ORDERS COLLECTION ---
        const ordersQuery = query(collection(db, "orders"), orderBy("timestamp", "desc"));
        onSnapshot(ordersQuery, (snapshot) => {
            allOrders = [];
            snapshot.forEach(doc => {
                allOrders.push({ docId: doc.id, ...doc.data() });
            });
            renderOrders(allOrders);
            updateStats();
        }, (error) => {
            console.error("Error fetching orders:", error);
            const tbody = document.getElementById('orders-tbody');
            if (tbody) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #ff6b6b; padding: 30px 0;"><strong>Error loading orders:</strong> ${error.message} (Check Firestore Security Rules)</td></tr>`;
            }
        });

        // --- RESERVATIONS COLLECTION ---
        const resQuery = query(collection(db, "reservations"), orderBy("timestamp", "desc"));
        onSnapshot(resQuery, (snapshot) => {
            allReservations = [];
            snapshot.forEach(doc => {
                allReservations.push({ docId: doc.id, ...doc.data() });
            });
            renderReservations(allReservations);
            updateStats();
        }, (error) => {
            console.error("Error fetching reservations:", error);
            const tbody = document.getElementById('reservations-tbody');
            if (tbody) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #ff6b6b; padding: 30px 0;"><strong>Error loading bookings:</strong> ${error.message} (Check Firestore Security Rules)</td></tr>`;
            }
        });

        // --- NEWSLETTER COLLECTION ---
        const subsQuery = query(collection(db, "subscribers"), orderBy("timestamp", "desc"));
        onSnapshot(subsQuery, (snapshot) => {
            allSubscribers = [];
            snapshot.forEach(doc => {
                allSubscribers.push({ docId: doc.id, ...doc.data() });
            });
            renderSubscribers(allSubscribers);
            updateStats();
        }, (error) => {
            console.error("Error fetching subscribers:", error);
            const tbody = document.getElementById('subscribers-tbody');
            if (tbody) {
                tbody.innerHTML = `<tr><td colspan="2" style="text-align: center; color: #ff6b6b; padding: 30px 0;"><strong>Error loading subscribers:</strong> ${error.message} (Check Firestore Security Rules)</td></tr>`;
            }
        });
    }

    // ==========================================
    // 4. STATISTICS PANEL CALCULATIONS
    // ==========================================
    function updateStats() {
        // 1. Total Orders
        document.getElementById('stat-total-orders').textContent = allOrders.length;

        // 2. Total Revenue (from Completed orders only)
        const revenue = allOrders
            .filter(o => o.status === 'completed')
            .reduce((sum, o) => sum + (o.total || 0), 0);
        document.getElementById('stat-total-revenue').textContent = `$${revenue.toFixed(2)}`;

        // 3. Table Bookings
        document.getElementById('stat-total-reservations').textContent = allReservations.length;

        // 4. Subscribers
        document.getElementById('stat-total-subscribers').textContent = allSubscribers.length;
    }

    // ==========================================
    // 5. RENDER FUNCTIONS
    // ==========================================

    // --- RENDER ORDERS ---
    function renderOrders(ordersList) {
        const tbody = document.getElementById('orders-tbody');
        tbody.innerHTML = '';

        if (ordersList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--color-text-muted); padding: 30px 0;">No orders found.</td></tr>`;
            return;
        }

        ordersList.forEach(order => {
            const tr = document.createElement('tr');
            
            // Format Timestamp
            let dateStr = 'Pending...';
            if (order.timestamp) {
                const date = order.timestamp.toDate();
                dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }

            // Build Items List
            let itemsHtml = '<ul class="order-items-list">';
            if (Array.isArray(order.items)) {
                order.items.forEach(item => {
                    itemsHtml += `
                        <li>
                            ${item.title} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}
                            ${item.meta ? `<span>Config: ${item.meta}</span>` : ''}
                        </li>
                    `;
                });
            }
            itemsHtml += '</ul>';

            // Status Badge
            const status = order.status || 'pending';
            const statusBadge = `<span class="status-badge ${status}">${status}</span>`;

            // Action Buttons based on Status
            let actionsHtml = '';
            if (status === 'pending') {
                actionsHtml = `
                    <div class="actions-cell">
                        <button class="btn-action complete" data-id="${order.docId}">Complete</button>
                        <button class="btn-action delete" data-id="${order.docId}">Cancel</button>
                    </div>
                `;
            } else {
                actionsHtml = `
                    <div class="actions-cell">
                        <button class="btn-action delete" data-id="${order.docId}">Delete Record</button>
                    </div>
                `;
            }

            tr.innerHTML = `
                <td style="font-family: monospace; font-weight: 600; color: var(--color-primary);">${order.orderId || 'N/A'}</td>
                <td>${dateStr}</td>
                <td>${itemsHtml}</td>
                <td style="font-weight: 700; color: var(--color-text-light);">$${(order.total || 0).toFixed(2)}</td>
                <td>${statusBadge}</td>
                <td>${actionsHtml}</td>
            `;

            tbody.appendChild(tr);
        });

        // Add action listeners
        addOrderActionListeners();
    }

    // --- RENDER RESERVATIONS ---
    function renderReservations(resList) {
        const tbody = document.getElementById('reservations-tbody');
        tbody.innerHTML = '';

        if (resList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--color-text-muted); padding: 30px 0;">No reservations found.</td></tr>`;
            return;
        }

        resList.forEach(res => {
            const tr = document.createElement('tr');
            
            // Format Reservation Date nicely
            let displayDate = res.date;
            if (res.date) {
                const dateOptions = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
                displayDate = new Date(res.date).toLocaleDateString(undefined, dateOptions);
            }

            tr.innerHTML = `
                <td style="font-family: monospace; font-weight: 600; color: var(--color-primary);">${res.reservationCode || 'N/A'}</td>
                <td style="font-weight: 600;">${res.name || 'N/A'}</td>
                <td>${res.email || 'N/A'}</td>
                <td><strong>${displayDate}</strong> at ${res.timeSlot || 'N/A'}</td>
                <td>${res.guests || 'N/A'}</td>
                <td>${res.area || 'N/A'}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    // --- RENDER SUBSCRIBERS ---
    function renderSubscribers(subsList) {
        const tbody = document.getElementById('subscribers-tbody');
        tbody.innerHTML = '';

        if (subsList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="2" style="text-align: center; color: var(--color-text-muted); padding: 30px 0;">No subscribers found.</td></tr>`;
            return;
        }

        subsList.forEach(sub => {
            const tr = document.createElement('tr');
            
            let dateStr = 'N/A';
            if (sub.timestamp) {
                dateStr = sub.timestamp.toDate().toLocaleDateString();
            }

            tr.innerHTML = `
                <td style="font-weight: 600;">${sub.email || 'N/A'}</td>
                <td>${dateStr}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    // ==========================================
    // 6. ACTION INTERACTORS
    // ==========================================
    function addOrderActionListeners() {
        const completeBtns = document.querySelectorAll('.btn-action.complete');
        const deleteBtns = document.querySelectorAll('.btn-action.delete');

        completeBtns.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const docId = btn.getAttribute('data-id');
                btn.textContent = 'Updating...';
                btn.disabled = true;

                try {
                    await updateDoc(doc(db, "orders", docId), { status: 'completed' });
                } catch (err) {
                    console.error("Error completing order: ", err);
                    alert("Error updating order status.");
                }
            });
        });

        deleteBtns.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const docId = btn.getAttribute('data-id');
                const actionText = btn.textContent;
                
                // If it is cancellation, prompt or do directly
                if (actionText === 'Cancel') {
                    if (confirm("Are you sure you want to cancel this order?")) {
                        btn.textContent = 'Cancelling...';
                        btn.disabled = true;
                        try {
                            await updateDoc(doc(db, "orders", docId), { status: 'cancelled' });
                        } catch (err) {
                            console.error("Error cancelling order: ", err);
                        }
                    }
                } else {
                    // Fully delete the record
                    if (confirm("Are you sure you want to permanently delete this order log?")) {
                        btn.textContent = 'Deleting...';
                        btn.disabled = true;
                        try {
                            await deleteDoc(doc(db, "orders", docId));
                        } catch (err) {
                            console.error("Error deleting order document: ", err);
                        }
                    }
                }
            });
        });
    }

    // ==========================================
    // 7. REAL-TIME SEARCH FILTER SYSTEM
    // ==========================================
    const searchOrdersInput = document.getElementById('search-orders');
    if (searchOrdersInput) {
        searchOrdersInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const filtered = allOrders.filter(o => 
                (o.orderId && o.orderId.toLowerCase().includes(query)) ||
                (o.docId && o.docId.toLowerCase().includes(query))
            );
            renderOrders(filtered);
        });
    }

    const searchResInput = document.getElementById('search-reservations');
    if (searchResInput) {
        searchResInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const filtered = allReservations.filter(r => 
                (r.name && r.name.toLowerCase().includes(query)) ||
                (r.email && r.email.toLowerCase().includes(query)) ||
                (r.reservationCode && r.reservationCode.toLowerCase().includes(query))
            );
            renderReservations(filtered);
        });
    }

    const searchSubsInput = document.getElementById('search-subscribers');
    if (searchSubsInput) {
        searchSubsInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const filtered = allSubscribers.filter(s => 
                s.email && s.email.toLowerCase().includes(query)
            );
            renderSubscribers(filtered);
        });
    }

    // ==========================================
    // 8. CSV EXPORTER (NEWSLETTER LIST)
    // ==========================================
    const exportSubsBtn = document.getElementById('export-subs-btn');
    if (exportSubsBtn) {
        exportSubsBtn.addEventListener('click', () => {
            if (allSubscribers.length === 0) {
                alert("No subscribers available to export.");
                return;
            }

            let csvContent = "data:text/csv;charset=utf-8,Email,Subscription Date\n";
            allSubscribers.forEach(sub => {
                const dateStr = sub.timestamp ? sub.timestamp.toDate().toLocaleDateString() : 'N/A';
                csvContent += `"${sub.email}","${dateStr}"\n`;
            });

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `loop_coffee_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

});
