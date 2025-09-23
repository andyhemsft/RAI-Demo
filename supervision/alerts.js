// Initialize Feather Icons
feather.replace();

// Alert Management Functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeFilters();
    initializeAlertActions();
    updateAlertCounts();
    
    // Auto-refresh alerts every 30 seconds
    setInterval(refreshAlerts, 30000);
});

function initializeFilters() {
    const filters = document.querySelectorAll('.alert-filters select');
    
    filters.forEach(filter => {
        filter.addEventListener('change', function() {
            applyFilters();
        });
    });
}

function initializeAlertActions() {
    // Initialize checkbox functionality
    const selectAllCheckbox = document.getElementById('select-all');
    const alertCheckboxes = document.querySelectorAll('.alert-checkbox');
    
    selectAllCheckbox.addEventListener('change', function() {
        alertCheckboxes.forEach(checkbox => {
            checkbox.checked = this.checked;
        });
        updateBulkActionsVisibility();
    });
    
    alertCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updateSelectAllState();
            updateBulkActionsVisibility();
        });
    });
}

function applyFilters() {
    const severityFilter = document.getElementById('severity-filter').value;
    const statusFilter = document.getElementById('status-filter').value;
    const institutionFilter = document.getElementById('institution-filter').value;
    const timeFilter = document.getElementById('time-filter').value;
    
    const alertRows = document.querySelectorAll('.alert-row');
    const summaryCards = document.querySelectorAll('.summary-card');
    
    // Filter table rows
    alertRows.forEach(row => {
        let showRow = true;
        
        // Severity filter
        if (severityFilter !== 'all') {
            const severityBadge = row.querySelector('.severity-badge');
            if (!severityBadge.classList.contains(severityFilter)) {
                showRow = false;
            }
        }
        
        // Status filter
        if (statusFilter !== 'all') {
            const statusBadge = row.querySelector('.status-badge');
            if (!statusBadge.classList.contains(statusFilter)) {
                showRow = false;
            }
        }
        
        // Institution filter
        if (institutionFilter !== 'all') {
            const institutionText = row.querySelector('.institution-info span').textContent.toLowerCase();
            if (!institutionText.includes(institutionFilter.replace(/([A-Z])/g, ' $1').toLowerCase().trim())) {
                showRow = false;
            }
        }
        
        row.style.display = showRow ? '' : 'none';
    });
    
    // Filter summary cards
    summaryCards.forEach(card => {
        let showCard = true;
        
        if (severityFilter !== 'all') {
            if (!card.classList.contains(severityFilter)) {
                showCard = false;
            }
        }
        
        card.style.display = showCard ? '' : 'none';
    });
    
    console.log(`Applied filters: Severity=${severityFilter}, Status=${statusFilter}, Institution=${institutionFilter}, Time=${timeFilter}`);
}

function updateAlertCounts() {
    const criticalCount = document.querySelectorAll('.severity-badge.critical').length;
    const warningCount = document.querySelectorAll('.severity-badge.warning').length;
    const infoCount = document.querySelectorAll('.severity-badge.info').length;
    
    document.querySelector('.stat-item.critical .stat-number').textContent = criticalCount;
    document.querySelector('.stat-item.warning .stat-number').textContent = warningCount;
    document.querySelector('.stat-item.info .stat-number').textContent = infoCount;
}

function toggleSelectAll() {
    const selectAllCheckbox = document.getElementById('select-all');
    const alertCheckboxes = document.querySelectorAll('.alert-checkbox');
    
    alertCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
    
    updateBulkActionsVisibility();
}

function updateSelectAllState() {
    const selectAllCheckbox = document.getElementById('select-all');
    const alertCheckboxes = document.querySelectorAll('.alert-checkbox');
    const checkedBoxes = document.querySelectorAll('.alert-checkbox:checked');
    
    if (checkedBoxes.length === 0) {
        selectAllCheckbox.indeterminate = false;
        selectAllCheckbox.checked = false;
    } else if (checkedBoxes.length === alertCheckboxes.length) {
        selectAllCheckbox.indeterminate = false;
        selectAllCheckbox.checked = true;
    } else {
        selectAllCheckbox.indeterminate = true;
        selectAllCheckbox.checked = false;
    }
}

function updateBulkActionsVisibility() {
    const checkedBoxes = document.querySelectorAll('.alert-checkbox:checked');
    const bulkActionBtn = document.querySelector('.control-btn[onclick="bulkActions()"]');
    
    if (checkedBoxes.length > 0) {
        bulkActionBtn.style.background = 'rgba(0, 212, 255, 0.1)';
        bulkActionBtn.style.borderColor = '#00d4ff';
        bulkActionBtn.style.color = '#00d4ff';
    } else {
        bulkActionBtn.style.background = '';
        bulkActionBtn.style.borderColor = '';
        bulkActionBtn.style.color = '';
    }
}

function viewAlert(alertId) {
    console.log(`Viewing alert: ${alertId}`);
    showAlertDetails(alertId);
}

function viewAlertDetails(alertId) {
    const alertData = getAlertData(alertId);
    
    const modal = document.createElement('div');
    modal.className = 'alert-details-modal';
    
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeModal(this.parentElement)"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>Alert Details: ${alertId}</h3>
                <button class="close-btn" onclick="closeModal(this.closest('.alert-details-modal'))">
                    <i data-feather="x"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="alert-detail-header ${alertData.severity}">
                    <div class="alert-icon">
                        <i data-feather="${alertData.icon}"></i>
                    </div>
                    <div class="alert-info">
                        <h4>${alertData.title}</h4>
                        <p>${alertData.institution} - ${alertData.model}</p>
                        <span class="alert-timestamp">${alertData.timestamp}</span>
                    </div>
                    <span class="severity-badge ${alertData.severity}">${alertData.severity}</span>
                </div>
                
                <div class="alert-detail-sections">
                    <div class="detail-section">
                        <h5>Threshold Breach Details</h5>
                        <div class="threshold-comparison">
                            <div class="threshold-item">
                                <label>Current Value</label>
                                <span class="value ${alertData.severity}">${alertData.currentValue}</span>
                            </div>
                            <div class="threshold-item">
                                <label>Threshold</label>
                                <span class="value">${alertData.threshold}</span>
                            </div>
                            <div class="threshold-item">
                                <label>Breach Magnitude</label>
                                <span class="value ${alertData.severity}">${alertData.breachMagnitude}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h5>Impact Assessment</h5>
                        <div class="impact-details">
                            <p><strong>Affected Population:</strong> ${alertData.affectedPopulation}</p>
                            <p><strong>Risk Level:</strong> ${alertData.riskLevel}</p>
                            <p><strong>Regulatory Implications:</strong> ${alertData.regulatoryImplications}</p>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h5>Recommended Actions</h5>
                        <ul class="recommendations">
                            ${alertData.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="detail-section">
                        <h5>Timeline</h5>
                        <div class="timeline">
                            ${alertData.timeline.map(event => `
                                <div class="timeline-event">
                                    <div class="timeline-date">${event.date}</div>
                                    <div class="timeline-content">${event.description}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="closeModal(this.closest('.alert-details-modal'))">Close</button>
                <button class="btn-primary" onclick="generateReport('${alertId}')">Generate Report</button>
                <button class="btn-primary" onclick="escalateAlert('${alertId}')">Escalate</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    feather.replace();
}

function getAlertData(alertId) {
    // Mock alert data - in real app, this would come from API
    const alertDatabase = {
        'ALT-2025-001': {
            title: 'Bias Detection Alert',
            institution: 'CityFirst Bank',
            model: 'Fraud Detection Model v3.2',
            severity: 'critical',
            icon: 'alert-triangle',
            timestamp: '2025-09-22 14:30:15',
            currentValue: '0.67 ratio',
            threshold: '0.80 ratio',
            breachMagnitude: '16.25% below threshold',
            affectedPopulation: 'Female applicants aged 18-25 (~12,000 customers)',
            riskLevel: 'High - Potential discrimination violation',
            regulatoryImplications: 'May violate Equal Credit Opportunity Act provisions',
            recommendations: [
                'Immediate model retraining with bias mitigation techniques',
                'Review historical decisions for affected demographic groups',
                'Implement fairness constraints in model optimization',
                'Conduct manual review of recent automated decisions'
            ],
            timeline: [
                { date: '2025-09-22 14:30', description: 'Alert triggered by automated monitoring system' },
                { date: '2025-09-22 14:31', description: 'Notification sent to supervision team' },
                { date: '2025-09-22 14:35', description: 'Initial severity assessment completed' }
            ]
        },
        'ALT-2025-002': {
            title: 'Performance Degradation',
            institution: 'MetroBank',
            model: 'Credit Scoring Model v2.8',
            severity: 'warning',
            icon: 'trending-down',
            timestamp: '2025-09-22 12:15:42',
            currentValue: '82.3% accuracy',
            threshold: '85.0% accuracy',
            breachMagnitude: '2.7% below threshold',
            affectedPopulation: 'All credit applicants (~5,000 daily applications)',
            riskLevel: 'Medium - Increased false positive/negative rates',
            regulatoryImplications: 'Model validation requirements may be triggered',
            recommendations: [
                'Analyze recent data for distribution shifts',
                'Consider model recalibration or retraining',
                'Increase monitoring frequency for performance metrics',
                'Review data quality and feature engineering'
            ],
            timeline: [
                { date: '2025-09-22 12:15', description: 'Performance threshold breach detected' },
                { date: '2025-09-22 12:16', description: 'Automated degradation analysis initiated' },
                { date: '2025-09-22 12:20', description: 'Trend analysis completed - 7-day decline confirmed' }
            ]
        }
    };
    
    return alertDatabase[alertId] || {
        title: 'Unknown Alert',
        institution: 'Unknown',
        model: 'Unknown',
        severity: 'info',
        icon: 'info',
        timestamp: 'Unknown',
        currentValue: 'N/A',
        threshold: 'N/A',
        breachMagnitude: 'N/A',
        affectedPopulation: 'Unknown',
        riskLevel: 'Unknown',
        regulatoryImplications: 'Under investigation',
        recommendations: ['Contact system administrator'],
        timeline: [{ date: 'Unknown', description: 'Alert data not available' }]
    };
}

function acknowledgeAlert(alertId) {
    const button = event.target.closest('button');
    const row = button.closest('tr') || button.closest('.summary-card');
    
    // Update button state
    button.innerHTML = '<i data-feather="loader"></i>';
    button.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Update status badge
        const statusBadge = row.querySelector('.status-badge');
        if (statusBadge) {
            statusBadge.textContent = 'Acknowledged';
            statusBadge.className = 'status-badge acknowledged';
        }
        
        // Update button
        button.innerHTML = '<i data-feather="check"></i>';
        button.style.background = 'rgba(34, 197, 94, 0.1)';
        button.style.color = '#22c55e';
        
        showToast(`Alert ${alertId} acknowledged`, 'success');
        feather.replace();
    }, 1000);
}

function escalateAlert(alertId) {
    const escalationModal = document.createElement('div');
    escalationModal.className = 'escalation-modal';
    
    escalationModal.innerHTML = `
        <div class="modal-overlay" onclick="closeModal(this.parentElement)"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>Escalate Alert: ${alertId}</h3>
                <button class="close-btn" onclick="closeModal(this.closest('.escalation-modal'))">
                    <i data-feather="x"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Escalation Level</label>
                    <select id="escalation-level">
                        <option value="senior-supervisor">Senior Supervisor</option>
                        <option value="department-head">Department Head</option>
                        <option value="executive-committee">Executive Committee</option>
                        <option value="external-regulator">External Regulator</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Priority</label>
                    <select id="escalation-priority">
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                        <option value="emergency">Emergency</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Escalation Reason</label>
                    <textarea id="escalation-reason" placeholder="Describe why this alert requires escalation..."></textarea>
                </div>
                
                <div class="form-group">
                    <label>Expected Response Time</label>
                    <select id="response-time">
                        <option value="1-hour">Within 1 hour</option>
                        <option value="4-hours">Within 4 hours</option>
                        <option value="24-hours">Within 24 hours</option>
                        <option value="3-days">Within 3 business days</option>
                    </select>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="closeModal(this.closest('.escalation-modal'))">Cancel</button>
                <button class="btn-primary" onclick="submitEscalation('${alertId}')">Escalate Alert</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(escalationModal);
    feather.replace();
}

function submitEscalation(alertId) {
    const level = document.getElementById('escalation-level').value;
    const priority = document.getElementById('escalation-priority').value;
    const reason = document.getElementById('escalation-reason').value;
    const responseTime = document.getElementById('response-time').value;
    
    if (!reason.trim()) {
        showToast('Please provide an escalation reason', 'error');
        return;
    }
    
    // Simulate escalation
    setTimeout(() => {
        showToast(`Alert ${alertId} escalated to ${level}`, 'success');
        closeModal(document.querySelector('.escalation-modal'));
        
        // Update alert status
        updateAlertStatus(alertId, 'escalated');
    }, 1000);
}

function investigateAlert(alertId) {
    console.log(`Initiating investigation for alert: ${alertId}`);
    showToast('Investigation workflow initiated', 'info');
}

function resolveAlert(alertId) {
    const button = event.target.closest('button');
    const row = button.closest('tr');
    
    button.innerHTML = '<i data-feather="loader"></i>';
    button.disabled = true;
    
    setTimeout(() => {
        const statusBadge = row.querySelector('.status-badge');
        statusBadge.textContent = 'Resolved';
        statusBadge.className = 'status-badge resolved';
        
        row.style.opacity = '0.6';
        showToast(`Alert ${alertId} resolved`, 'success');
        feather.replace();
    }, 1000);
}

function updateAlertStatus(alertId, status) {
    const alertRows = document.querySelectorAll('.alert-row');
    
    alertRows.forEach(row => {
        const alertIdElement = row.querySelector('.alert-id');
        if (alertIdElement && alertIdElement.textContent === alertId) {
            const statusBadge = row.querySelector('.status-badge');
            statusBadge.textContent = status.charAt(0).toUpperCase() + status.slice(1);
            statusBadge.className = `status-badge ${status}`;
        }
    });
}

function remindInstitution(alertId) {
    console.log(`Sending reminder for alert: ${alertId}`);
    showToast('Reminder sent to institution', 'success');
}

function trackEscalation(alertId) {
    console.log(`Tracking escalation for alert: ${alertId}`);
    showToast('Escalation tracking opened', 'info');
}

function viewResolution(alertId) {
    console.log(`Viewing resolution for alert: ${alertId}`);
    showToast('Resolution details would be displayed', 'info');
}

function markAllAsRead() {
    const unreadAlerts = document.querySelectorAll('.alert-row:not(.read)');
    
    unreadAlerts.forEach(alert => {
        alert.classList.add('read');
        alert.style.opacity = '0.8';
    });
    
    showToast(`Marked ${unreadAlerts.length} alerts as read`, 'success');
}

function bulkActions() {
    const checkedBoxes = document.querySelectorAll('.alert-checkbox:checked');
    
    if (checkedBoxes.length === 0) {
        showToast('Please select alerts to perform bulk actions', 'warning');
        return;
    }
    
    const bulkModal = document.createElement('div');
    bulkModal.className = 'bulk-actions-modal';
    
    bulkModal.innerHTML = `
        <div class="modal-overlay" onclick="closeModal(this.parentElement)"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>Bulk Actions (${checkedBoxes.length} alerts selected)</h3>
                <button class="close-btn" onclick="closeModal(this.closest('.bulk-actions-modal'))">
                    <i data-feather="x"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="bulk-action-options">
                    <button class="bulk-action-btn" onclick="bulkAcknowledge()">
                        <i data-feather="check"></i>
                        Acknowledge All
                    </button>
                    <button class="bulk-action-btn" onclick="bulkEscalate()">
                        <i data-feather="arrow-up"></i>
                        Escalate All
                    </button>
                    <button class="bulk-action-btn" onclick="bulkExport()">
                        <i data-feather="download"></i>
                        Export Selected
                    </button>
                    <button class="bulk-action-btn danger" onclick="bulkDismiss()">
                        <i data-feather="x-circle"></i>
                        Dismiss All
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(bulkModal);
    feather.replace();
}

function bulkAcknowledge() {
    const checkedBoxes = document.querySelectorAll('.alert-checkbox:checked');
    
    checkedBoxes.forEach(checkbox => {
        const row = checkbox.closest('tr');
        const statusBadge = row.querySelector('.status-badge');
        statusBadge.textContent = 'Acknowledged';
        statusBadge.className = 'status-badge acknowledged';
    });
    
    showToast(`${checkedBoxes.length} alerts acknowledged`, 'success');
    closeModal(document.querySelector('.bulk-actions-modal'));
}

function bulkEscalate() {
    const checkedBoxes = document.querySelectorAll('.alert-checkbox:checked');
    
    checkedBoxes.forEach(checkbox => {
        const row = checkbox.closest('tr');
        const statusBadge = row.querySelector('.status-badge');
        statusBadge.textContent = 'Escalated';
        statusBadge.className = 'status-badge escalated';
    });
    
    showToast(`${checkedBoxes.length} alerts escalated`, 'warning');
    closeModal(document.querySelector('.bulk-actions-modal'));
}

function bulkExport() {
    const checkedBoxes = document.querySelectorAll('.alert-checkbox:checked');
    showToast(`Exporting ${checkedBoxes.length} alerts...`, 'info');
    closeModal(document.querySelector('.bulk-actions-modal'));
}

function bulkDismiss() {
    if (confirm('Are you sure you want to dismiss the selected alerts?')) {
        const checkedBoxes = document.querySelectorAll('.alert-checkbox:checked');
        
        checkedBoxes.forEach(checkbox => {
            const row = checkbox.closest('tr');
            row.style.opacity = '0.3';
        });
        
        showToast(`${checkedBoxes.length} alerts dismissed`, 'info');
        closeModal(document.querySelector('.bulk-actions-modal'));
    }
}

function exportAlerts() {
    showToast('Exporting alert data...', 'info');
    
    // Simulate export process
    setTimeout(() => {
        showToast('Alert export completed', 'success');
    }, 2000);
}

function generateReport(alertId) {
    console.log(`Generating detailed report for alert: ${alertId}`);
    showToast('Generating comprehensive alert report...', 'info');
    
    setTimeout(() => {
        showToast('Alert report generated successfully', 'success');
    }, 2000);
}

function refreshAlerts() {
    // Simulate real-time alert updates
    console.log('Refreshing alerts...');
    
    // Update timestamps and potentially add new alerts
    const alertRows = document.querySelectorAll('.alert-row');
    if (Math.random() < 0.1) { // 10% chance of new alert
        console.log('New alert detected - would add to list');
    }
}

function closeModal(modal) {
    modal.remove();
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = type === 'success' ? 'check-circle' :
                type === 'error' ? 'x-circle' :
                type === 'warning' ? 'alert-triangle' : 'info';
    
    toast.innerHTML = `
        <i data-feather="${icon}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    feather.replace();
    
    setTimeout(() => toast.classList.add('show'), 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add alert-specific styles
const alertStyles = `
<style>
.alerts-content {
    padding: 32px 0;
}

.alert-stats {
    display: flex;
    gap: 24px;
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px 20px;
    border-radius: 8px;
    min-width: 80px;
}

.stat-item.critical {
    background: rgba(255, 71, 87, 0.1);
}

.stat-item.warning {
    background: rgba(251, 191, 36, 0.1);
}

.stat-item.info {
    background: rgba(0, 212, 255, 0.1);
}

.stat-number {
    font-size: 24px;
    font-weight: 700;
    color: inherit;
}

.stat-label {
    font-size: 12px;
    font-weight: 500;
    color: inherit;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.alert-filters {
    display: flex;
    gap: 20px;
    align-items: flex-end;
    margin-bottom: 32px;
    padding: 24px;
    background: linear-gradient(135deg, #1a1d29 0%, #0f1419 100%);
    border: 1px solid #2d3748;
    border-radius: 16px;
}

.filter-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.filter-section label {
    font-size: 12px;
    font-weight: 500;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.filter-section select {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid #2d3748;
    border-radius: 8px;
    padding: 8px 12px;
    color: #e2e8f0;
    font-size: 14px;
    min-width: 150px;
}

.alert-summary {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-bottom: 32px;
}

.summary-card {
    background: linear-gradient(135deg, #1a1d29 0%, #0f1419 100%);
    border: 1px solid #2d3748;
    border-radius: 16px;
    padding: 24px;
    transition: all 0.3s ease;
    position: relative;
}

.summary-card::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    border-radius: 16px 0 0 16px;
}

.summary-card.critical::before {
    background: #ff4757;
}

.summary-card.warning::before {
    background: #fbbf24;
}

.summary-card.info::before {
    background: #00d4ff;
}

.summary-header {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 16px;
}

.summary-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.summary-card.critical .summary-icon {
    background: rgba(255, 71, 87, 0.1);
    color: #ff4757;
}

.summary-card.warning .summary-icon {
    background: rgba(251, 191, 36, 0.1);
    color: #fbbf24;
}

.summary-card.info .summary-icon {
    background: rgba(0, 212, 255, 0.1);
    color: #00d4ff;
}

.summary-content {
    flex: 1;
}

.summary-content h3 {
    font-size: 18px;
    font-weight: 600;
    color: #e2e8f0;
    margin-bottom: 4px;
}

.summary-content p {
    color: #94a3b8;
    font-size: 14px;
}

.summary-time {
    color: #64748b;
    font-size: 12px;
}

.summary-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 20px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 8px;
}

.detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.detail-label {
    color: #94a3b8;
    font-size: 13px;
    font-weight: 500;
}

.detail-value {
    color: #e2e8f0;
    font-size: 13px;
    font-weight: 600;
}

.detail-value.critical {
    color: #ff4757;
}

.detail-value.warning {
    color: #fbbf24;
}

.summary-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.btn-action {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid #2d3748;
    border-radius: 8px;
    padding: 8px 16px;
    color: #94a3b8;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
}

.btn-action.acknowledge:hover {
    background: rgba(34, 197, 94, 0.1);
    border-color: #22c55e;
    color: #22c55e;
}

.btn-action.escalate:hover {
    background: rgba(255, 71, 87, 0.1);
    border-color: #ff4757;
    color: #ff4757;
}

.btn-action.details:hover,
.btn-action.investigate:hover {
    background: rgba(0, 212, 255, 0.1);
    border-color: #00d4ff;
    color: #00d4ff;
}

.btn-action.remind:hover {
    background: rgba(251, 191, 36, 0.1);
    border-color: #fbbf24;
    color: #fbbf24;
}

.alert-table {
    position: relative;
}

.alert-row {
    transition: all 0.3s ease;
}

.alert-row:hover {
    background: rgba(255, 255, 255, 0.02);
}

.alert-row.critical {
    border-left: 3px solid #ff4757;
}

.alert-row.warning {
    border-left: 3px solid #fbbf24;
}

.alert-row.info {
    border-left: 3px solid #00d4ff;
}

.alert-id {
    font-family: 'Courier New', monospace;
    font-size: 13px;
    color: #00d4ff;
    font-weight: 600;
}

.severity-badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.severity-badge.critical {
    background: rgba(255, 71, 87, 0.1);
    color: #ff4757;
}

.severity-badge.warning {
    background: rgba(251, 191, 36, 0.1);
    color: #fbbf24;
}

.severity-badge.info {
    background: rgba(0, 212, 255, 0.1);
    color: #00d4ff;
}

.status-badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
}

.status-badge.active {
    background: rgba(255, 71, 87, 0.1);
    color: #ff4757;
}

.status-badge.acknowledged {
    background: rgba(251, 191, 36, 0.1);
    color: #fbbf24;
}

.status-badge.escalated {
    background: rgba(147, 51, 234, 0.1);
    color: #9333ea;
}

.status-badge.resolved {
    background: rgba(34, 197, 94, 0.1);
    color: #22c55e;
}

.action-buttons {
    display: flex;
    gap: 8px;
}

.table-controls {
    display: flex;
    gap: 12px;
}

.control-btn {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid #2d3748;
    border-radius: 8px;
    padding: 8px 16px;
    color: #94a3b8;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
}

.control-btn:hover {
    background: rgba(0, 212, 255, 0.1);
    border-color: #00d4ff;
    color: #00d4ff;
}

/* Modal Styles for Alert Details */
.alert-details-modal, .escalation-modal, .bulk-actions-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
}

.modal-content {
    background: linear-gradient(135deg, #1a1d29 0%, #0f1419 100%);
    border: 1px solid #2d3748;
    border-radius: 16px;
    width: 90%;
    max-width: 800px;
    max-height: 80vh;
    overflow-y: auto;
    position: relative;
    z-index: 1;
}

.alert-detail-header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 24px;
}

.alert-detail-header.critical {
    background: rgba(255, 71, 87, 0.1);
    border: 1px solid rgba(255, 71, 87, 0.2);
}

.alert-detail-header.warning {
    background: rgba(251, 191, 36, 0.1);
    border: 1px solid rgba(251, 191, 36, 0.2);
}

.alert-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.alert-detail-header.critical .alert-icon {
    background: rgba(255, 71, 87, 0.2);
    color: #ff4757;
}

.alert-detail-header.warning .alert-icon {
    background: rgba(251, 191, 36, 0.2);
    color: #fbbf24;
}

.alert-info {
    flex: 1;
}

.alert-info h4 {
    font-size: 18px;
    font-weight: 600;
    color: #e2e8f0;
    margin-bottom: 4px;
}

.alert-info p {
    color: #94a3b8;
    margin-bottom: 8px;
}

.alert-timestamp {
    color: #64748b;
    font-size: 12px;
    font-family: 'Courier New', monospace;
}

.alert-detail-sections {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.detail-section h5 {
    color: #e2e8f0;
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid #2d3748;
}

.threshold-comparison {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
}

.threshold-item {
    text-align: center;
    padding: 16px;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 8px;
}

.threshold-item label {
    display: block;
    color: #94a3b8;
    font-size: 12px;
    font-weight: 500;
    margin-bottom: 8px;
    text-transform: uppercase;
}

.threshold-item .value {
    font-size: 18px;
    font-weight: 600;
    color: #e2e8f0;
}

.threshold-item .value.critical {
    color: #ff4757;
}

.threshold-item .value.warning {
    color: #fbbf24;
}

.impact-details p {
    color: #94a3b8;
    margin-bottom: 12px;
    line-height: 1.5;
}

.recommendations {
    list-style: none;
    padding: 0;
}

.recommendations li {
    color: #94a3b8;
    padding: 8px 0;
    padding-left: 20px;
    position: relative;
    line-height: 1.5;
}

.recommendations li::before {
    content: '→';
    color: #00d4ff;
    position: absolute;
    left: 0;
    font-weight: bold;
}

.timeline {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.timeline-event {
    display: flex;
    gap: 16px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 8px;
}

.timeline-date {
    color: #64748b;
    font-size: 12px;
    font-family: 'Courier New', monospace;
    min-width: 140px;
}

.timeline-content {
    color: #94a3b8;
    font-size: 14px;
    line-height: 1.5;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    color: #94a3b8;
    font-weight: 500;
    margin-bottom: 8px;
}

.form-group input, .form-group textarea, .form-group select {
    width: 100%;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid #2d3748;
    border-radius: 8px;
    padding: 12px 16px;
    color: #e2e8f0;
    font-size: 14px;
}

.form-group textarea {
    resize: vertical;
    min-height: 100px;
}

.bulk-action-options {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
}

.bulk-action-btn {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid #2d3748;
    border-radius: 12px;
    padding: 20px;
    color: #94a3b8;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    font-weight: 500;
}

.bulk-action-btn:hover {
    background: rgba(0, 212, 255, 0.1);
    border-color: #00d4ff;
    color: #00d4ff;
}

.bulk-action-btn.danger:hover {
    background: rgba(255, 71, 87, 0.1);
    border-color: #ff4757;
    color: #ff4757;
}

/* Toast styles are already included in previous files */

@media (max-width: 768px) {
    .alert-filters {
        flex-direction: column;
        gap: 16px;
    }
    
    .alert-stats {
        flex-direction: column;
        gap: 12px;
    }
    
    .summary-details {
        grid-template-columns: 1fr;
    }
    
    .threshold-comparison {
        grid-template-columns: 1fr;
    }
    
    .bulk-action-options {
        grid-template-columns: 1fr;
    }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', alertStyles);