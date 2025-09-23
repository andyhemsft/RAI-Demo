// AI Auditing Reports JavaScript

// Initialize the reports page
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Feather icons
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
    
    // Initialize tab functionality
    initializeTabs();
    
    // Initialize filter functionality
    initializeFilters();
    
    // Initialize interactive elements
    initializeInteractions();
});

// Tab functionality
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and panels
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding panel
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
            
            // Replace icons after tab switch
            setTimeout(() => {
                if (typeof feather !== 'undefined') {
                    feather.replace();
                }
            }, 100);
        });
    });
}

// Filter functionality
function initializeFilters() {
    const filterDropdowns = document.querySelectorAll('.filter-dropdown');
    
    filterDropdowns.forEach(dropdown => {
        dropdown.addEventListener('change', function() {
            handleFilterChange(this);
        });
    });
    
    // Initialize confirm and reset buttons
    const confirmBtn = document.getElementById('confirm-btn');
    const resetBtn = document.getElementById('reset-btn');
    
    if (confirmBtn) {
        confirmBtn.addEventListener('click', applyFilters);
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', resetFilters);
    }
}

// Handle filter changes
function handleFilterChange(dropdown) {
    const filterType = dropdown.id;
    const selectedValue = dropdown.value;
    
    console.log(`Filter changed: ${filterType} = ${selectedValue}`);
    
    // Show loading state
    showNotification('Updating report data...', 'info');
    
    // Simulate data loading
    setTimeout(() => {
        updateReportData(filterType, selectedValue);
        showNotification('Report updated successfully', 'success');
    }, 1000);
}

// Apply filters
function applyFilters() {
    const useCaseValue = document.getElementById('use-case-selection').value;
    const testTypeValue = document.getElementById('test-type-selection').value;
    const dateRangeValue = document.getElementById('date-range').value;
    
    showNotification('Applying filters and regenerating report...', 'info');
    
    // Simulate report generation
    setTimeout(() => {
        updateFullReport(useCaseValue, testTypeValue, dateRangeValue);
        showNotification('Report generated successfully', 'success');
    }, 2000);
}

// Reset filters
function resetFilters() {
    document.getElementById('use-case-selection').value = 'credit-scoring';
    document.getElementById('test-type-selection').value = 'all';
    document.getElementById('date-range').value = 'last-30-days';
    
    showNotification('Filters reset to default values', 'info');
    
    setTimeout(() => {
        updateFullReport('credit-scoring', 'all', 'last-30-days');
    }, 500);
}

// Update report data based on filters
function updateReportData(filterType, value) {
    // Update summary cards if needed
    updateSummaryCards(filterType, value);
    
    // Update metrics based on filter
    updateMetricsData(filterType, value);
    
    // Update test history
    updateTestHistory(filterType, value);
}

// Update full report
function updateFullReport(useCase, testType, dateRange) {
    // Update all sections with new data
    updateSummaryCards('full', { useCase, testType, dateRange });
    updateMetricsData('full', { useCase, testType, dateRange });
    updateTestHistory('full', { useCase, testType, dateRange });
}

// Update summary cards
function updateSummaryCards(filterType, value) {
    const summaryCards = document.querySelectorAll('.summary-card');
    
    summaryCards.forEach(card => {
        // Add subtle animation to indicate update
        card.style.transform = 'scale(0.98)';
        card.style.transition = 'transform 0.2s ease';
        
        setTimeout(() => {
            card.style.transform = 'scale(1)';
        }, 200);
    });
}

// Update metrics data
function updateMetricsData(filterType, value) {
    // Update SHAP values, bias metrics, etc. based on filters
    console.log('Updating metrics data for:', filterType, value);
    
    // Animate metric changes
    const metricValues = document.querySelectorAll('.metric-value, .shap-value, .bias-cell');
    metricValues.forEach(element => {
        element.style.opacity = '0.7';
        element.style.transition = 'opacity 0.3s ease';
        
        setTimeout(() => {
            element.style.opacity = '1';
        }, 300);
    });
}

// Update test history
function updateTestHistory(filterType, value) {
    const historyTable = document.querySelector('.history-table tbody');
    
    if (historyTable) {
        // Add loading effect
        historyTable.style.opacity = '0.7';
        
        setTimeout(() => {
            // In a real app, this would fetch new data
            historyTable.style.opacity = '1';
        }, 500);
    }
}

// Initialize interactive elements
function initializeInteractions() {
    // Add hover effects to metric cards
    const metricCards = document.querySelectorAll('.summary-metric-card, .scenario-card');
    metricCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.transition = 'transform 0.2s ease';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Add click effects to buttons
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .btn-icon');
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

// Report action functions
function viewDetailedReport(testId) {
    showNotification(`Opening detailed report for ${testId}...`, 'info');
    
    // In a real app, this would open a detailed report view
    setTimeout(() => {
        showNotification('Detailed report opened successfully', 'success');
    }, 1000);
}

function exportReport(testId) {
    showNotification(`Exporting report ${testId} to PDF...`, 'info');
    
    // Simulate PDF export
    setTimeout(() => {
        showNotification('PDF exported successfully', 'success');
        // In a real app, this would trigger a download
    }, 2000);
}

function uploadToSupervision(testId) {
    showNotification(`Uploading report ${testId} to supervision system...`, 'info');
    
    // Simulate upload to supervision system
    setTimeout(() => {
        showNotification('Report uploaded to supervision system successfully', 'success');
    }, 1500);
}

function exportHistory() {
    showNotification('Exporting test history...', 'info');
    
    setTimeout(() => {
        showNotification('Test history exported to CSV successfully', 'success');
    }, 1000);
}

// Generate report function
document.getElementById('generate-report-btn')?.addEventListener('click', function() {
    showNotification('Generating comprehensive audit report...', 'info');
    
    // Simulate report generation
    setTimeout(() => {
        showNotification('Audit report generated successfully', 'success');
    }, 3000);
});

// Export PDF function
document.getElementById('export-btn')?.addEventListener('click', function() {
    showNotification('Preparing PDF export...', 'info');
    
    setTimeout(() => {
        showNotification('PDF report exported successfully', 'success');
    }, 2000);
});

// Notification system
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

function closeNotification(button) {
    const notification = button.closest('.toast');
    notification.classList.remove('show');
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'check-circle';
        case 'error': return 'alert-circle';
        case 'warning': return 'alert-triangle';
        case 'info':
        default: return 'info';
    }
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
@keyframes ripple {
    to {
        transform: scale(4);
        opacity: 0;
    }
}

.tab-panel {
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.3s ease;
}

.tab-panel.active {
    opacity: 1;
    transform: translateY(0);
}

.summary-card:hover,
.summary-metric-card:hover,
.scenario-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.bias-cell:hover {
    transform: scale(1.05);
    transition: transform 0.2s ease;
}

.dropdown-container {
    position: relative;
}

.dropdown-icon {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    color: var(--text-secondary);
}
`;
document.head.appendChild(style);