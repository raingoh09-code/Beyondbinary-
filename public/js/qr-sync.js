// QR Code Sync Functionality
let qrSyncToken = null;

// Show QR Sync Modal
function showQRSync() {
    const modal = document.getElementById('qrSyncModal');
    modal.style.display = 'block';
    generateQRCode();
}

// Close QR Sync Modal
function closeQRSync() {
    const modal = document.getElementById('qrSyncModal');
    modal.style.display = 'none';
}

// Generate QR Code for syncing
async function generateQRCode() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        // Generate a temporary sync token for non-logged in users
        qrSyncToken = generateSyncToken();
    } else {
        // Use authenticated token
        qrSyncToken = token;
    }
    
    // Create sync data
    const syncData = {
        token: qrSyncToken,
        timestamp: Date.now(),
        platform: 'web',
        url: window.location.origin
    };
    
    const qrDataString = JSON.stringify(syncData);
    
    // Generate QR Code using QRCode.js library
    const qrContainer = document.getElementById('qrCodeDisplay');
    qrContainer.innerHTML = ''; // Clear previous QR code
    
    // Check if QRCode library is available
    if (typeof QRCode !== 'undefined') {
        new QRCode(qrContainer, {
            text: qrDataString,
            width: 250,
            height: 250,
            colorDark: '#4A4543',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });
    } else {
        // Fallback if QRCode library not loaded
        qrContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <p style="color: var(--text-color); font-size: 1.125rem; margin-bottom: 1rem;">
                    QR Code
                </p>
                <p style="color: var(--text-light); font-size: 0.9rem;">
                    Scan to sync your account
                </p>
                <div style="margin-top: 1rem; padding: 1rem; background: #f0f0f0; border-radius: 0.5rem;">
                    <code style="font-size: 0.75rem; word-break: break-all;">
                        ${qrDataString.substring(0, 50)}...
                    </code>
                </div>
            </div>
        `;
    }
    
    // Auto-expire token after 5 minutes
    setTimeout(() => {
        if (qrSyncToken) {
            console.log('QR sync token expired');
            qrSyncToken = null;
        }
    }, 5 * 60 * 1000);
}

// Generate a temporary sync token
function generateSyncToken() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('qrSyncModal');
    if (event.target === modal) {
        closeQRSync();
    }
}

// API endpoint to validate sync token (for backend integration)
async function validateSyncToken(token) {
    try {
        const response = await fetch('/api/auth/validate-sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token })
        });
        
        if (response.ok) {
            const data = await response.json();
            return data;
        }
        return null;
    } catch (error) {
        console.error('Error validating sync token:', error);
        return null;
    }
}
