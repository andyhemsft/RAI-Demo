// Test Execution System

// Global variables
let useCases = [];
let testHistory = [];
let currentTest = null;
let uploadedFiles = {};

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    loadUseCases();
    loadTestHistory();
    setupEventListeners();
    setupFileUploads();
    
    // Check if a use case was pre-selected from URL
    const urlParams = new URLSearchParams(window.location.search);
    const selectedUseCase = urlParams.get('useCase');
    if (selectedUseCase) {
        document.getElementById('use-case-select').value = selectedUseCase;
        onUseCaseChange();
    }
});

// Setup event listeners
function setupEventListeners() {
    const form = document.getElementById('test-execution-form');
    const useCaseSelect = document.getElementById('use-case-select');
    
    if (form) {
        form.addEventListener('submit', handleTestSubmission);
        form.addEventListener('input', validateForm);
        form.addEventListener('change', validateForm);
    }
    
    if (useCaseSelect) {
        useCaseSelect.addEventListener('change', onUseCaseChange);
    }
}

// Setup file upload areas
function setupFileUploads() {
    const uploadAreas = ['training-data', 'testing-data', 'model-file', 'ground-truth'];
    
    uploadAreas.forEach(areaId => {
        const uploadArea = document.getElementById(`${areaId}-upload`);
        const fileInput = document.getElementById(`${areaId}-file`);
        
        if (uploadArea && fileInput) {
            // Click to browse
            uploadArea.addEventListener('click', (e) => {
                if (!e.target.classList.contains('remove-file')) {
                    fileInput.click();
                }
            });
            
            // File input change
            fileInput.addEventListener('change', (e) => {
                handleFileUpload(areaId, e.target.files[0]);
            });
            
            // Drag and drop
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('drag-over');
            });
            
            uploadArea.addEventListener('dragleave', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('drag-over');
            });
            
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('drag-over');
                
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    handleFileUpload(areaId, files[0]);
                }
            });
        }
    });
}

// Load use cases from localStorage
function loadUseCases() {
    const stored = localStorage.getItem('auditing-use-cases');
    if (stored) {
        try {
            useCases = JSON.parse(stored);
            populateUseCaseSelect();
        } catch (error) {
            console.error('Error loading use cases:', error);
            useCases = [];
        }
    }
}

// Load test history from localStorage
function loadTestHistory() {
    const stored = localStorage.getItem('auditing-test-history');
    if (stored) {
        try {
            testHistory = JSON.parse(stored);
        } catch (error) {
            console.error('Error loading test history:', error);
            testHistory = [];
        }
    }
}

// Populate use case select dropdown
function populateUseCaseSelect() {
    const select = document.getElementById('use-case-select');
    if (!select) return;
    
    // Clear existing options except the first one
    select.innerHTML = '<option value="">Select a use case to test</option>';
    
    useCases.forEach(useCase => {
        const option = document.createElement('option');
        option.value = useCase.id;
        option.textContent = useCase.name;
        select.appendChild(option);
    });
}

// Handle use case selection change
function onUseCaseChange() {
    const select = document.getElementById('use-case-select');
    const selectedId = select.value;
    
    if (selectedId) {
        const useCase = useCases.find(uc => uc.id === selectedId);
        if (useCase) {
            showUseCaseDetails(useCase);
            
            // Pre-select test types based on use case focus areas
            if (useCase.focusAreas) {
                document.querySelectorAll('input[type="checkbox"][value]').forEach(checkbox => {
                    checkbox.checked = useCase.focusAreas.includes(checkbox.value);
                });
            }
        }
    } else {
        hideUseCaseDetails();
    }
    
    validateForm();
}

// Show use case details
function showUseCaseDetails(useCase) {
    const detailsContainer = document.getElementById('use-case-details');
    const nameElement = document.getElementById('preview-name');
    const riskElement = document.getElementById('preview-risk');
    const typeElement = document.getElementById('preview-type');
    const descriptionElement = document.getElementById('preview-description');
    
    if (detailsContainer && nameElement && riskElement && typeElement && descriptionElement) {
        nameElement.textContent = useCase.name;
        riskElement.textContent = formatRiskCategory(useCase.riskCategory);
        riskElement.className = `risk-badge ${useCase.riskCategory}`;
        typeElement.textContent = formatModelType(useCase.modelType);
        descriptionElement.textContent = useCase.description;
        
        detailsContainer.style.display = 'block';
    }
}

// Hide use case details
function hideUseCaseDetails() {
    const detailsContainer = document.getElementById('use-case-details');
    if (detailsContainer) {
        detailsContainer.style.display = 'none';
    }
}

// Handle file upload
function handleFileUpload(areaId, file) {
    if (!file) return;
    
    const uploadArea = document.getElementById(`${areaId}-upload`);
    const placeholder = uploadArea.querySelector('.upload-placeholder');
    const success = uploadArea.querySelector('.upload-success');
    const fileName = success.querySelector('.file-name');
    
    // Store the file
    uploadedFiles[areaId] = file;
    
    // Update UI
    placeholder.style.display = 'none';
    success.style.display = 'flex';
    fileName.textContent = file.name;
    
    validateForm();
    
    showToast(`${file.name} uploaded successfully`, 'success');
}

// Remove uploaded file
function removeFile(areaId) {
    const uploadArea = document.getElementById(`${areaId}-upload`);
    const placeholder = uploadArea.querySelector('.upload-placeholder');
    const success = uploadArea.querySelector('.upload-success');
    const fileInput = document.getElementById(`${areaId}-file`);
    
    // Remove the file
    delete uploadedFiles[areaId];
    
    // Reset file input
    if (fileInput) {
        fileInput.value = '';
    }
    
    // Update UI
    placeholder.style.display = 'block';
    success.style.display = 'none';
    
    validateForm();
}

// Validate form
function validateForm() {
    const useCaseSelected = document.getElementById('use-case-select').value;
    const requiredFiles = ['training-data', 'testing-data', 'model-file'];
    const filesUploaded = requiredFiles.every(fileId => uploadedFiles[fileId]);
    const testTypesSelected = document.querySelectorAll('input[type="checkbox"]:checked').length > 0;
    
    const isValid = useCaseSelected && filesUploaded && testTypesSelected;
    
    const submitBtn = document.getElementById('run-test-btn');
    if (submitBtn) {
        submitBtn.disabled = !isValid;
    }
    
    return isValid;
}

// Handle test form submission
function handleTestSubmission(event) {
    event.preventDefault();
    
    if (!validateForm()) {
        showToast('Please complete all required fields', 'error');
        return;
    }
    
    const formData = collectFormData();
    startTestExecution(formData);
}

// Collect form data
function collectFormData() {
    const useCaseId = document.getElementById('use-case-select').value;
    const useCase = useCases.find(uc => uc.id === useCaseId);
    
    const testTypes = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    
    const protectedAttributes = document.getElementById('protected-attributes').value
        .split(',')
        .map(attr => attr.trim())
        .filter(attr => attr.length > 0);
    
    return {
        useCase: useCase,
        files: { ...uploadedFiles },
        testTypes: testTypes,
        parameters: {
            protectedAttributes: protectedAttributes,
            confidenceLevel: parseFloat(document.getElementById('confidence-level').value),
            sampleSize: parseInt(document.getElementById('sample-size').value),
            testTimeout: parseInt(document.getElementById('test-timeout').value),
            randomSeed: parseInt(document.getElementById('random-seed').value),
            outputFormat: document.getElementById('output-format').value,
            detailedLogs: document.getElementById('detailed-logs').checked
        }
    };
}

// Start test execution
function startTestExecution(formData) {
    // Hide setup form and show progress
    document.querySelector('.test-setup-card').style.display = 'none';
    document.getElementById('test-progress-card').style.display = 'block';
    
    // Create test record
    currentTest = {
        id: generateId(),
        useCaseId: formData.useCase.id,
        useCaseName: formData.useCase.name,
        testTypes: formData.testTypes,
        parameters: formData.parameters,
        status: 'running',
        startTime: new Date().toISOString(),
        endTime: null,
        duration: null,
        score: null,
        results: null
    };
    
    // Add to history
    testHistory.unshift(currentTest);
    saveTestHistory();
    
    // Start simulated test execution
    simulateTestExecution();
}

// Simulate test execution (in real app, this would call actual testing API)
function simulateTestExecution() {
    const steps = ['setup', 'fairness', 'explainability', 'performance', 'report'];
    const stepDurations = [2000, 8000, 6000, 5000, 3000]; // milliseconds
    let currentStepIndex = 0;
    let totalProgress = 0;
    
    function executeStep() {
        if (currentStepIndex >= steps.length) {
            completeTest();
            return;
        }
        
        const stepName = steps[currentStepIndex];
        const duration = stepDurations[currentStepIndex];
        
        // Update step status to running
        updateStepStatus(stepName, 'running');
        updateProgress(totalProgress, `Running ${stepName} tests...`);
        
        // Simulate step execution
        setTimeout(() => {
            // Complete current step
            updateStepStatus(stepName, 'completed');
            totalProgress += (100 / steps.length);
            updateProgress(totalProgress, `${stepName} tests completed`);
            
            currentStepIndex++;
            
            // Move to next step after a brief pause
            setTimeout(executeStep, 500);
        }, duration);
    }
    
    executeStep();
}

// Update step status
function updateStepStatus(stepName, status) {
    const stepElement = document.querySelector(`[data-step="${stepName}"]`);
    if (!stepElement) return;
    
    const statusIcon = stepElement.querySelector('.step-status i');
    
    // Remove existing status classes
    statusIcon.classList.remove('status-pending', 'status-running', 'status-completed', 'status-failed');
    
    switch (status) {
        case 'running':
            statusIcon.setAttribute('data-feather', 'loader');
            statusIcon.classList.add('status-running');
            stepElement.classList.add('active');
            break;
        case 'completed':
            statusIcon.setAttribute('data-feather', 'check-circle');
            statusIcon.classList.add('status-completed');
            stepElement.classList.remove('active');
            stepElement.classList.add('completed');
            break;
        case 'failed':
            statusIcon.setAttribute('data-feather', 'x-circle');
            statusIcon.classList.add('status-failed');
            stepElement.classList.remove('active');
            stepElement.classList.add('failed');
            break;
        default:
            statusIcon.setAttribute('data-feather', 'clock');
            statusIcon.classList.add('status-pending');
    }
    
    feather.replace();
}

// Update progress
function updateProgress(percentage, status) {
    const progressFill = document.getElementById('overall-progress');
    const progressPercentage = document.getElementById('progress-percentage');
    const progressStatus = document.getElementById('progress-status');
    
    if (progressFill) {
        progressFill.style.width = `${Math.min(percentage, 100)}%`;
    }
    
    if (progressPercentage) {
        progressPercentage.textContent = `${Math.round(percentage)}%`;
    }
    
    if (progressStatus) {
        progressStatus.textContent = status;
    }
}

// Complete test execution
function completeTest() {
    // Generate mock results
    const mockScore = Math.floor(Math.random() * 20) + 80; // 80-100%
    const endTime = new Date().toISOString();
    const startTime = new Date(currentTest.startTime);
    const duration = Math.round((new Date(endTime) - startTime) / 1000); // seconds
    
    // Update test record
    currentTest.status = 'completed';
    currentTest.endTime = endTime;
    currentTest.duration = duration;
    currentTest.score = mockScore;
    currentTest.results = {
        fairness: { score: Math.floor(Math.random() * 15) + 85, issues: Math.floor(Math.random() * 3) },
        explainability: { score: Math.floor(Math.random() * 20) + 75, issues: Math.floor(Math.random() * 2) },
        performance: { score: Math.floor(Math.random() * 10) + 90, issues: Math.floor(Math.random() * 2) },
        robustness: { score: Math.floor(Math.random() * 25) + 70, issues: Math.floor(Math.random() * 4) }
    };
    
    // Update test history
    saveTestHistory();
    
    // Update progress
    updateProgress(100, 'Test completed successfully!');
    
    // Show completion actions
    document.getElementById('cancel-test-btn').style.display = 'none';
    document.getElementById('view-logs-btn').style.display = 'inline-flex';
    
    showToast('AI tests completed successfully!', 'success');
    
    // Show results modal after brief delay
    setTimeout(() => {
        showTestResults(currentTest);
    }, 2000);
}

// Cancel test execution
function cancelTest() {
    if (confirm('Are you sure you want to cancel the test execution?')) {
        currentTest.status = 'cancelled';
        currentTest.endTime = new Date().toISOString();
        
        saveTestHistory();
        
        // Reset UI
        document.querySelector('.test-setup-card').style.display = 'block';
        document.getElementById('test-progress-card').style.display = 'none';
        
        showToast('Test execution cancelled', 'info');
    }
}

// Show test results
function showTestResults(test) {
    // In a real app, this would show a detailed results modal
    alert(`Test completed with overall score: ${test.score}%\n\nRedirecting to reports page...`);
    
    // Navigate to reports page with this test's results
    window.location.href = `reports.html?testId=${test.id}`;
}

// View test logs
function viewLogs() {
    // In a real app, this would show detailed execution logs
    alert('Test execution logs would be displayed here.\n\nThis feature would show detailed information about each test step, timing, and any issues encountered.');
}

// Show test history
function showTestHistory() {
    populateHistoryModal();
    const modal = document.getElementById('test-history-modal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

// Close test history modal
function closeTestHistoryModal() {
    const modal = document.getElementById('test-history-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Populate history modal
function populateHistoryModal() {
    // Populate use case filter
    const useCaseFilter = document.getElementById('history-use-case');
    if (useCaseFilter) {
        useCaseFilter.innerHTML = '<option value="">All Use Cases</option>';
        useCases.forEach(useCase => {
            const option = document.createElement('option');
            option.value = useCase.id;
            option.textContent = useCase.name;
            useCaseFilter.appendChild(option);
        });
    }
    
    // Populate history table
    renderHistoryTable();
}

// Render history table
function renderHistoryTable() {
    const tbody = document.getElementById('history-table-body');
    if (!tbody) return;
    
    const useCaseFilter = document.getElementById('history-use-case')?.value;
    const statusFilter = document.getElementById('history-status')?.value;
    
    // Filter history
    let filteredHistory = testHistory;
    if (useCaseFilter) {
        filteredHistory = filteredHistory.filter(test => test.useCaseId === useCaseFilter);
    }
    if (statusFilter) {
        filteredHistory = filteredHistory.filter(test => test.status === statusFilter);
    }
    
    if (filteredHistory.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-row">No test history found</td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = filteredHistory.map(test => `
        <tr>
            <td>${escapeHtml(test.useCaseName)}</td>
            <td>${test.testTypes.join(', ')}</td>
            <td>
                <span class="status-badge ${test.status}">${formatStatus(test.status)}</span>
            </td>
            <td>${test.score ? `${test.score}%` : '-'}</td>
            <td>${test.duration ? formatDuration(test.duration) : '-'}</td>
            <td>${formatDateTime(test.startTime)}</td>
            <td>
                <button class="btn-icon" onclick="viewTestReport('${test.id}')" title="View Report">
                    <i data-feather="eye"></i>
                </button>
                ${test.status === 'completed' ? `
                    <button class="btn-icon" onclick="downloadReport('${test.id}')" title="Download">
                        <i data-feather="download"></i>
                    </button>
                ` : ''}
            </td>
        </tr>
    `).join('');
    
    feather.replace();
}

// View test report
function viewTestReport(testId) {
    window.location.href = `reports.html?testId=${testId}`;
}

// Download test report
function downloadReport(testId) {
    const test = testHistory.find(t => t.id === testId);
    if (!test) {
        showToast('Test not found', 'error');
        return;
    }
    
    // In a real app, this would download the actual report file
    showToast('Download would start here', 'info');
}

// Toggle advanced options
function toggleAdvancedOptions() {
    const advancedOptions = document.getElementById('advanced-options');
    const toggleIcon = document.getElementById('advanced-toggle-icon');
    
    if (advancedOptions && toggleIcon) {
        const isHidden = advancedOptions.style.display === 'none';
        
        advancedOptions.style.display = isHidden ? 'block' : 'none';
        toggleIcon.setAttribute('data-feather', isHidden ? 'chevron-up' : 'chevron-down');
        
        feather.replace();
    }
}

// Reset form
function resetForm() {
    if (confirm('Are you sure you want to reset the form? All entered data will be lost.')) {
        // Reset form fields
        document.getElementById('test-execution-form').reset();
        
        // Clear uploaded files
        uploadedFiles = {};
        
        // Reset file upload areas
        document.querySelectorAll('.upload-area').forEach(area => {
            const placeholder = area.querySelector('.upload-placeholder');
            const success = area.querySelector('.upload-success');
            
            if (placeholder && success) {
                placeholder.style.display = 'block';
                success.style.display = 'none';
            }
        });
        
        // Hide use case details
        hideUseCaseDetails();
        
        // Re-validate form
        validateForm();
        
        showToast('Form reset successfully', 'success');
    }
}

// Save configuration
function saveConfiguration() {
    if (!validateForm()) {
        showToast('Please complete the form before saving', 'error');
        return;
    }
    
    const config = collectFormData();
    
    // Save to localStorage
    const savedConfigs = JSON.parse(localStorage.getItem('auditing-test-configs') || '[]');
    const configName = prompt('Enter a name for this configuration:');
    
    if (configName) {
        const newConfig = {
            id: generateId(),
            name: configName.trim(),
            config: config,
            savedDate: new Date().toISOString()
        };
        
        savedConfigs.push(newConfig);
        localStorage.setItem('auditing-test-configs', JSON.stringify(savedConfigs));
        
        showToast('Configuration saved successfully', 'success');
    }
}

// Save test history
function saveTestHistory() {
    try {
        localStorage.setItem('auditing-test-history', JSON.stringify(testHistory));
    } catch (error) {
        console.error('Error saving test history:', error);
    }
}

// Utility functions
function generateId() {
    return 'test_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatRiskCategory(risk) {
    const riskMap = {
        'low': 'Low Risk',
        'medium': 'Medium Risk', 
        'high': 'High Risk'
    };
    return riskMap[risk] || risk;
}

function formatModelType(type) {
    const typeMap = {
        'classification': 'Classification',
        'regression': 'Regression',
        'rag': 'RAG',
        'summarization': 'Summarization'
    };
    return typeMap[type] || type;
}

function formatStatus(status) {
    const statusMap = {
        'running': 'Running',
        'completed': 'Completed',
        'failed': 'Failed',
        'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
}

function formatDuration(seconds) {
    if (seconds < 60) {
        return `${seconds}s`;
    } else if (seconds < 3600) {
        return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    } else {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    }
}

function formatDateTime(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return 'Unknown';
    }
}

function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i data-feather="${type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'info'}"></i>
            <span>${escapeHtml(message)}</span>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i data-feather="x"></i>
        </button>
    `;

    // Add to page
    document.body.appendChild(toast);
    feather.replace();

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 5000);
}

// Setup filter event listeners for history modal
document.addEventListener('DOMContentLoaded', function() {
    const historyUseCaseFilter = document.getElementById('history-use-case');
    const historyStatusFilter = document.getElementById('history-status');
    
    if (historyUseCaseFilter) {
        historyUseCaseFilter.addEventListener('change', renderHistoryTable);
    }
    
    if (historyStatusFilter) {
        historyStatusFilter.addEventListener('change', renderHistoryTable);
    }
});

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal-overlay')) {
        closeTestHistoryModal();
    }
});

// Close modal on escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeTestHistoryModal();
    }
});