// Global chart variables
let biasChart;

// Dashboard Charts Initialization
document.addEventListener('DOMContentLoaded', function() {
    initializeCharts();
    initializeInteractions();
});

function initializeCharts() {
    // Performance Trends Chart
    const performanceCtx = document.getElementById('performanceChart').getContext('2d');
    
    const performanceChart = new Chart(performanceCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
            datasets: [{
                label: 'Model Accuracy',
                data: [92.1, 93.5, 91.8, 94.2, 93.8, 95.1, 94.6, 93.9, 94.2],
                borderColor: '#00d4ff',
                backgroundColor: 'rgba(0, 212, 255, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#00d4ff',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 5
            }, {
                label: 'Compliance Rate',
                data: [89.2, 90.1, 88.5, 91.3, 92.1, 93.8, 92.5, 93.2, 94.2],
                borderColor: '#22c55e',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#22c55e',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Model Performance Trends',
                    color: '#e2e8f0',
                    font: { 
                        size: 18, 
                        weight: 'bold' 
                    },
                    padding: {
                        top: 10,
                        bottom: 20
                    }
                },
                legend: {
                    labels: {
                        color: '#e2e8f0',
                        usePointStyle: true,
                        padding: 20
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(45, 55, 72, 0.3)',
                        borderColor: 'rgba(45, 55, 72, 0.3)'
                    },
                    ticks: {
                        color: '#94a3b8'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(45, 55, 72, 0.3)',
                        borderColor: 'rgba(45, 55, 72, 0.3)'
                    },
                    ticks: {
                        color: '#94a3b8',
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    min: 85,
                    max: 100
                }
            },
            elements: {
                point: {
                    hoverRadius: 8
                }
            }
        }
    });

    // Bias and Fairness Chart
    const biasCtx = document.getElementById('biasChart').getContext('2d');
    
    biasChart = new Chart(biasCtx, {
        type: 'doughnut',
        data: {
            labels: ['Compliant Models', 'Warning Level', 'Non-Compliant'],
            datasets: [{
                data: [78, 18, 4],
                backgroundColor: [
                    '#22c55e',
                    '#fbbf24', 
                    '#ef4444'
                ],
                borderColor: [
                    '#16a34a',
                    '#f59e0b',
                    '#dc2626'
                ],
                borderWidth: 2,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Bias & Fairness Distribution',
                    color: '#e2e8f0',
                    font: { 
                        size: 18, 
                        weight: 'bold' 
                    },
                    padding: {
                        top: 10,
                        bottom: 20
                    }
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#e2e8f0',
                        padding: 20,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + '%';
                        }
                    }
                }
            },
            cutout: '60%'
        }
    });
}

function initializeInteractions() {
    // Chart hover effects
    const chartContainers = document.querySelectorAll('.chart-container');
    
    chartContainers.forEach(container => {
        container.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.02)';
            this.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
        });
        
        container.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        });
    });

    // Metric cards animation
    const metricCards = document.querySelectorAll('.metric-card');
    
    metricCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });

    // Table row interactions
    const tableRows = document.querySelectorAll('tbody tr');
    
    tableRows.forEach(row => {
        row.addEventListener('click', function() {
            // Remove active class from all rows
            tableRows.forEach(r => r.classList.remove('active'));
            // Add active class to clicked row
            this.classList.add('active');
        });
    });

    // Action button interactions
    const actionButtons = document.querySelectorAll('.action-btn');
    
    actionButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Add click animation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });

    // Notification bell interaction
    const notificationBell = document.querySelector('.notification-bell');
    
    if (notificationBell) {
        notificationBell.addEventListener('click', function() {
            this.classList.toggle('active');
            showNotificationPopup();
        });
    }

    // Export button interaction
    const exportBtn = document.querySelector('.btn-primary');
    
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            simulateExport();
        });
    }

    // Auto-update metrics every 30 seconds
    setInterval(updateMetrics, 30000);
}

function showNotificationPopup() {
    // Remove existing popup if any
    const existingPopup = document.querySelector('.notification-popup');
    if (existingPopup) {
        existingPopup.remove();
    }

    const popup = document.createElement('div');
    popup.className = 'notification-popup';
    popup.innerHTML = `
        <div class="notification-header">
            <div class="notification-title">
                <i data-feather="bell"></i>
                Recent Alerts
            </div>
            <button class="notification-close">
                <i data-feather="x"></i>
            </button>
        </div>
        <div class="notification-body">
            <div class="notification-list">
                <div class="notification-item critical">
                    <div class="notification-content">
                        <h4>Model Bias Alert</h4>
                        <p>Credit Scoring Model v2.1 shows disparate impact ratio below threshold</p>
                        <div class="notification-time">2 minutes ago</div>
                    </div>
                </div>
                <div class="notification-item warning">
                    <div class="notification-content">
                        <h4>Performance Degradation</h4>
                        <p>Fraud Detection Model accuracy dropped to 89.2%</p>
                        <div class="notification-time">15 minutes ago</div>
                    </div>
                </div>
                <div class="notification-item info">
                    <div class="notification-content">
                        <h4>Audit Complete</h4>
                        <p>Monthly compliance audit finished for MetroBank</p>
                        <div class="notification-time">1 hour ago</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(popup);

    // Replace feather icons in popup
    feather.replace();

    // Add close functionality
    const closeBtn = popup.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        popup.remove();
    });

    // Auto-close after 10 seconds
    setTimeout(() => {
        if (document.body.contains(popup)) {
            popup.remove();
        }
    }, 10000);
}

function simulateExport() {
    const exportBtn = document.querySelector('.btn-primary');
    const originalText = exportBtn.innerHTML;
    
    exportBtn.innerHTML = '<i data-feather="download"></i> Exporting...';
    exportBtn.disabled = true;
    
    feather.replace();
    
    setTimeout(() => {
        exportBtn.innerHTML = '<i data-feather="check"></i> Exported!';
        feather.replace();
        
        setTimeout(() => {
            exportBtn.innerHTML = originalText;
            exportBtn.disabled = false;
            feather.replace();
        }, 2000);
    }, 2000);
}

function updateMetrics() {
    // Simulate real-time metric updates
    const metricValues = document.querySelectorAll('.metric-value');
    
    metricValues.forEach(metric => {
        const currentValue = parseFloat(metric.textContent);
        if (!isNaN(currentValue)) {
            // Add small random variation
            const variation = (Math.random() - 0.5) * 0.2;
            const newValue = Math.max(0, currentValue + variation);
            
            if (metric.textContent.includes('%')) {
                metric.textContent = newValue.toFixed(1) + '%';
            } else {
                metric.textContent = Math.round(newValue);
            }
        }
    });
}