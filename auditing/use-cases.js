// Use Cases Management System

// Global variables
let useCases = [];

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    loadUseCases();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Form validation
    const form = document.getElementById('create-use-case-form');
    if (form) {
        form.addEventListener('input', validateForm);
    }
}

// Load use cases from localStorage
function loadUseCases() {
    const stored = localStorage.getItem('auditing-use-cases');
    if (stored) {
        try {
            useCases = JSON.parse(stored);
            renderUseCases();
        } catch (error) {
            console.error('Error loading use cases:', error);
            useCases = [];
        }
    }
}

// Save use cases to localStorage
function saveUseCases() {
    try {
        localStorage.setItem('auditing-use-cases', JSON.stringify(useCases));
    } catch (error) {
        console.error('Error saving use cases:', error);
        showToast('Error saving use case', 'error');
    }
}

// Render use cases grid
function renderUseCases() {
    const grid = document.querySelector('.use-cases-grid');
    if (!grid) return;

    if (useCases.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i data-feather="folder-plus"></i>
                </div>
                <h3>No Use Cases Yet</h3>
                <p>Create your first use case to start testing your AI models for responsible AI compliance.</p>
                <button class="btn-primary" onclick="createNewUseCase()">
                    <i data-feather="plus"></i>
                    Create Use Case
                </button>
            </div>
        `;
        feather.replace();
        return;
    }

    grid.innerHTML = useCases.map(useCase => `
        <div class="use-case-card" data-id="${useCase.id}">
            <div class="use-case-header">
                <div class="use-case-info">
                    <h3>${escapeHtml(useCase.name)}</h3>
                    <div class="use-case-meta">
                        <span class="risk-badge ${useCase.riskCategory}">${formatRiskCategory(useCase.riskCategory)}</span>
                        <span class="model-type">${formatModelType(useCase.modelType)}</span>
                        <span class="created-date">Created: ${formatDate(useCase.createdDate)}</span>
                    </div>
                </div>
                <div class="use-case-actions">
                    <button class="btn-icon" onclick="editUseCase('${useCase.id}')" title="Edit">
                        <i data-feather="edit-2"></i>
                    </button>
                    <button class="btn-icon" onclick="duplicateUseCase('${useCase.id}')" title="Duplicate">
                        <i data-feather="copy"></i>
                    </button>
                    <button class="btn-icon danger" onclick="deleteUseCase('${useCase.id}')" title="Delete">
                        <i data-feather="trash-2"></i>
                    </button>
                </div>
            </div>
            <p class="use-case-description">${escapeHtml(useCase.description)}</p>
            <div class="use-case-stats">
                <div class="stat-item">
                    <span class="stat-value">${useCase.testsRun || 0}</span>
                    <span class="stat-label">Tests Run</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${useCase.avgScore || 'N/A'}</span>
                    <span class="stat-label">Avg Score</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${useCase.lastTest || 'Never'}</span>
                    <span class="stat-label">Last Test</span>
                </div>
            </div>
            <div class="use-case-footer">
                <button class="btn-primary" onclick="runTest('${useCase.id}')">Run Test</button>
                <button class="btn-secondary" onclick="viewReports('${useCase.id}')">View Reports</button>
            </div>
        </div>
    `).join('');

    feather.replace();
}

// Create new use case
function createNewUseCase() {
    const modal = document.getElementById('create-use-case-modal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Reset form
        const form = document.getElementById('create-use-case-form');
        if (form) {
            form.reset();
        }
    }
}

// Close create use case modal
function closeCreateUseCaseModal() {
    const modal = document.getElementById('create-use-case-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Validate form
function validateForm() {
    const name = document.getElementById('use-case-name')?.value.trim();
    const riskCategory = document.getElementById('risk-category')?.value;
    const modelType = document.getElementById('model-type')?.value;
    const description = document.getElementById('use-case-description')?.value.trim();
    
    const isValid = name && riskCategory && modelType && description;
    
    const submitBtn = document.querySelector('#create-use-case-modal .btn-primary');
    if (submitBtn) {
        submitBtn.disabled = !isValid;
    }
    
    return isValid;
}

// Save use case
function saveUseCase() {
    if (!validateForm()) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    const name = document.getElementById('use-case-name').value.trim();
    const riskCategory = document.getElementById('risk-category').value;
    const modelType = document.getElementById('model-type').value;
    const description = document.getElementById('use-case-description').value.trim();
    
    // Get selected testing focus areas
    const focusAreas = [];
    document.querySelectorAll('#create-use-case-modal input[type="checkbox"]:checked').forEach(checkbox => {
        focusAreas.push(checkbox.value);
    });

    // Check if name already exists
    if (useCases.some(uc => uc.name.toLowerCase() === name.toLowerCase())) {
        showToast('A use case with this name already exists', 'error');
        return;
    }

    // Create new use case
    const newUseCase = {
        id: generateId(),
        name: name,
        riskCategory: riskCategory,
        modelType: modelType,
        description: description,
        focusAreas: focusAreas,
        createdDate: new Date().toISOString(),
        testsRun: 0,
        avgScore: null,
        lastTest: null
    };

    useCases.push(newUseCase);
    saveUseCases();
    renderUseCases();
    closeCreateUseCaseModal();
    
    showToast('Use case created successfully', 'success');
}

// Edit use case
function editUseCase(useCaseId) {
    const useCase = useCases.find(uc => uc.id === useCaseId);
    if (!useCase) {
        showToast('Use case not found', 'error');
        return;
    }

    // Pre-fill form with existing data
    document.getElementById('use-case-name').value = useCase.name;
    document.getElementById('risk-category').value = useCase.riskCategory;
    document.getElementById('model-type').value = useCase.modelType;
    document.getElementById('use-case-description').value = useCase.description;
    
    // Check focus areas
    document.querySelectorAll('#create-use-case-modal input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = useCase.focusAreas && useCase.focusAreas.includes(checkbox.value);
    });

    // Change modal title and button text
    document.querySelector('#create-use-case-modal .modal-header h3').textContent = 'Edit Use Case';
    document.querySelector('#create-use-case-modal .btn-primary').textContent = 'Update Use Case';
    document.querySelector('#create-use-case-modal .btn-primary').onclick = () => updateUseCase(useCaseId);

    const modal = document.getElementById('create-use-case-modal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Update use case
function updateUseCase(useCaseId) {
    if (!validateForm()) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    const name = document.getElementById('use-case-name').value.trim();
    const riskCategory = document.getElementById('risk-category').value;
    const modelType = document.getElementById('model-type').value;
    const description = document.getElementById('use-case-description').value.trim();
    
    // Get selected testing focus areas
    const focusAreas = [];
    document.querySelectorAll('#create-use-case-modal input[type="checkbox"]:checked').forEach(checkbox => {
        focusAreas.push(checkbox.value);
    });

    // Check if name already exists (excluding current use case)
    if (useCases.some(uc => uc.id !== useCaseId && uc.name.toLowerCase() === name.toLowerCase())) {
        showToast('A use case with this name already exists', 'error');
        return;
    }

    // Update use case
    const useCaseIndex = useCases.findIndex(uc => uc.id === useCaseId);
    if (useCaseIndex === -1) {
        showToast('Use case not found', 'error');
        return;
    }

    useCases[useCaseIndex] = {
        ...useCases[useCaseIndex],
        name: name,
        riskCategory: riskCategory,
        modelType: modelType,
        description: description,
        focusAreas: focusAreas,
        updatedDate: new Date().toISOString()
    };

    saveUseCases();
    renderUseCases();
    closeCreateUseCaseModal();
    
    // Reset modal
    document.querySelector('#create-use-case-modal .modal-header h3').textContent = 'Create New Use Case';
    document.querySelector('#create-use-case-modal .btn-primary').textContent = 'Create Use Case';
    document.querySelector('#create-use-case-modal .btn-primary').onclick = saveUseCase;
    
    showToast('Use case updated successfully', 'success');
}

// Duplicate use case
function duplicateUseCase(useCaseId) {
    const useCase = useCases.find(uc => uc.id === useCaseId);
    if (!useCase) {
        showToast('Use case not found', 'error');
        return;
    }

    // Create duplicate with unique name
    let duplicateName = `${useCase.name} (Copy)`;
    let counter = 1;
    
    while (useCases.some(uc => uc.name.toLowerCase() === duplicateName.toLowerCase())) {
        counter++;
        duplicateName = `${useCase.name} (Copy ${counter})`;
    }

    const duplicateUseCase = {
        ...useCase,
        id: generateId(),
        name: duplicateName,
        createdDate: new Date().toISOString(),
        testsRun: 0,
        avgScore: null,
        lastTest: null,
        updatedDate: null
    };

    useCases.push(duplicateUseCase);
    saveUseCases();
    renderUseCases();
    
    showToast('Use case duplicated successfully', 'success');
}

// Delete use case
function deleteUseCase(useCaseId) {
    const useCase = useCases.find(uc => uc.id === useCaseId);
    if (!useCase) {
        showToast('Use case not found', 'error');
        return;
    }

    if (confirm(`Are you sure you want to delete "${useCase.name}"? This action cannot be undone.`)) {
        useCases = useCases.filter(uc => uc.id !== useCaseId);
        saveUseCases();
        renderUseCases();
        showToast('Use case deleted successfully', 'success');
    }
}

// Run test for use case
function runTest(useCaseId) {
    const useCase = useCases.find(uc => uc.id === useCaseId);
    if (!useCase) {
        showToast('Use case not found', 'error');
        return;
    }

    // Navigate to tests page with use case pre-selected
    window.location.href = `tests.html?useCase=${encodeURIComponent(useCaseId)}`;
}

// View reports for use case
function viewReports(useCaseId) {
    const useCase = useCases.find(uc => uc.id === useCaseId);
    if (!useCase) {
        showToast('Use case not found', 'error');
        return;
    }

    // Navigate to reports page with use case filter
    window.location.href = `reports.html?useCase=${encodeURIComponent(useCaseId)}`;
}

// Utility functions
function generateId() {
    return 'uc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
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

function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
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

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal-overlay')) {
        closeCreateUseCaseModal();
    }
});

// Close modal on escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeCreateUseCaseModal();
    }
});