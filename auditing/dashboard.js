// AI Auditing Dashboard JavaScript

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Feather icons
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
    
    // Initialize notification system
    initializeNotifications();
    
    // Add interactive behaviors
    initializeInteractions();
});

// Function to handle upload to supervision
function uploadToSupervision() {
    showNotification('Connecting to supervision system...', 'info');
    
    // Simulate upload process
    setTimeout(() => {
        showNotification('Reports uploaded successfully to AI supervision system', 'success');
    }, 2000);
}

// Function to run a test for a specific use case
function runTest(useCaseId) {
    showNotification(`Starting test for ${useCaseId.replace('-', ' ')}...`, 'info');
    
    // Simulate test run
    setTimeout(() => {
        showNotification('Test completed successfully', 'success');
        // Refresh the metrics (in a real app, this would fetch new data)
        updateMetrics();
    }, 3000);
}

// Function to view reports for a specific use case
function viewReports(useCaseId) {
    window.location.href = `reports.html?useCase=${useCaseId}`;
}

// Function to view a specific report
function viewReport(testId) {
    window.location.href = `reports.html?test=${testId}`;
}

// Function to upload a specific report
function uploadReport(testId) {
    showNotification(`Uploading report ${testId} to supervision system...`, 'info');
    
    setTimeout(() => {
        showNotification('Report uploaded successfully', 'success');
    }, 1500);
}

// Function to show notifications
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `toast toast-${type}`;
    notification.innerHTML = `
        <div class="toast-content">
            <i data-feather="${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="toast-close" onclick="closeNotification(this)">
            <i data-feather="x"></i>
        </button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Initialize icons in the notification
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            closeNotification(notification.querySelector('.toast-close'));
        }
    }, 5000);
}

// Function to close notifications
function closeNotification(button) {
    const notification = button.closest('.toast');
    notification.classList.remove('show');
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

// Function to get notification icon based on type
function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'check-circle';
        case 'error': return 'alert-circle';
        case 'warning': return 'alert-triangle';
        case 'info':
        default: return 'info';
    }
}

// Function to initialize notifications
function initializeNotifications() {
    // Add notification badge click handler
    const notificationBell = document.querySelector('.notification-bell');
    if (notificationBell) {
        notificationBell.addEventListener('click', function() {
            showNotification('You have 2 new audit alerts', 'info');
        });
    }
}

// Function to initialize interactive behaviors
function initializeInteractions() {
    // Add hover effects to action cards
    const actionCards = document.querySelectorAll('.action-card');
    actionCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Add click effects to buttons
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Add ripple effect
            const ripple = document.createElement('span');
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background-color: rgba(255, 255, 255, 0.6);
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.height, rect.width);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                if (ripple.parentNode) {
                    ripple.parentNode.removeChild(ripple);
                }
            }, 600);
        });
    });
}

// Function to update metrics (simulation)
function updateMetrics() {
    const metrics = document.querySelectorAll('.metric-value');
    metrics.forEach(metric => {
        // Add a subtle animation to indicate update
        metric.style.transform = 'scale(1.05)';
        metric.style.transition = 'transform 0.2s ease';
        
        setTimeout(() => {
            metric.style.transform = 'scale(1)';
        }, 200);
    });
}

// Add CSS for ripple animation
const style = document.createElement('style');
style.textContent = `
@keyframes ripple {
    to {
        transform: scale(4);
        opacity: 0;
    }
}
`;
document.head.appendChild(style);