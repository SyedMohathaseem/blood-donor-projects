// Mock Data for frontend demo (Initial Seeding)
const initialDonors = [
    { id: 1, name: "Ali Khan", blood_group: "O+", city: "Madinah", phone: "966500000001", last_donation: "2023-10-15", status: "active" },
    { id: 2, name: "Sara Ahmed", blood_group: "A-", city: "Riyadh", phone: "966500000002", last_donation: "2023-11-20", status: "active" },
    { id: 3, name: "Omar Farooq", blood_group: "B+", city: "Jeddah", phone: "966500000003", last_donation: "2023-09-01", status: "active" },
    { id: 4, name: "Fatima Noor", blood_group: "AB+", city: "Madinah", phone: "966500000004", last_donation: "2023-12-05", status: "active" },
    { id: 5, name: "Khalid Yasin", blood_group: "O-", city: "Makkah", phone: "966500000005", last_donation: "2023-08-10", status: "active" }
];

// Helper to get donors from LocalStorage
function getDonors() {
    const stored = localStorage.getItem('donors');
    if (!stored) {
        localStorage.setItem('donors', JSON.stringify(initialDonors));
        return initialDonors;
    }
    return JSON.parse(stored);
}

// Helper to save donors
function saveDonors(donors) {
    localStorage.setItem('donors', JSON.stringify(donors));
}

document.addEventListener('DOMContentLoaded', () => {
    // Dark Mode Toggle
    const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');
    const currentTheme = localStorage.getItem('theme');

    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
        if (currentTheme === 'dark') {
            toggleSwitch.checked = true;
            document.body.classList.add('dark-mode');
        }
    }

    function switchTheme(e) {
        if (e.target.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }    
    }

    if(toggleSwitch) {
        toggleSwitch.addEventListener('change', switchTheme, false);
    }

    // Mobile Menu Toggle
    const mobileMenu = document.getElementById('mobile-menu');
    const navList = document.getElementById('nav-list');
    
    if (mobileMenu) {
        mobileMenu.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            navList.classList.toggle('active');
        });
    }

    // Determine which page we are on
    const path = window.location.pathname;
    
    // Auto-load donors on home page
    if (path.includes('index.html') || path === '/' || path.endsWith('/')) {
        renderDonors(getDonors()); // Initial load from LocalStorage
    }
    
    // Auto-load donors on admin page
    if (path.includes('admin')) {
        const donors = getDonors();
        renderAdminDonors(donors);
        renderAdminStats(donors);
    }

    // Scroll to Top Logic
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollTopBtn.style.display = 'flex';
            } else {
                scrollTopBtn.style.display = 'none';
            }
        });

        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Auto-Search Logic
    const bloodGroupSearch = document.getElementById('bloodGroup');
    const citySearch = document.getElementById('city');

    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    if (bloodGroupSearch && citySearch) {
        // Immediate search for dropdown
        bloodGroupSearch.addEventListener('change', () => {
            searchDonors();
        });

        // Debounced search for text input
        citySearch.addEventListener('input', debounce(() => {
            searchDonors();
        }, 500));
    }

    // Contact Form Validation
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('contactEmail').value;
            const emailError = document.getElementById('emailError');
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(email)) {
                emailError.style.display = 'block';
                return;
            }
            emailError.style.display = 'none';
            showCustomAlert('Message Sent Successfully!');
            contactForm.reset();
        });
    }
});

// Enhanced Loading State (Skeleton)
function showSkeletonLoader(show) {
    const donorsGrid = document.getElementById('donorsGrid');
    if (!donorsGrid) return;
    
    if (show) {
        donorsGrid.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            const skeleton = document.createElement('div');
            skeleton.className = 'donor-card skeleton-card';
            skeleton.innerHTML = `
                <div class="skeleton-header" style="height: 60px; background: #eee; margin-bottom: 10px; border-radius: 8px;"></div>
                <div class="skeleton-body" style="height: 20px; background: #eee; margin-bottom: 20px; border-radius: 4px; width: 60%;"></div>
                <div class="skeleton-btn" style="height: 40px; background: #eee; border-radius: 8px;"></div>
            `;
            donorsGrid.appendChild(skeleton);
        }
    }
}

async function searchDonors() {
    const bloodGroupEl = document.getElementById('bloodGroup');
    const cityEl = document.getElementById('city');
    const donorsGrid = document.getElementById('donorsGrid');
    const noResults = document.getElementById('noResults');

    if (!bloodGroupEl || !cityEl || !donorsGrid) return;

    const bloodGroup = bloodGroupEl.value;
    const city = cityEl.value.trim().toLowerCase();

    // Show Skeleton
    showSkeletonLoader(true);
    noResults.style.display = 'none';

    // Simulate network delay for UX (Reduced for auto-search feel)
    setTimeout(async () => {
        let donors = getDonors(); // Fetch from LocalStorage

        // Filter Logic
        const filteredDonors = donors.filter(d => {
            const matchGroup = bloodGroup ? d.blood_group === bloodGroup : true;
            const matchCity = city ? d.city.toLowerCase().includes(city) : true;
            return matchGroup && matchCity;
        });

        if (filteredDonors.length > 0) {
            renderDonors(filteredDonors);
        } else {
            donorsGrid.innerHTML = ''; // Clear skeleton
            noResults.style.display = 'block';
        }
    }, 500);
}

function renderDonors(donors) {
    const donorsGrid = document.getElementById('donorsGrid');
    if (!donorsGrid) return;
    
    donorsGrid.innerHTML = '';

    donors.forEach(donor => {
        const card = document.createElement('div');
        card.className = 'donor-card';
        
        // WhatsApp Link Generator
        const waLink = `https://wa.me/${donor.phone}?text=Hello ${donor.name}, I found you on BloodDonorFinder. I urgently need ${donor.blood_group} blood. Please help.`;

        card.innerHTML = `
            <div class="donor-header">
                <div class="donor-info">
                    <h3>${donor.name}</h3>
                    <div class="donor-location">📍 ${donor.city}</div>
                </div>
                <div class="blood-group-badge">${donor.blood_group}</div>
            </div>
            <div class="status-badge status-active">Available</div>
            <p style="font-size: 0.9rem; color: var(--text-light); margin-bottom: 15px;">Last Donation: ${formatDate(donor.last_donation)}</p>
            <a href="${waLink}" target="_blank" class="btn btn-whatsapp">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.01-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                Contact via WhatsApp
            </a>
        `;
        
        donorsGrid.appendChild(card);
    });
}

function renderAdminDonors(donors) {
    const list = document.getElementById('adminDonorsList');
    if (!list) return;

    list.innerHTML = '';
    donors.forEach(donor => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td data-label="ID">${donor.id}</td>
            <td data-label="Name">${donor.name}</td>
            <td data-label="Blood Group"><span style="background:var(--primary-light); color:var(--primary-dark); padding:2px 8px; border-radius:10px; font-weight:700;">${donor.blood_group}</span></td>
            <td data-label="City">${donor.city}</td>
            <td data-label="Phone">${donor.phone}</td>
            <td data-label="Status">${donor.status}</td>
            <td data-label="Actions">
                <button class="action-btn btn-delete" onclick="deleteDonor(${donor.id})">Delete</button>
            </td>
        `;
        list.appendChild(tr);
    });
}

function renderAdminStats(donors) {
    const totalDonorsEl = document.querySelector('.stat-card:nth-child(1) h3');
    const commonTypeEl = document.querySelector('.stat-card:nth-child(2) h3');
    const statusEl = document.querySelector('.stat-card:nth-child(3) h3');

    if (totalDonorsEl) totalDonorsEl.innerText = donors.length;
    
    if (commonTypeEl && donors.length > 0) {
        const counts = {};
        let maxCount = 0;
        let pType = 'N/A';
        
        donors.forEach(d => {
            counts[d.blood_group] = (counts[d.blood_group] || 0) + 1;
            if (counts[d.blood_group] > maxCount) {
                maxCount = counts[d.blood_group];
                pType = d.blood_group;
            }
        });
        commonTypeEl.innerText = pType;
    }

    if (statusEl) statusEl.innerText = 'Active'; // Keep as Active for now
}

// Custom Alert Function
function showCustomAlert(message, callback) {
    // Check if modal exists, if not create it
    let overlay = document.querySelector('.custom-alert-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'custom-alert-overlay';
        overlay.innerHTML = `
            <div class="custom-alert-box">
                <div class="custom-alert-icon">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                </div>
                <div class="custom-alert-message"></div>
                <button class="custom-alert-btn">OK</button>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    const msgEl = overlay.querySelector('.custom-alert-message');
    const btn = overlay.querySelector('.custom-alert-btn');

    msgEl.innerText = message;
    overlay.classList.add('active');

    // Handle close
    const closeAlert = () => {
        overlay.classList.remove('active');
        btn.removeEventListener('click', closeAlert);
        if (callback) callback();
    };

    btn.addEventListener('click', closeAlert);
}

function deleteDonor(id) {
    // Custom Confirm for Delete
    if(confirm('Are you sure you want to delete this donor?')) { // Keeping confirm native for safety/simplicity or can replace later
        let donors = getDonors();
        donors = donors.filter(d => d.id !== id);
        saveDonors(donors);
        renderAdminDonors(donors); 
        renderAdminStats(donors); 
        showCustomAlert('Donor deleted successfully!');
    }
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Handle Registration Form (Realtime LocalStorage)
function handleRegister(event) {
    event.preventDefault();
    const btn = event.target.querySelector('button[type="submit"]');
    
    // Get values
    const name = document.getElementById('name').value;
    const blood_group = document.getElementById('blood_group').value;
    const city = document.getElementById('city').value;
    const phone = document.getElementById('phone').value;
    const last_donation = document.getElementById('last_donation').value;
    
    btn.innerText = 'Registering...';
    btn.disabled = true;

    setTimeout(() => {
        // Create new donor object
        const donors = getDonors();
        const newId = donors.length > 0 ? Math.max(...donors.map(d => d.id)) + 1 : 1;
        
        const newDonor = {
            id: newId,
            name: name,
            blood_group: blood_group,
            city: city,
            phone: phone,
            last_donation: last_donation,
            status: "active"
        };
        
        // Save to LocalStorage
        donors.push(newDonor);
        saveDonors(donors);

        showCustomAlert("Registration Successful!", () => {
            window.location.href = 'index.html'; 
        });
    }, 1000);
}
