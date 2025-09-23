// Rule Configuration Functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeRuleTabs();
    initializeToggles();
    initializeThresholdInputs();
});

function initializeRuleTabs() {
    const tabs = document.querySelectorAll('.rule-tab');
    const categories = document.querySelectorAll('.rule-category');

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetCategory = this.getAttribute('data-category');
            
            // Remove active class from all tabs and categories
            tabs.forEach(t => t.classList.remove('active'));
            categories.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding category
            this.classList.add('active');
            document.getElementById(`${targetCategory}-rules`).classList.add('active');
        });
    });
}

function initializeToggles() {
    const toggles = document.querySelectorAll('.rule-toggle input[type="checkbox"]');
    
    toggles.forEach(toggle => {
        toggle.addEventListener('change', function() {
            const ruleCard = this.closest('.rule-card');
            const thresholdControls = ruleCard.querySelector('.threshold-controls');
            const ruleActions = ruleCard.querySelector('.rule-actions');
            
            if (this.checked) {
                ruleCard.classList.remove('disabled');
                thresholdControls.style.opacity = '1';
                ruleActions.style.opacity = '1';
                thresholdControls.style.pointerEvents = 'auto';
                ruleActions.style.pointerEvents = 'auto';
            } else {
                ruleCard.classList.add('disabled');
                thresholdControls.style.opacity = '0.5';
                ruleActions.style.opacity = '0.5';
                thresholdControls.style.pointerEvents = 'none';
                ruleActions.style.pointerEvents = 'none';
            }
            
            console.log(`Rule ${this.id} ${this.checked ? 'enabled' : 'disabled'}`);
        });
    });
}

function initializeThresholdInputs() {
    const thresholdInputs = document.querySelectorAll('.threshold-input input[type="number"]');
    
    thresholdInputs.forEach(input => {
        input.addEventListener('change', function() {
            validateThreshold(this);
        });
        
        input.addEventListener('input', function() {
            this.style.borderColor = '#2d3748';
        });
    });
}

function validateThreshold(input) {
    const value = parseFloat(input.value);
    const min = parseFloat(input.min);
    const max = parseFloat(input.max);
    
    if (value < min || value > max) {
        input.style.borderColor = '#ff4757';
        showToast(`Threshold value must be between ${min} and ${max}`, 'error');
        return false;
    }
    
    // Check if warning threshold is greater than critical threshold
    const ruleCard = input.closest('.rule-card');
    const thresholdItems = ruleCard.querySelectorAll('.threshold-item');
    
    if (thresholdItems.length === 2) {
        const warningInput = thresholdItems[0].querySelector('input');
        const criticalInput = thresholdItems[1].querySelector('input');
        
        const warningValue = parseFloat(warningInput.value);
        const criticalValue = parseFloat(criticalInput.value);
        
        // For most metrics, warning should be less severe than critical
        if (input.closest('.threshold-item') === thresholdItems[0] && warningValue <= criticalValue) {
            input.style.borderColor = '#fbbf24';
            showToast('Warning threshold should typically be less severe than critical threshold', 'warning');
        }
    }
    
    input.style.borderColor = '#22c55e';
    return true;
}

function testRule(ruleId) {
    const button = event.target;
    const originalText = button.textContent;
    
    // Show loading state
    button.innerHTML = '<i data-feather="loader"></i> Testing...';
    button.disabled = true;
    feather.replace();
    
    // Simulate rule testing
    setTimeout(() => {
        const testResults = generateTestResults(ruleId);
        showRuleTestResults(ruleId, testResults);
        
        button.innerHTML = originalText;
        button.disabled = false;
        feather.replace();
    }, 2000);
}

function generateTestResults(ruleId) {
    const mockResults = {
        'disparate-impact': {
            passed: false,
            currentValue: 0.72,
            threshold: 0.8,
            affectedInstitutions: ['CityFirst Bank', 'Regional Credit Union'],
            severity: 'critical'
        },
        'equal-opportunity': {
            passed: true,
            currentValue: 0.08,
            threshold: 0.1,
            affectedInstitutions: [],
            severity: 'none'
        },
        'model-accuracy': {
            passed: false,
            currentValue: 82.5,
            threshold: 85,
            affectedInstitutions: ['MetroBank'],
            severity: 'warning'
        }
    };
    
    return mockResults[ruleId] || {
        passed: true,
        currentValue: 0.95,
        threshold: 0.8,
        affectedInstitutions: [],
        severity: 'none'
    };
}

function showRuleTestResults(ruleId, results) {
    const modal = document.createElement('div');
    modal.className = 'test-results-modal';
    
    const severityClass = results.severity === 'critical' ? 'critical' : 
                         results.severity === 'warning' ? 'warning' : 'success';
    
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeModal(this.parentElement)"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>Rule Test Results: ${ruleId}</h3>
                <button class="close-btn" onclick="closeModal(this.closest('.test-results-modal'))">
                    <i data-feather="x"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="test-status ${severityClass}">
                    <i data-feather="${results.passed ? 'check-circle' : 'alert-triangle'}"></i>
                    <span>${results.passed ? 'PASSED' : 'FAILED'}</span>
                </div>
                
                <div class="test-details">
                    <div class="detail-item">
                        <label>Current Value:</label>
                        <span>${results.currentValue}</span>
                    </div>
                    <div class="detail-item">
                        <label>Threshold:</label>
                        <span>${results.threshold}</span>
                    </div>
                    <div class="detail-item">
                        <label>Severity:</label>
                        <span class="severity-badge ${severityClass}">${results.severity}</span>
                    </div>
                </div>
                
                ${results.affectedInstitutions.length > 0 ? `
                    <div class="affected-institutions">
                        <h4>Affected Institutions:</h4>
                        <ul>
                            ${results.affectedInstitutions.map(inst => `<li>${inst}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                <div class="test-recommendations">
                    <h4>Recommendations:</h4>
                    <p>${getRecommendations(ruleId, results)}</p>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="closeModal(this.closest('.test-results-modal'))">Close</button>
                ${!results.passed ? '<button class="btn-primary" onclick="createAlert(\'' + ruleId + '\')">Create Alert</button>' : ''}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    feather.replace();
}

function getRecommendations(ruleId, results) {
    const recommendations = {
        'disparate-impact': 'Consider reviewing the model training data for potential bias. Implement bias mitigation techniques such as data augmentation or algorithmic fairness constraints.',
        'equal-opportunity': 'The model shows good fairness across demographic groups. Continue monitoring to ensure sustained performance.',
        'model-accuracy': 'Model accuracy has dropped below acceptable levels. Consider retraining with more recent data or reviewing feature engineering.'
    };
    
    return recommendations[ruleId] || 'Continue monitoring this metric to ensure consistent performance.';
}

function showRuleHistory(ruleId) {
    console.log(`Showing history for rule: ${ruleId}`);
    showToast('Rule history feature would show historical threshold breaches and trends', 'info');
}

function saveAllRules() {
    const button = event.target;
    const originalContent = button.innerHTML;
    
    // Show loading state
    button.innerHTML = '<i data-feather="loader"></i> Saving...';
    button.disabled = true;
    feather.replace();
    
    // Collect all rule configurations
    const ruleConfigs = collectRuleConfigurations();
    
    // Simulate API call
    setTimeout(() => {
        console.log('Saving rule configurations:', ruleConfigs);
        
        button.innerHTML = '<i data-feather="check"></i> Saved!';
        button.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
        feather.replace();
        
        showToast('All rules saved successfully', 'success');
        
        // Reset button after 2 seconds
        setTimeout(() => {
            button.innerHTML = originalContent;
            button.style.background = '';
            button.disabled = false;
            feather.replace();
        }, 2000);
    }, 1500);
}

function collectRuleConfigurations() {
    const configs = {};
    const ruleCards = document.querySelectorAll('.rule-card');
    
    ruleCards.forEach(card => {
        const toggle = card.querySelector('input[type="checkbox"]');
        const thresholdInputs = card.querySelectorAll('.threshold-input input');
        const ruleName = toggle.id;
        
        configs[ruleName] = {
            enabled: toggle.checked,
            thresholds: Array.from(thresholdInputs).map(input => ({
                type: input.closest('.threshold-item').querySelector('label').textContent.trim(),
                value: parseFloat(input.value),
                unit: input.nextElementSibling.textContent
            }))
        };
    });
    
    return configs;
}

function createCustomRule() {
    const modal = document.createElement('div');
    modal.className = 'custom-rule-modal';
    
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeModal(this.parentElement)"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>Create Custom Rule</h3>
                <button class="close-btn" onclick="closeModal(this.closest('.custom-rule-modal'))">
                    <i data-feather="x"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Rule Name</label>
                    <input type="text" placeholder="Enter rule name" id="custom-rule-name">
                </div>
                
                <div class="form-group">
                    <label>Description</label>
                    <textarea placeholder="Describe what this rule monitors" id="custom-rule-description"></textarea>
                </div>
                
                <div class="form-group">
                    <label>Metric Type</label>
                    <select id="custom-rule-metric">
                        <option value="percentage">Percentage</option>
                        <option value="ratio">Ratio</option>
                        <option value="count">Count</option>
                        <option value="score">Score</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Institution Scope</label>
                    <select id="custom-rule-scope">
                        <option value="all">All Institutions</option>
                        <option value="specific">Specific Institutions</option>
                        <option value="category">Institution Category</option>
                    </select>
                </div>
                
                <div class="threshold-section">
                    <h4>Threshold Configuration</h4>
                    <div class="threshold-controls">
                        <div class="threshold-item">
                            <label>Warning Threshold</label>
                            <div class="threshold-input">
                                <input type="number" id="custom-warning-threshold">
                                <span class="threshold-unit">%</span>
                            </div>
                        </div>
                        <div class="threshold-item">
                            <label>Critical Threshold</label>
                            <div class="threshold-input">
                                <input type="number" id="custom-critical-threshold">
                                <span class="threshold-unit">%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="closeModal(this.closest('.custom-rule-modal'))">Cancel</button>
                <button class="btn-primary" onclick="saveCustomRule()">Create Rule</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    feather.replace();
}

function saveCustomRule() {
    const name = document.getElementById('custom-rule-name').value;
    const description = document.getElementById('custom-rule-description').value;
    
    if (!name || !description) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    // Simulate saving
    setTimeout(() => {
        showToast('Custom rule created successfully', 'success');
        closeModal(document.querySelector('.custom-rule-modal'));
        
        // Add the new rule to the list
        addCustomRuleToList(name, description);
    }, 1000);
}

function addCustomRuleToList(name, description) {
    const customRulesList = document.querySelector('.custom-rules-list');
    
    const ruleItem = document.createElement('div');
    ruleItem.className = 'custom-rule-item';
    ruleItem.innerHTML = `
        <div class="custom-rule-header">
            <h3>${name}</h3>
            <div class="custom-rule-actions">
                <button class="btn-edit" onclick="editCustomRule('${name.toLowerCase().replace(/\s+/g, '-')}')">
                    <i data-feather="edit-2"></i>
                </button>
                <button class="btn-delete" onclick="deleteCustomRule('${name.toLowerCase().replace(/\s+/g, '-')}')">
                    <i data-feather="trash-2"></i>
                </button>
            </div>
        </div>
        <p class="custom-rule-description">${description}</p>
        <div class="custom-rule-status">
            <span class="status-badge active">Active</span>
            <span class="last-triggered">Just created</span>
        </div>
    `;
    
    customRulesList.appendChild(ruleItem);
    feather.replace();
}

function editCustomRule(ruleId) {
    console.log(`Editing custom rule: ${ruleId}`);
    showToast('Edit functionality would allow modifying the custom rule', 'info');
}

function deleteCustomRule(ruleId) {
    if (confirm('Are you sure you want to delete this custom rule?')) {
        const ruleItem = event.target.closest('.custom-rule-item');
        ruleItem.remove();
        showToast('Custom rule deleted', 'success');
    }
}

function createAlert(ruleId) {
    console.log(`Creating alert for rule: ${ruleId}`);
    showToast('Alert created for supervisory review', 'success');
    closeModal(document.querySelector('.test-results-modal'));
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
    
    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Hide toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add styles for modals, toasts, and rule-specific styling
const rulesStyles = `
<style>
.rules-content {
    padding: 32px;
    max-width: 1400px;
}

.rule-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 32px;
    border-bottom: 1px solid #2d3748;
    padding-bottom: 0;
}

.rule-tab {
    background: none;
    border: none;
    padding: 16px 24px;
    color: #94a3b8;
    cursor: pointer;
    border-radius: 8px 8px 0 0;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
    position: relative;
}

.rule-tab:hover {
    color: #00d4ff;
    background: rgba(0, 212, 255, 0.05);
}

.rule-tab.active {
    color: #00d4ff;
    background: rgba(0, 212, 255, 0.1);
}

.rule-tab.active::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, #00d4ff, #0066cc);
}

.rule-category {
    display: none;
}

.rule-category.active {
    display: block;
}

.category-header {
    margin-bottom: 32px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

.category-header h2 {
    font-size: 24px;
    font-weight: 700;
    color: #e2e8f0;
    margin-bottom: 8px;
}

.category-header p {
    color: #94a3b8;
    font-size: 16px;
}

.rules-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 24px;
}

.rule-card {
    background: linear-gradient(135deg, #1a1d29 0%, #0f1419 100%);
    border: 1px solid #2d3748;
    border-radius: 16px;
    padding: 24px;
    transition: all 0.3s ease;
}

.rule-card:hover {
    border-color: #00d4ff;
    box-shadow: 0 8px 32px rgba(0, 212, 255, 0.1);
}

.rule-card.disabled {
    opacity: 0.6;
}

.rule-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.rule-header h3 {
    font-size: 18px;
    font-weight: 600;
    color: #e2e8f0;
}

.rule-toggle {
    position: relative;
}

.rule-toggle input[type="checkbox"] {
    display: none;
}

.rule-toggle label {
    width: 48px;
    height: 24px;
    background: #2d3748;
    border-radius: 12px;
    cursor: pointer;
    position: relative;
    transition: all 0.3s ease;
    display: block;
}

.rule-toggle label::after {
    content: '';
    width: 20px;
    height: 20px;
    background: #94a3b8;
    border-radius: 50%;
    position: absolute;
    top: 2px;
    left: 2px;
    transition: all 0.3s ease;
}

.rule-toggle input[type="checkbox"]:checked + label {
    background: linear-gradient(135deg, #00d4ff, #0066cc);
}

.rule-toggle input[type="checkbox"]:checked + label::after {
    background: white;
    transform: translateX(24px);
}

.rule-description {
    color: #94a3b8;
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 24px;
}

.threshold-controls {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
}

.threshold-item label {
    display: block;
    color: #94a3b8;
    font-size: 12px;
    font-weight: 500;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.threshold-input {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid #2d3748;
    border-radius: 8px;
    overflow: hidden;
    transition: all 0.3s ease;
}

.threshold-input:focus-within {
    border-color: #00d4ff;
    box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
}

.threshold-input input {
    background: none;
    border: none;
    color: #e2e8f0;
    padding: 12px 16px;
    flex: 1;
    font-size: 14px;
}

.threshold-input input:focus {
    outline: none;
}

.threshold-unit {
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.05);
    color: #94a3b8;
    font-size: 12px;
    font-weight: 500;
}

.rule-actions {
    display: flex;
    gap: 12px;
}

.btn-test, .btn-history {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid #2d3748;
    border-radius: 8px;
    padding: 8px 16px;
    color: #94a3b8;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-test:hover {
    background: rgba(0, 212, 255, 0.1);
    border-color: #00d4ff;
    color: #00d4ff;
}

.btn-history:hover {
    background: rgba(251, 191, 36, 0.1);
    border-color: #fbbf24;
    color: #fbbf24;
}

.custom-rules-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.custom-rule-item {
    background: linear-gradient(135deg, #1a1d29 0%, #0f1419 100%);
    border: 1px solid #2d3748;
    border-radius: 12px;
    padding: 20px;
}

.custom-rule-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.custom-rule-header h3 {
    color: #e2e8f0;
    font-size: 16px;
    font-weight: 600;
}

.custom-rule-actions {
    display: flex;
    gap: 8px;
}

.btn-edit, .btn-delete {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid #2d3748;
    border-radius: 6px;
    padding: 8px;
    color: #94a3b8;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-edit:hover {
    background: rgba(0, 212, 255, 0.1);
    border-color: #00d4ff;
    color: #00d4ff;
}

.btn-delete:hover {
    background: rgba(255, 71, 87, 0.1);
    border-color: #ff4757;
    color: #ff4757;
}

.custom-rule-description {
    color: #94a3b8;
    font-size: 14px;
    margin-bottom: 16px;
}

.custom-rule-status {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.status-badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
}

.status-badge.active {
    background: rgba(34, 197, 94, 0.1);
    color: #22c55e;
}

.last-triggered {
    color: #64748b;
    font-size: 12px;
}

/* Modal Styles */
.test-results-modal, .custom-rule-modal {
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
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    position: relative;
    z-index: 1;
}

.modal-header {
    padding: 24px 24px 16px;
    border-bottom: 1px solid #2d3748;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-header h3 {
    color: #e2e8f0;
    font-size: 18px;
    font-weight: 600;
}

.close-btn {
    background: none;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
}

.close-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #e2e8f0;
}

.modal-body {
    padding: 24px;
}

.modal-footer {
    padding: 16px 24px 24px;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

.test-status {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 24px;
    font-weight: 600;
}

.test-status.success {
    background: rgba(34, 197, 94, 0.1);
    color: #22c55e;
}

.test-status.warning {
    background: rgba(251, 191, 36, 0.1);
    color: #fbbf24;
}

.test-status.critical {
    background: rgba(255, 71, 87, 0.1);
    color: #ff4757;
}

.test-details {
    margin-bottom: 24px;
}

.detail-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #2d3748;
}

.detail-item label {
    color: #94a3b8;
    font-weight: 500;
}

.detail-item span {
    color: #e2e8f0;
}

.severity-badge {
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
}

.severity-badge.success {
    background: rgba(34, 197, 94, 0.2);
    color: #22c55e;
}

.severity-badge.warning {
    background: rgba(251, 191, 36, 0.2);
    color: #fbbf24;
}

.severity-badge.critical {
    background: rgba(255, 71, 87, 0.2);
    color: #ff4757;
}

.affected-institutions {
    margin-bottom: 24px;
}

.affected-institutions h4 {
    color: #e2e8f0;
    margin-bottom: 12px;
}

.affected-institutions ul {
    list-style: none;
    padding: 0;
}

.affected-institutions li {
    color: #94a3b8;
    padding: 4px 0;
    padding-left: 16px;
    position: relative;
}

.affected-institutions li::before {
    content: '•';
    color: #ff4757;
    position: absolute;
    left: 0;
}

.test-recommendations h4 {
    color: #e2e8f0;
    margin-bottom: 12px;
}

.test-recommendations p {
    color: #94a3b8;
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
    min-height: 80px;
}

.threshold-section {
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid #2d3748;
}

.threshold-section h4 {
    color: #e2e8f0;
    margin-bottom: 16px;
}

.btn-secondary {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid #2d3748;
    border-radius: 8px;
    padding: 12px 20px;
    color: #94a3b8;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-secondary:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #e2e8f0;
}

/* Toast Styles */
.toast {
    position: fixed;
    top: 100px;
    right: 20px;
    background: linear-gradient(135deg, #1a1d29 0%, #0f1419 100%);
    border: 1px solid #2d3748;
    border-radius: 8px;
    padding: 16px 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    transform: translateX(100%);
    transition: transform 0.3s ease;
    z-index: 10001;
}

.toast.show {
    transform: translateX(0);
}

.toast-success {
    border-left: 3px solid #22c55e;
    color: #22c55e;
}

.toast-error {
    border-left: 3px solid #ff4757;
    color: #ff4757;
}

.toast-warning {
    border-left: 3px solid #fbbf24;
    color: #fbbf24;
}

.toast-info {
    border-left: 3px solid #00d4ff;
    color: #00d4ff;
}

.toast span {
    color: #e2e8f0;
}

@media (max-width: 768px) {
    .rules-grid {
        grid-template-columns: 1fr;
    }
    
    .threshold-controls {
        grid-template-columns: 1fr;
        gap: 12px;
    }
    
    .threshold-item label {
        white-space: normal;
        text-overflow: unset;
        overflow: visible;
    }
    
    .rule-tabs {
        flex-wrap: wrap;
    }
    
    .modal-content {
        width: 95%;
        margin: 20px;
    }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', rulesStyles);