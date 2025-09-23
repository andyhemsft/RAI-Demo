// Compliance Configuration Functionality
document.addEventListener('DOMContentLoaded', function() {
    try {
        initializeMetricSelection();
        initializeCategoryToggles();
        initializeConfigSummary();
        
        // Add a small delay to ensure all DOM elements are ready
        setTimeout(() => {
            loadSavedConfiguration();
        }, 100);
    } catch (error) {
        console.error('Error initializing compliance page:', error);
    }
});

// Metric selection state
let selectedMetrics = {
    fairness: new Set(),
    explainability: new Set(),
    robustness: new Set()
};

// Initialize metric selection functionality
function initializeMetricSelection() {
    const metricCheckboxes = document.querySelectorAll('.metric-card input[type="checkbox"]');
    
    metricCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const metricCard = this.closest('.metric-card');
            const metricId = metricCard.getAttribute('data-metric');
            const category = getCategoryFromMetric(metricId);
            
            if (this.checked) {
                selectedMetrics[category].add(metricId);
                metricCard.classList.add('selected');
                showMetricToast(`${getMetricDisplayName(metricId)} added to ${category} testing`, 'success');
            } else {
                selectedMetrics[category].delete(metricId);
                metricCard.classList.remove('selected');
                showMetricToast(`${getMetricDisplayName(metricId)} removed from ${category} testing`, 'info');
            }
            
            updateConfigSummary();
            updateCategoryToggleState(category);
        });
    });
}

// Initialize category toggle buttons
function initializeCategoryToggles() {
    const toggleButtons = document.querySelectorAll('.btn-toggle');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            // This will be handled by the onclick attribute in HTML
        });
    });
}

// Toggle entire category selection
function toggleCategory(category) {
    const categoryMetrics = document.querySelectorAll(`#${category}-metrics .metric-card`);
    const toggleButton = document.querySelector(`#${category}-metrics`).closest('.category-section').querySelector('.btn-toggle');
    const isSelectingAll = toggleButton.querySelector('.toggle-text').textContent === 'Select All';
    
    categoryMetrics.forEach(metricCard => {
        const checkbox = metricCard.querySelector('input[type="checkbox"]');
        const metricId = metricCard.getAttribute('data-metric');
        
        if (isSelectingAll) {
            if (!checkbox.checked) {
                checkbox.checked = true;
                selectedMetrics[category].add(metricId);
                metricCard.classList.add('selected');
            }
        } else {
            if (checkbox.checked) {
                checkbox.checked = false;
                selectedMetrics[category].delete(metricId);
                metricCard.classList.remove('selected');
            }
        }
    });
    
    updateConfigSummary();
    updateCategoryToggleState(category);
    
    const action = isSelectingAll ? 'selected' : 'deselected';
    showMetricToast(`All ${category} metrics ${action}`, 'success');
}

// Update category toggle button state
function updateCategoryToggleState(category) {
    try {
        const categoryMetrics = document.querySelectorAll(`#${category}-metrics .metric-card`);
        const checkedMetrics = document.querySelectorAll(`#${category}-metrics .metric-card input:checked`);
        const categorySection = document.querySelector(`#${category}-metrics`);
        
        if (!categorySection) {
            console.warn(`Category section not found: ${category}`);
            return;
        }
        
        const toggleButton = categorySection.closest('.category-section')?.querySelector('.btn-toggle');
        
        if (!toggleButton) {
            console.warn(`Toggle button not found for category: ${category}`);
            return;
        }
        
        const toggleText = toggleButton.querySelector('.toggle-text');
        const toggleIcon = toggleButton.querySelector('i');
        
        if (!toggleText || !toggleIcon) {
            console.warn(`Toggle button elements not found for category: ${category}`);
            return;
        }
        
        if (checkedMetrics.length === 0) {
            toggleText.textContent = 'Select All';
            toggleIcon.setAttribute('data-feather', 'check-square');
        } else if (checkedMetrics.length === categoryMetrics.length) {
            toggleText.textContent = 'Deselect All';
            toggleIcon.setAttribute('data-feather', 'square');
        } else {
            toggleText.textContent = 'Select All';
            toggleIcon.setAttribute('data-feather', 'minus-square');
        }
        
        feather.replace();
    } catch (error) {
        console.error(`Error updating category toggle state for ${category}:`, error);
    }
}

// Initialize and update configuration summary
function initializeConfigSummary() {
    updateConfigSummary();
}

function updateConfigSummary() {
    try {
        const fairnessCountEl = document.getElementById('fairness-count');
        const explainabilityCountEl = document.getElementById('explainability-count');
        const robustnessCountEl = document.getElementById('robustness-count');
        const totalCountEl = document.getElementById('total-count');
        
        if (fairnessCountEl) fairnessCountEl.textContent = selectedMetrics.fairness.size;
        if (explainabilityCountEl) explainabilityCountEl.textContent = selectedMetrics.explainability.size;
        if (robustnessCountEl) robustnessCountEl.textContent = selectedMetrics.robustness.size;
        
        const total = selectedMetrics.fairness.size + selectedMetrics.explainability.size + selectedMetrics.robustness.size;
        if (totalCountEl) totalCountEl.textContent = total;
        
        // Update summary visual state
        const summaryItems = document.querySelectorAll('.summary-item:not(.total)');
        summaryItems.forEach((item, index) => {
            const categories = ['fairness', 'explainability', 'robustness'];
            const count = selectedMetrics[categories[index]]?.size || 0;
            
            if (count > 0) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        const totalItem = document.querySelector('.summary-item.total');
        if (totalItem) {
            if (total > 0) {
                totalItem.classList.add('active');
            } else {
                totalItem.classList.remove('active');
            }
        }
    } catch (error) {
        console.error('Error updating configuration summary:', error);
    }
}

// Helper functions
function getCategoryFromMetric(metricId) {
    const fairnessMetrics = ['disparate-impact', 'equal-opportunity', 'demographic-parity', 'equalized-odds'];
    const explainabilityMetrics = ['feature-importance', 'lime-stability', 'shap-consistency', 'explanation-fidelity'];
    const robustnessMetrics = ['adversarial-robustness', 'data-drift', 'prediction-stability', 'noise-robustness'];
    
    if (fairnessMetrics.includes(metricId)) return 'fairness';
    if (explainabilityMetrics.includes(metricId)) return 'explainability';
    if (robustnessMetrics.includes(metricId)) return 'robustness';
    
    return 'unknown';
}

function getMetricDisplayName(metricId) {
    const displayNames = {
        'disparate-impact': 'Disparate Impact Ratio',
        'equal-opportunity': 'Equal Opportunity Difference',
        'demographic-parity': 'Demographic Parity',
        'equalized-odds': 'Equalized Odds',
        'feature-importance': 'Feature Importance Consistency',
        'lime-stability': 'LIME Stability Score',
        'shap-consistency': 'SHAP Value Consistency',
        'explanation-fidelity': 'Explanation Fidelity',
        'adversarial-robustness': 'Adversarial Robustness',
        'data-drift': 'Data Drift Detection',
        'prediction-stability': 'Prediction Stability',
        'noise-robustness': 'Noise Robustness'
    };
    
    return displayNames[metricId] || metricId;
}

// Configuration management
function saveConfiguration() {
    try {
        const frequencyInput = document.querySelector('input[name="frequency"]:checked');
        const sampleSizeInput = document.getElementById('sample-size');
        const confidenceLevelInput = document.getElementById('confidence-level');
        const autoRemediationInput = document.getElementById('auto-remediation');
        
        if (!frequencyInput || !sampleSizeInput || !confidenceLevelInput || !autoRemediationInput) {
            showMetricToast('Error: Unable to find configuration inputs', 'error');
            return;
        }
        
        const config = {
            selectedMetrics: {
                fairness: Array.from(selectedMetrics.fairness),
                explainability: Array.from(selectedMetrics.explainability),
                robustness: Array.from(selectedMetrics.robustness)
            },
            testingConfig: {
                frequency: frequencyInput.value,
                sampleSize: parseInt(sampleSizeInput.value) || 1000,
                confidenceLevel: parseFloat(confidenceLevelInput.value) || 0.95,
                autoRemediation: autoRemediationInput.checked
            },
            timestamp: new Date().toISOString()
        };
        
        // Save to localStorage
        localStorage.setItem('complianceConfiguration', JSON.stringify(config));
        
        // Show success message
        showMetricToast('Configuration saved successfully', 'success');
        
        // Optional: Send to server
        console.log('Configuration saved:', config);
    } catch (error) {
        console.error('Error saving configuration:', error);
        showMetricToast('Error saving configuration', 'error');
    }
}

function loadSavedConfiguration() {
    const savedConfig = localStorage.getItem('complianceConfiguration');
    
    if (savedConfig) {
        try {
            const config = JSON.parse(savedConfig);
            
            // Load selected metrics
            if (config.selectedMetrics) {
                Object.keys(config.selectedMetrics).forEach(category => {
                    if (config.selectedMetrics[category] && Array.isArray(config.selectedMetrics[category])) {
                        config.selectedMetrics[category].forEach(metricId => {
                            const checkbox = document.getElementById(`metric-${metricId}`);
                            if (checkbox) {
                                checkbox.checked = true;
                                selectedMetrics[category].add(metricId);
                                const metricCard = checkbox.closest('.metric-card');
                                if (metricCard) {
                                    metricCard.classList.add('selected');
                                }
                            }
                        });
                    }
                });
            }
            
            // Load testing configuration
            if (config.testingConfig) {
                const frequencyRadio = document.querySelector(`input[name="frequency"][value="${config.testingConfig.frequency}"]`);
                if (frequencyRadio) frequencyRadio.checked = true;
                
                const sampleSizeInput = document.getElementById('sample-size');
                if (sampleSizeInput && config.testingConfig.sampleSize) {
                    sampleSizeInput.value = config.testingConfig.sampleSize;
                }
                
                const confidenceLevelSelect = document.getElementById('confidence-level');
                if (confidenceLevelSelect && config.testingConfig.confidenceLevel) {
                    confidenceLevelSelect.value = config.testingConfig.confidenceLevel;
                }
                
                const autoRemediationCheckbox = document.getElementById('auto-remediation');
                if (autoRemediationCheckbox) {
                    autoRemediationCheckbox.checked = config.testingConfig.autoRemediation || false;
                }
            }
            
            // Update UI
            updateConfigSummary();
            Object.keys(selectedMetrics).forEach(category => {
                updateCategoryToggleState(category);
            });
            
            console.log('Configuration loaded successfully');
        } catch (error) {
            console.error('Error loading saved configuration:', error);
            // Clear any corrupted data
            localStorage.removeItem('complianceConfiguration');
            console.log('Cleared corrupted configuration data');
        }
    }
}

function loadPreset() {
    // Create preset selection modal
    const modal = document.createElement('div');
    modal.className = 'preset-modal';
    
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeModal(this.parentElement)"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>Load Configuration Preset</h3>
                <button class="close-btn" onclick="closeModal(this.closest('.preset-modal'))">
                    <i data-feather="x"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="preset-list">
                    <div class="preset-item" onclick="applyPreset('banking')">
                        <div class="preset-icon">
                            <i data-feather="credit-card"></i>
                        </div>
                        <div class="preset-info">
                            <h4>Banking & Lending</h4>
                            <p>Comprehensive fairness and robustness testing for financial services</p>
                            <div class="preset-metrics">
                                <span>8 metrics selected</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="preset-item" onclick="applyPreset('insurance')">
                        <div class="preset-icon">
                            <i data-feather="shield"></i>
                        </div>
                        <div class="preset-info">
                            <h4>Insurance Underwriting</h4>
                            <p>Focus on fairness and explainability for underwriting decisions</p>
                            <div class="preset-metrics">
                                <span>6 metrics selected</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="preset-item" onclick="applyPreset('general')">
                        <div class="preset-icon">
                            <i data-feather="settings"></i>
                        </div>
                        <div class="preset-info">
                            <h4>General Purpose</h4>
                            <p>Balanced selection across all three categories</p>
                            <div class="preset-metrics">
                                <span>9 metrics selected</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    feather.replace();
}

function applyPreset(presetType) {
    // Clear current selections
    clearAllSelections();
    
    const presets = {
        banking: {
            fairness: ['disparate-impact', 'equal-opportunity', 'demographic-parity'],
            explainability: ['feature-importance', 'shap-consistency'],
            robustness: ['adversarial-robustness', 'data-drift', 'prediction-stability']
        },
        insurance: {
            fairness: ['disparate-impact', 'equalized-odds'],
            explainability: ['feature-importance', 'explanation-fidelity'],
            robustness: ['data-drift', 'noise-robustness']
        },
        general: {
            fairness: ['disparate-impact', 'equal-opportunity', 'demographic-parity'],
            explainability: ['feature-importance', 'lime-stability', 'shap-consistency'],
            robustness: ['adversarial-robustness', 'data-drift', 'prediction-stability']
        }
    };
    
    const preset = presets[presetType];
    if (preset) {
        Object.keys(preset).forEach(category => {
            preset[category].forEach(metricId => {
                const checkbox = document.getElementById(`metric-${metricId}`);
                if (checkbox) {
                    checkbox.checked = true;
                    selectedMetrics[category].add(metricId);
                    checkbox.closest('.metric-card').classList.add('selected');
                }
            });
        });
        
        updateConfigSummary();
        Object.keys(selectedMetrics).forEach(category => {
            updateCategoryToggleState(category);
        });
        
        showMetricToast(`${presetType.charAt(0).toUpperCase() + presetType.slice(1)} preset applied`, 'success');
    }
    
    closeModal(document.querySelector('.preset-modal'));
}

function clearAllSelections() {
    const allCheckboxes = document.querySelectorAll('.metric-card input[type="checkbox"]');
    allCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
        checkbox.closest('.metric-card').classList.remove('selected');
    });
    
    selectedMetrics.fairness.clear();
    selectedMetrics.explainability.clear();
    selectedMetrics.robustness.clear();
}

function saveAsPreset() {
    const modal = document.createElement('div');
    modal.className = 'save-preset-modal';
    
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeModal(this.parentElement)"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>Save Configuration as Preset</h3>
                <button class="close-btn" onclick="closeModal(this.closest('.save-preset-modal'))">
                    <i data-feather="x"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Preset Name</label>
                    <input type="text" id="preset-name" placeholder="Enter preset name">
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="preset-description" placeholder="Describe this configuration preset"></textarea>
                </div>
                <div class="current-selection">
                    <h4>Current Selection:</h4>
                    <div class="selection-summary">
                        <span>${selectedMetrics.fairness.size} Fairness</span>
                        <span>${selectedMetrics.explainability.size} Explainability</span>
                        <span>${selectedMetrics.robustness.size} Robustness</span>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="closeModal(this.closest('.save-preset-modal'))">Cancel</button>
                <button class="btn-primary" onclick="confirmSavePreset()">Save Preset</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    feather.replace();
}

function confirmSavePreset() {
    const name = document.getElementById('preset-name').value.trim();
    const description = document.getElementById('preset-description').value.trim();
    
    if (!name) {
        showMetricToast('Please enter a preset name', 'error');
        return;
    }
    
    const preset = {
        name,
        description,
        selectedMetrics: {
            fairness: Array.from(selectedMetrics.fairness),
            explainability: Array.from(selectedMetrics.explainability),
            robustness: Array.from(selectedMetrics.robustness)
        },
        created: new Date().toISOString()
    };
    
    // Save preset (in real app, this would go to server)
    const savedPresets = JSON.parse(localStorage.getItem('savedPresets') || '[]');
    savedPresets.push(preset);
    localStorage.setItem('savedPresets', JSON.stringify(savedPresets));
    
    showMetricToast(`Preset "${name}" saved successfully`, 'success');
    closeModal(document.querySelector('.save-preset-modal'));
}

// Utility functions
function closeModal(modal) {
    if (modal) {
        modal.remove();
    }
}

function showMetricToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `metric-toast ${type}`;
    
    const icons = {
        success: 'check-circle',
        error: 'x-circle',
        warning: 'alert-triangle',
        info: 'info'
    };
    
    toast.innerHTML = `
        <i data-feather="${icons[type]}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    feather.replace();
    
    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Remove toast
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add styles for compliance page
const complianceStyles = `
<style>
.compliance-content {
    padding: 32px 0;
    overflow-x: hidden;
    word-wrap: break-word;
}

.config-summary {
    background: linear-gradient(135deg, #1a1d29 0%, #0f1419 100%);
    border: 1px solid #2d3748;
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 32px;
    overflow: hidden;
}

.config-summary h2 {
    color: #e2e8f0;
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 20px;
}

.summary-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 20px;
}

.summary-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid #2d3748;
    border-radius: 12px;
    transition: all 0.3s ease;
}

.summary-item.active {
    border-color: #00d4ff;
    background: rgba(0, 212, 255, 0.1);
}

.summary-item.total.active {
    border-color: #22c55e;
    background: rgba(34, 197, 94, 0.1);
}

.summary-number {
    font-size: 28px;
    font-weight: 700;
    color: #94a3b8;
    margin-bottom: 4px;
}

.summary-item.active .summary-number {
    color: #00d4ff;
}

.summary-item.total.active .summary-number {
    color: #22c55e;
}

.summary-label {
    font-size: 12px;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 500;
}

.metric-categories {
    display: flex;
    flex-direction: column;
    gap: 32px;
    margin-bottom: 32px;
}

.category-section {
    background: linear-gradient(135deg, #1a1d29 0%, #0f1419 100%);
    border: 1px solid #2d3748;
    border-radius: 16px;
    padding: 24px;
    overflow: hidden;
}

.category-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid #2d3748;
    flex-wrap: wrap;
    gap: 16px;
}

.category-title {
    display: flex;
    align-items: center;
    gap: 16px;
}

.category-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.category-icon.fairness {
    background: linear-gradient(135deg, #00d4ff, #0066cc);
}

.category-icon.explainability {
    background: linear-gradient(135deg, #22c55e, #16a34a);
}

.category-icon.robustness {
    background: linear-gradient(135deg, #f59e0b, #d97706);
}

.category-info h3 {
    color: #e2e8f0;
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 4px;
}

.category-info p {
    color: #94a3b8;
    font-size: 14px;
}

.btn-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid #2d3748;
    border-radius: 8px;
    padding: 8px 16px;
    color: #94a3b8;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-toggle:hover {
    background: rgba(0, 212, 255, 0.1);
    border-color: #00d4ff;
    color: #00d4ff;
}

.metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    align-items: stretch;
}

.metric-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid #2d3748;
    border-radius: 12px;
    padding: 20px;
    transition: all 0.3s ease;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    min-height: 180px;
    height: auto;
}

.metric-card:hover {
    border-color: #00d4ff;
    background: rgba(0, 212, 255, 0.05);
}

.metric-card.selected {
    border-color: #00d4ff;
    background: rgba(0, 212, 255, 0.1);
    box-shadow: 0 4px 16px rgba(0, 212, 255, 0.2);
}

.metric-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
}

.metric-checkbox {
    position: relative;
}

.metric-checkbox input[type="checkbox"] {
    display: none;
}

.metric-checkbox label {
    width: 20px;
    height: 20px;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid #2d3748;
    border-radius: 4px;
    cursor: pointer;
    position: relative;
    display: block;
    transition: all 0.3s ease;
}

.metric-checkbox input[type="checkbox"]:checked + label {
    background: linear-gradient(135deg, #00d4ff, #0066cc);
    border-color: #00d4ff;
}

.metric-checkbox input[type="checkbox"]:checked + label::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 6px;
    width: 6px;
    height: 10px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
}

.metric-card h4 {
    color: #e2e8f0;
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    flex-shrink: 0;
}

.metric-description {
    color: #94a3b8;
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 16px;
    flex-grow: 1;
    overflow-wrap: break-word;
    word-wrap: break-word;
}

.metric-details {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: auto;
}

.metric-type,
.metric-complexity {
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
    flex-shrink: 0;
}

.metric-type {
    background: rgba(0, 212, 255, 0.1);
    color: #00d4ff;
}

.metric-complexity {
    background: rgba(148, 163, 184, 0.1);
    color: #94a3b8;
}

.testing-config {
    background: linear-gradient(135deg, #1a1d29 0%, #0f1419 100%);
    border: 1px solid #2d3748;
    border-radius: 16px;
    padding: 24px;
}

.testing-config h2 {
    color: #e2e8f0;
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 24px;
}

.config-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 24px;
}

.config-section h3 {
    color: #e2e8f0;
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
}

.config-options {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.radio-option {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    color: #94a3b8;
    transition: color 0.3s ease;
}

.radio-option:hover {
    color: #e2e8f0;
}

.radio-option input[type="radio"] {
    display: none;
}

.radio-custom {
    width: 16px;
    height: 16px;
    border: 2px solid #2d3748;
    border-radius: 50%;
    position: relative;
    transition: all 0.3s ease;
}

.radio-option input[type="radio"]:checked + .radio-custom {
    border-color: #00d4ff;
}

.radio-option input[type="radio"]:checked + .radio-custom::after {
    content: '';
    width: 8px;
    height: 8px;
    background: #00d4ff;
    border-radius: 50%;
    position: absolute;
    top: 2px;
    left: 2px;
}

.config-input {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid #2d3748;
    border-radius: 8px;
    overflow: hidden;
}

.config-input input,
.config-input select {
    background: none;
    border: none;
    color: #e2e8f0;
    padding: 12px 16px;
    flex: 1;
    font-size: 14px;
}

.config-input input:focus,
.config-input select:focus {
    outline: none;
}

.input-suffix {
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.05);
    color: #94a3b8;
    font-size: 12px;
    font-weight: 500;
}

.config-toggle {
    display: flex;
    align-items: center;
    gap: 12px;
}

.toggle-checkbox {
    display: none;
}

.toggle-label {
    width: 48px;
    height: 24px;
    background: #2d3748;
    border-radius: 12px;
    cursor: pointer;
    position: relative;
    transition: all 0.3s ease;
    display: block;
}

.toggle-slider {
    width: 20px;
    height: 20px;
    background: #94a3b8;
    border-radius: 50%;
    position: absolute;
    top: 2px;
    left: 2px;
    transition: all 0.3s ease;
}

.toggle-checkbox:checked + .toggle-label {
    background: linear-gradient(135deg, #00d4ff, #0066cc);
}

.toggle-checkbox:checked + .toggle-label .toggle-slider {
    background: white;
    transform: translateX(24px);
}

.toggle-text {
    color: #94a3b8;
    font-size: 14px;
}

.config-actions {
    display: flex;
    gap: 12px;
    align-items: center;
}

/* Modal Styles */
.preset-modal,
.save-preset-modal {
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
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px;
    border-bottom: 1px solid #2d3748;
}

.modal-header h3 {
    color: #e2e8f0;
    font-size: 20px;
    font-weight: 600;
    margin: 0;
}

.close-btn {
    background: none;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    transition: all 0.3s ease;
}

.close-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #e2e8f0;
}

.modal-body {
    padding: 24px;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 24px;
    border-top: 1px solid #2d3748;
}

.preset-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.preset-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid #2d3748;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.preset-item:hover {
    border-color: #00d4ff;
    background: rgba(0, 212, 255, 0.1);
}

.preset-icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #00d4ff, #0066cc);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
}

.preset-info h4 {
    color: #e2e8f0;
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 4px;
}

.preset-info p {
    color: #94a3b8;
    font-size: 14px;
    margin-bottom: 8px;
}

.preset-metrics {
    color: #00d4ff;
    font-size: 12px;
    font-weight: 500;
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

.form-group input,
.form-group textarea {
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

.current-selection h4 {
    color: #e2e8f0;
    margin-bottom: 8px;
}

.selection-summary {
    display: flex;
    gap: 12px;
}

.selection-summary span {
    padding: 4px 8px;
    background: rgba(0, 212, 255, 0.1);
    color: #00d4ff;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
}

/* Toast Styles */
.metric-toast {
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
    min-width: 300px;
}

.metric-toast.show {
    transform: translateX(0);
}

.metric-toast.success {
    border-left: 3px solid #22c55e;
    color: #22c55e;
}

.metric-toast.error {
    border-left: 3px solid #ff4757;
    color: #ff4757;
}

.metric-toast.warning {
    border-left: 3px solid #fbbf24;
    color: #fbbf24;
}

.metric-toast.info {
    border-left: 3px solid #00d4ff;
    color: #00d4ff;
}

.metric-toast span {
    color: #e2e8f0;
}

/* Responsive Design */
@media (max-width: 1200px) {
    .metrics-grid {
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 16px;
    }
    
    .category-header {
        align-items: center;
    }
}

@media (max-width: 768px) {
    .category-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
    }
    
    .metrics-grid {
        grid-template-columns: 1fr;
        gap: 16px;
    }
    
    .metric-card {
        min-height: 160px;
    }
    
    .config-grid {
        grid-template-columns: 1fr;
    }
    
    .summary-stats {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .config-actions {
        flex-direction: column;
        width: 100%;
    }
    
    .config-actions button {
        width: 100%;
    }
    
    .compliance-content {
        padding: 16px 0;
    }
    
    .category-section {
        padding: 20px;
    }
}

@media (max-width: 480px) {
    .summary-stats {
        grid-template-columns: 1fr;
    }
    
    .metrics-grid {
        gap: 12px;
    }
    
    .metric-card {
        padding: 16px;
        min-height: 140px;
    }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', complianceStyles);