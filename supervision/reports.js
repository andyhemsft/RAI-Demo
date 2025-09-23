// Audit Reports Page JavaScript

class ReportsManager {
    constructor() {
        this.financeInstitutionSelect = document.getElementById('finance-institutions');
        this.modelSelect = document.getElementById('model-selection');
        this.confirmBtn = document.getElementById('confirm-btn');
        this.resetBtn = document.getElementById('reset-btn');
        
        this.defaultValues = {
            financeInstitution: 'bank-a',
            model: 'credit-scoring-v1'
        };
        
        this.charts = {};
        
        this.initializeEventListeners();
        this.loadSavedFilters();
        this.initializeMetricsTabs();
        this.initializeCharts();
    }
    
    initializeEventListeners() {
        // Confirm button functionality
        this.confirmBtn.addEventListener('click', () => {
            this.applyFilters();
        });
        
        // Reset button functionality
        this.resetBtn.addEventListener('click', () => {
            this.resetFilters();
        });
        
        // Auto-save filter changes
        this.financeInstitutionSelect.addEventListener('change', () => {
            this.saveFilters();
        });
        
        this.modelSelect.addEventListener('change', () => {
            this.saveFilters();
        });
        
        // Report generation buttons
        this.initializeReportButtons();
    }
    
    initializeReportButtons() {
        const reportButtons = document.querySelectorAll('.section-card .btn-primary');
        reportButtons.forEach((btn, index) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const reportType = this.getReportType(index);
                this.generateReport(reportType);
            });
        });
    }
    
    getReportType(index) {
        const reportTypes = [
            'performance',
            'compliance', 
            'risk-assessment'
        ];
        return reportTypes[index] || 'performance';
    }
    
    applyFilters() {
        const filters = this.getCurrentFilters();
        
        // Show loading state
        this.showLoadingState();
        
        // Simulate API call to apply filters
        setTimeout(() => {
            this.hideLoadingState();
            this.showSuccessMessage('Filters applied successfully');
            console.log('Applied filters:', filters);
            
            // Refresh all charts with new data based on selected filters
            this.refreshAllChartsWithNewData(filters);
        }, 1500);
    }
    
    refreshAllChartsWithNewData(filters) {
        // Update chart data based on selected institution and model
        const institution = filters.financeInstitution;
        const model = filters.model;
        
        // Refresh each chart with new data
        this.updateFeatureAttributionChart(institution, model);
        this.updateBiasChart(institution, model);
        this.updateRobustnessChart(institution, model);
        this.updateCounterfactualChart(institution, model);
        
        console.log(`Charts updated for ${institution} - ${model}`);
    }
    
    resetFilters() {
        // Reset to default values
        this.financeInstitutionSelect.value = this.defaultValues.financeInstitution;
        this.modelSelect.value = this.defaultValues.model;
        
        // Clear saved filters
        localStorage.removeItem('reportFilters');
        
        this.showSuccessMessage('Filters reset to default');
    }
    
    getCurrentFilters() {
        return {
            financeInstitution: this.financeInstitutionSelect.value,
            model: this.modelSelect.value,
            timestamp: new Date().toISOString()
        };
    }
    
    saveFilters() {
        const filters = this.getCurrentFilters();
        localStorage.setItem('reportFilters', JSON.stringify(filters));
    }
    
    loadSavedFilters() {
        try {
            const savedFilters = localStorage.getItem('reportFilters');
            if (savedFilters) {
                const filters = JSON.parse(savedFilters);
                this.financeInstitutionSelect.value = filters.financeInstitution || this.defaultValues.financeInstitution;
                this.modelSelect.value = filters.model || this.defaultValues.model;
            }
        } catch (error) {
            console.warn('Failed to load saved filters:', error);
        }
    }
    
    generateReport(reportType) {
        const filters = this.getCurrentFilters();
        
        // Show loading state
        this.showLoadingState();
        
        // Simulate report generation
        setTimeout(() => {
            this.hideLoadingState();
            this.downloadReport(reportType, filters);
        }, 2000);
    }
    
    downloadReport(reportType, filters) {
        // Simulate report download
        const reportData = {
            type: reportType,
            filters: filters,
            generatedAt: new Date().toISOString(),
            data: this.getMockReportData(reportType)
        };
        
        // Create and download a mock JSON file
        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}-report-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showSuccessMessage(`${this.formatReportType(reportType)} report downloaded successfully`);
    }
    
    getMockReportData(reportType) {
        const baseData = {
            institution: this.financeInstitutionSelect.options[this.financeInstitutionSelect.selectedIndex].text,
            model: this.modelSelect.options[this.modelSelect.selectedIndex].text
        };
        
        switch (reportType) {
            case 'performance':
                return {
                    ...baseData,
                    accuracy: 0.94,
                    precision: 0.91,
                    recall: 0.89,
                    f1Score: 0.90
                };
            case 'compliance':
                return {
                    ...baseData,
                    complianceScore: 0.97,
                    violations: 3,
                    criticalIssues: 0
                };
            case 'risk-assessment':
                return {
                    ...baseData,
                    riskLevel: 'Medium',
                    riskScore: 0.65,
                    recommendations: 5
                };
            default:
                return baseData;
        }
    }
    
    formatReportType(reportType) {
        const formatted = reportType.replace(/-/g, ' ');
        return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }
    
    showLoadingState() {
        // Add loading class to confirm button
        this.confirmBtn.disabled = true;
        this.confirmBtn.innerHTML = '<i data-feather="loader"></i> Loading...';
        
        // Update report buttons
        const reportButtons = document.querySelectorAll('.section-card .btn-primary');
        reportButtons.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.6';
        });
        
        // Refresh feather icons
        feather.replace();
    }
    
    hideLoadingState() {
        // Reset confirm button
        this.confirmBtn.disabled = false;
        this.confirmBtn.innerHTML = '<i data-feather="check"></i> Confirm';
        
        // Reset report buttons
        const reportButtons = document.querySelectorAll('.section-card .btn-primary');
        reportButtons.forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
        });
        
        // Refresh feather icons
        feather.replace();
    }
    
    showSuccessMessage(message) {
        // Create success notification
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.innerHTML = `
            <i data-feather="check-circle"></i>
            <span>${message}</span>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        feather.replace();
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // Metrics Tab Functionality
    initializeMetricsTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabPanels = document.querySelectorAll('.tab-panel');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');
                
                // Remove active class from all buttons and panels
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanels.forEach(panel => panel.classList.remove('active'));
                
                // Add active class to clicked button and corresponding panel
                button.classList.add('active');
                document.getElementById(targetTab).classList.add('active');
                
                // Refresh chart if it exists
                this.refreshChart(targetTab);
            });
        });
    }
    
    // Chart Initialization
    initializeCharts() {
        // Initialize all charts when the page loads
        this.createFeatureAttributionChart();
        // Note: Bias tab now uses matrix table instead of chart
        this.createRobustnessCharts();
        this.createCounterfactualTornadoChart();
    }
    
    refreshChart(tabId) {
        // Refresh the chart for the active tab
        setTimeout(() => {
            if (this.charts[tabId]) {
                this.charts[tabId].update();
            }
        }, 100);
    }
    
    createFeatureAttributionChart() {
        const ctx = document.getElementById('shapChart');
        if (!ctx) return;
        
        this.charts['feature-attribution'] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Employment History', 'Income', 'Debt Ratio', 'Employment Years', 'Age', 'Loan Amount', 'Education', 'Previous Loans'],
                datasets: [{
                    label: 'SHAP Values',
                    data: [0.74, 0.32, -0.28, 0.15, 0.08, -0.12, 0.06, -0.04],
                    backgroundColor: function(context) {
                        const value = context.parsed.y;
                        return value >= 0 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)';
                    },
                    borderColor: function(context) {
                        const value = context.parsed.y;
                        return value >= 0 ? 'rgba(16, 185, 129, 1)' : 'rgba(239, 68, 68, 1)';
                    },
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Feature Attribution (SHAP Values)',
                        color: '#e2e8f0',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#94a3b8' },
                        title: {
                            display: true,
                            text: 'SHAP Value',
                            color: '#e2e8f0'
                        }
                    },
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { 
                            color: '#94a3b8',
                            maxRotation: 45
                        }
                    }
                }
            }
        });
    }
    
    createBiasChart() {
        const ctx = document.getElementById('biasChart');
        if (!ctx) return;
        
        this.charts['bias-fairness'] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Overall', 'Gender (M vs F)', 'Age (Young vs Old)', 'Income (Low vs High)', 'Education (Low vs High)'],
                datasets: [{
                    label: 'Fairness Ratio',
                    data: [0.87, 0.84, 0.78, 0.91, 0.89],
                    backgroundColor: function(context) {
                        const value = context.parsed.y;
                        if (value >= 0.8) return 'rgba(16, 185, 129, 0.8)';
                        if (value >= 0.7) return 'rgba(245, 158, 11, 0.8)';
                        return 'rgba(239, 68, 68, 0.8)';
                    },
                    borderColor: function(context) {
                        const value = context.parsed.y;
                        if (value >= 0.8) return 'rgba(16, 185, 129, 1)';
                        if (value >= 0.7) return 'rgba(245, 158, 11, 1)';
                        return 'rgba(239, 68, 68, 1)';
                    },
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Bias & Fairness Analysis',
                        color: '#e2e8f0',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        min: 0,
                        max: 1,
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#94a3b8' },
                        title: {
                            display: true,
                            text: 'Fairness Ratio (0.8+ = Good)',
                            color: '#e2e8f0'
                        }
                    },
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { 
                            color: '#94a3b8',
                            maxRotation: 45
                        }
                    }
                }
            }
        });
    }
    
    createRobustnessCharts() {
        this.createRobustAccuracyChart();
        this.createSegmentRobustnessChart();
        this.createReliabilityChart();
    }
    
    createRobustAccuracyChart() {
        const ctx = document.getElementById('robustAccuracyChart');
        if (!ctx) return;
        
        this.charts['robust-accuracy'] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['0.0', '0.01', '0.02', '0.03', '0.04', '0.05', '0.06'],
                datasets: [{
                    label: 'Credit Scoring v1',
                    data: [94.2, 91.5, 87.8, 82.1, 75.6, 67.3, 58.9],
                    borderColor: 'rgba(0, 212, 255, 1)',
                    backgroundColor: 'rgba(0, 212, 255, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    pointRadius: 5,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: '#e2e8f0' } }
                },
                scales: {
                    y: {
                        min: 50,
                        max: 100,
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#94a3b8' },
                        title: {
                            display: true,
                            text: 'Accuracy (%)',
                            color: '#e2e8f0'
                        }
                    },
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#94a3b8' },
                        title: {
                            display: true,
                            text: 'Epsilon (ε)',
                            color: '#e2e8f0'
                        }
                    }
                }
            }
        });
    }
    
    createSegmentRobustnessChart() {
        const ctx = document.getElementById('segmentRobustnessChart');
        if (!ctx) return;
        
        this.charts['segment-robustness'] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Low Risk', 'Medium Risk', 'High Risk'],
                datasets: [{
                    label: 'Clean Accuracy',
                    data: [96.2, 93.8, 89.1],
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 2
                }, {
                    label: 'Robust Accuracy (ε=0.05)',
                    data: [82.4, 76.9, 61.3],
                    backgroundColor: 'rgba(239, 68, 68, 0.8)',
                    borderColor: 'rgba(239, 68, 68, 1)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: '#e2e8f0' } }
                },
                scales: {
                    y: {
                        min: 0,
                        max: 100,
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#94a3b8' },
                        title: {
                            display: true,
                            text: 'Accuracy (%)',
                            color: '#e2e8f0'
                        }
                    },
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#94a3b8' }
                    }
                }
            }
        });
    }
    
    createReliabilityChart() {
        const ctx = document.getElementById('reliabilityChart');
        if (!ctx) return;
        
        // Generate calibration data to show overconfidence on adversarial inputs
        const perfectCalibration = [];
        const cleanCalibration = [];
        const adversarialCalibration = [];
        
        for (let i = 0; i <= 10; i++) {
            const confidence = i / 10;
            perfectCalibration.push({x: confidence, y: confidence});
            
            // Clean predictions: well-calibrated with minor deviations
            cleanCalibration.push({
                x: confidence, 
                y: Math.max(0, Math.min(1, confidence - 0.02 + Math.random() * 0.04))
            });
            
            // Adversarial predictions: model becomes overconfident
            let actualAccuracy;
            if (confidence < 0.3) {
                actualAccuracy = confidence - 0.05 + Math.random() * 0.1;
            } else if (confidence < 0.7) {
                actualAccuracy = confidence - 0.15 - (confidence - 0.3) * 0.2;
            } else {
                actualAccuracy = confidence - 0.25 - (confidence - 0.7) * 0.4;
            }
            
            adversarialCalibration.push({
                x: confidence, 
                y: Math.max(0, Math.min(1, actualAccuracy))
            });
        }
        
        // Debug: Log the data to see if it's correct
        console.log('Perfect calibration data:', perfectCalibration);
        console.log('Clean calibration data:', cleanCalibration);
        console.log('Adversarial calibration data:', adversarialCalibration);
        
        this.charts['reliability'] = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Perfect Calibration',
                    data: perfectCalibration,
                    borderColor: 'rgba(75, 85, 99, 1)',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    borderDash: [8, 4],
                    pointRadius: 0,
                    tension: 0
                }, {
                    label: 'Clean Samples',
                    data: cleanCalibration,
                    borderColor: 'rgba(16, 185, 129, 1)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 3,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    tension: 0.3,
                    fill: false
                }, {
                    label: 'Adversarial Samples (Overconfident)',
                    data: adversarialCalibration,
                    borderColor: 'rgba(239, 68, 68, 1)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 3,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    tension: 0.3,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Model Overconfidence on Adversarial Inputs',
                        color: '#e2e8f0',
                        font: { size: 14, weight: 'normal' }
                    },
                    legend: { 
                        labels: { 
                            color: '#e2e8f0',
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        mode: 'point',
                        intersect: false,
                        callbacks: {
                            title: function(tooltipItems) {
                                console.log('Tooltip items:', tooltipItems);
                                if (tooltipItems && tooltipItems.length > 0) {
                                    const item = tooltipItems[0];
                                    console.log('First tooltip item:', item);
                                    console.log('Raw data:', item.raw);
                                    console.log('Parsed data:', item.parsed);
                                    
                                    // Try different ways to access the x value
                                    let xValue = null;
                                    if (item.parsed && typeof item.parsed.x !== 'undefined') {
                                        xValue = item.parsed.x;
                                    } else if (item.raw && typeof item.raw.x !== 'undefined') {
                                        xValue = item.raw.x;
                                    } else if (item.datasetIndex !== undefined && item.dataIndex !== undefined) {
                                        const dataset = tooltipItems[0].chart.data.datasets[item.datasetIndex];
                                        const dataPoint = dataset.data[item.dataIndex];
                                        xValue = dataPoint.x;
                                    }
                                    
                                    console.log('X value:', xValue);
                                    if (xValue !== null) {
                                        const confidence = (xValue * 100).toFixed(0);
                                        return `Predicted Confidence: ${confidence}%`;
                                    }
                                }
                                return 'Predicted Confidence: N/A';
                            },
                            label: function(context) {
                                console.log('Label context:', context);
                                const yValue = context.parsed?.y || context.raw?.y || 0;
                                const actualAccuracy = (yValue * 100).toFixed(1);
                                return `${context.dataset.label}: ${actualAccuracy}% actual accuracy`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        min: 0,
                        max: 1,
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { 
                            color: '#94a3b8',
                            callback: function(value) {
                                return `${(value * 100).toFixed(0)}%`;
                            }
                        },
                        title: {
                            display: true,
                            text: 'Actual Accuracy',
                            color: '#e2e8f0'
                        }
                    },
                    x: {
                        type: 'linear',
                        min: 0,
                        max: 1,
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { 
                            color: '#94a3b8',
                            callback: function(value) {
                                return `${(value * 100).toFixed(0)}%`;
                            }
                        },
                        title: {
                            display: true,
                            text: 'Predicted Confidence',
                            color: '#e2e8f0'
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'point'
                }
            }
        });
    }
    
    createCounterfactualTornadoChart() {
        const ctx = document.getElementById('counterfactualTornadoChart');
        if (!ctx) return;
        
        // Generate counterfactual effort data (minimal movement needed to flip decision)
        const effortData = this.generateCounterfactualEffortData();
        
        this.charts['counterfactual'] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: effortData.features,
                datasets: [{
                    label: 'Min. Change Required (Business Units)',
                    data: effortData.effort,
                    backgroundColor: effortData.effort.map(value => 
                        value <= 0.2 ? 'rgba(16, 185, 129, 0.8)' :  // Green for easy changes
                        value <= 0.5 ? 'rgba(245, 158, 11, 0.8)' :  // Yellow for moderate changes
                        'rgba(239, 68, 68, 0.8)'                    // Red for difficult changes
                    ),
                    borderColor: effortData.effort.map(value => 
                        value <= 0.2 ? 'rgba(16, 185, 129, 1)' :
                        value <= 0.5 ? 'rgba(245, 158, 11, 1)' :
                        'rgba(239, 68, 68, 1)'
                    ),
                    borderWidth: 2
                }, {
                    label: 'Feasibility Cost (0-1 scale)',
                    data: effortData.cost,
                    type: 'line',
                    yAxisID: 'y',
                    xAxisID: 'x1',
                    borderColor: 'rgba(0, 212, 255, 1)',
                    backgroundColor: 'rgba(0, 212, 255, 0.2)',
                    borderWidth: 3,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    fill: false,
                    tension: 0.4
                }]
            },
            options: {
                indexAxis: 'y', // This makes it horizontal (Tornado style)
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Counterfactual Effort by Feature (Tornado Chart)',
                        color: '#e2e8f0',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        labels: { 
                            color: '#e2e8f0',
                            padding: 20
                        },
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                if (context.datasetIndex === 0) {
                                    return `Min. Change: ${context.parsed.x.toFixed(3)} units`;
                                } else {
                                    return `Feasibility Cost: ${context.parsed.x.toFixed(2)}`;
                                }
                            },
                            afterLabel: function(context) {
                                if (context.datasetIndex === 1) {
                                    const cost = context.parsed.x;
                                    if (cost <= 0.3) return '(Low cost/High feasibility)';
                                    if (cost <= 0.7) return '(Moderate cost/feasibility)';
                                    return '(High cost/Low feasibility)';
                                }
                                return '';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        display: true,
                        position: 'bottom',
                        title: {
                            display: true,
                            text: 'Minimal Change Required (Business Units)',
                            color: '#e2e8f0'
                        },
                        ticks: { color: '#e2e8f0' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    x1: {
                        type: 'linear',
                        display: true,
                        position: 'top',
                        min: 0,
                        max: 1,
                        title: {
                            display: true,
                            text: 'Feasibility Cost (0-1 scale)',
                            color: 'rgba(0, 212, 255, 1)'
                        },
                        ticks: { 
                            color: 'rgba(0, 212, 255, 1)',
                            callback: function(value) {
                                return value.toFixed(1);
                            }
                        },
                        grid: { 
                            color: 'rgba(0, 212, 255, 0.2)',
                            drawOnChartArea: true,
                            lineWidth: 1
                        }
                    },
                    y: {
                        ticks: { color: '#e2e8f0' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
    }
    
    
    // Chart Update Methods for Filter Changes
    updateFeatureAttributionChart(institution, model) {
        if (!this.charts['feature-attribution']) return;
        
        // Generate different SHAP values based on institution and model
        const shapData = this.generateShapData(institution, model);
        
        this.charts['feature-attribution'].data.datasets[0].data = shapData.values;
        this.charts['feature-attribution'].update();
        
        // Update the SHAP table values
        this.updateShapTable(shapData.details);
    }
    
    updateBiasChart(institution, model) {
        // Update bias matrix instead of chart
        this.updateBiasMatrix(institution, model);
    }
    
    updateBiasMatrix(institution, model) {
        const biasData = this.generateBiasMatrixData(institution, model);
        const biasCells = document.querySelectorAll('.bias-cell');
        
        // Update each cell with new values
        biasCells.forEach((cell, index) => {
            const row = Math.floor(index / 5); // 5 metrics per row
            const col = index % 5;
            
            if (biasData[row] && biasData[row][col] !== undefined) {
                const value = biasData[row][col];
                cell.textContent = value.toFixed(2);
                cell.setAttribute('data-value', value);
                
                // Update cell styling based on value
                cell.classList.remove('good', 'warning', 'danger');
                if (value >= 0.8) {
                    cell.classList.add('good');
                } else if (value >= 0.7) {
                    cell.classList.add('warning');
                } else {
                    cell.classList.add('danger');
                }
            }
        });
        
        // Update summary statistics
        this.updateBiasSummary(biasData);
    }
    
    updateRobustnessChart(institution, model) {
        // Update all robustness charts with new data
        this.updateRobustAccuracyData(institution, model);
        this.updateSegmentRobustnessData(institution, model);
        this.updateConfusionMatrixData(institution, model);
        this.updateReliabilityData(institution, model);
    }
    
    updateRobustAccuracyData(institution, model) {
        if (!this.charts['robust-accuracy']) return;
        
        const robustnessData = this.generateRobustnessData(institution, model);
        
        // Get model-specific data and styling
        const modelConfig = this.getModelConfig(model);
        
        // Update the single dataset to show only the selected model
        this.charts['robust-accuracy'].data.datasets[0].label = modelConfig.label;
        this.charts['robust-accuracy'].data.datasets[0].data = modelConfig.data;
        this.charts['robust-accuracy'].data.datasets[0].borderColor = modelConfig.borderColor;
        this.charts['robust-accuracy'].data.datasets[0].backgroundColor = modelConfig.backgroundColor;
        
        this.charts['robust-accuracy'].update();
    }
    
    getModelConfig(model) {
        const configs = {
            'credit-scoring-v1': {
                label: 'Credit Scoring v1',
                data: [94.2, 91.5, 87.8, 82.1, 75.6, 67.3, 58.9],
                borderColor: 'rgba(0, 212, 255, 1)',
                backgroundColor: 'rgba(0, 212, 255, 0.1)'
            },
            'credit-scoring-v2': {
                label: 'Credit Scoring v2',
                data: [93.8, 92.1, 89.4, 85.7, 80.9, 74.2, 66.8],
                borderColor: 'rgba(16, 185, 129, 1)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)'
            },
            'credit-scoring-v3': {
                label: 'Credit Scoring v3',
                data: [95.1, 93.6, 91.2, 88.4, 84.7, 79.5, 73.1],
                borderColor: 'rgba(245, 158, 11, 1)',
                backgroundColor: 'rgba(245, 158, 11, 0.1)'
            },
            'fraud-detection-v1': {
                label: 'Fraud Detection v1',
                data: [91.7, 88.2, 83.5, 77.8, 70.1, 61.9, 52.3],
                borderColor: 'rgba(239, 68, 68, 1)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)'
            },
            'risk-assessment-v1': {
                label: 'Risk Assessment v1',
                data: [89.3, 85.7, 80.9, 74.5, 66.8, 57.2, 46.1],
                borderColor: 'rgba(168, 85, 247, 1)',
                backgroundColor: 'rgba(168, 85, 247, 0.1)'
            }
        };
        
        const config = configs[model] || configs['credit-scoring-v1'];
        
        // Apply institution factor to the data
        const institutionFactor = {
            'bank-a': 1.0,
            'bank-b': 0.95,
            'bank-c': 1.02,
            'all': 1.0
        }[this.currentFilters?.financeInstitution] || 1.0;
        
        return {
            ...config,
            data: config.data.map(val => Math.max(0, val * institutionFactor))
        };
    }
    
    updateSegmentRobustnessData(institution, model) {
        if (!this.charts['segment-robustness']) return;
        
        const segmentData = this.generateSegmentRobustnessData(institution, model);
        
        this.charts['segment-robustness'].data.datasets[0].data = segmentData.clean;
        this.charts['segment-robustness'].data.datasets[1].data = segmentData.robust;
        this.charts['segment-robustness'].update();
    }
    
    updateConfusionMatrixData(institution, model) {
        // Update confusion matrix delta values
        const matrixData = this.generateConfusionMatrixData(institution, model);
        const matrixCells = document.querySelectorAll('.matrix-cell');
        
        matrixCells.forEach((cell, index) => {
            if (matrixData[index] !== undefined) {
                const value = matrixData[index];
                cell.textContent = `${value > 0 ? '+' : ''}${(value * 100).toFixed(0)}%`;
                cell.dataset.value = value;
                
                // Update styling based on value
                cell.classList.remove('delta-positive', 'delta-negative');
                if (value > 0) {
                    cell.classList.add('delta-positive');
                } else {
                    cell.classList.add('delta-negative');
                }
            }
        });
    }
    
    updateReliabilityData(institution, model) {
        if (!this.charts['reliability']) return;
        
        const reliabilityData = this.generateReliabilityData(institution, model);
        
        this.charts['reliability'].data.datasets[1].data = reliabilityData.clean;
        this.charts['reliability'].data.datasets[2].data = reliabilityData.adversarial;
        this.charts['reliability'].update();
    }
    
    updateCounterfactualChart(institution, model) {
        if (!this.charts['counterfactual']) return;
        
        // Generate new tornado chart data based on institution and model
        const effortData = this.generateCounterfactualEffortData();
        
        // Update the chart data
        this.charts['counterfactual'].data.labels = effortData.features;
        this.charts['counterfactual'].data.datasets[0].data = effortData.effort;
        this.charts['counterfactual'].data.datasets[1].data = effortData.cost;
        
        // Update bar colors based on new effort values
        this.charts['counterfactual'].data.datasets[0].backgroundColor = effortData.effort.map(value => 
            value <= 0.2 ? 'rgba(16, 185, 129, 0.8)' :  // Green for easy changes
            value <= 0.5 ? 'rgba(245, 158, 11, 0.8)' :  // Yellow for moderate changes
            'rgba(239, 68, 68, 0.8)'                    // Red for difficult changes
        );
        this.charts['counterfactual'].data.datasets[0].borderColor = effortData.effort.map(value => 
            value <= 0.2 ? 'rgba(16, 185, 129, 1)' :
            value <= 0.5 ? 'rgba(245, 158, 11, 1)' :
            'rgba(239, 68, 68, 1)'
        );
        
        // Update the x1 axis range based on cost data
        const maxCost = Math.max(...effortData.cost);
        const minCost = Math.min(...effortData.cost);
        this.charts['counterfactual'].options.scales.x1.max = Math.ceil(maxCost * 10) / 10;
        this.charts['counterfactual'].options.scales.x1.min = Math.floor(minCost * 10) / 10;
        
        this.charts['counterfactual'].update();
    }
    
    // Data Generation Methods
    generateShapData(institution, model) {
        // Different SHAP values based on institution and model
        const baseValues = [0.74, 0.32, -0.28, 0.15, 0.08, -0.12, 0.06, -0.04];
        
        // Modify values based on institution
        const institutionMultiplier = {
            'bank-a': 1.0,
            'bank-b': 0.85,
            'bank-c': 1.15,
            'all': 1.0
        }[institution] || 1.0;
        
        // Modify values based on model version
        const modelMultiplier = {
            'credit-scoring-v1': 1.0,
            'credit-scoring-v2': 1.1,
            'credit-scoring-v3': 1.2,
            'fraud-detection-v1': 0.9,
            'risk-assessment-v1': 0.95
        }[model] || 1.0;
        
        const values = baseValues.map(val => val * institutionMultiplier * modelMultiplier);
        
        return {
            values: values,
            details: [
                { name: 'Employment History', value: values[0] },
                { name: 'Annual Income', value: values[1] },
                { name: 'Debt-to-Income Ratio', value: values[2] },
                { name: 'Employment Years', value: values[3] },
                { name: 'Age', value: values[4] },
                { name: 'Requested Loan Amount', value: values[5] },
                { name: 'Education Level', value: values[6] },
                { name: 'Previous Defaults', value: values[7] }
            ]
        };
    }
    
    generateBiasData(institution, model) {
        const baseValues = [0.87, 0.84, 0.78, 0.91, 0.89];
        
        // Different bias patterns for different institutions
        const institutionAdjustment = {
            'bank-a': [0, 0, 0, 0, 0],
            'bank-b': [-0.05, -0.03, 0.02, -0.04, -0.02],
            'bank-c': [0.02, 0.01, -0.05, 0.03, 0.01],
            'all': [0, 0, 0, 0, 0]
        }[institution] || [0, 0, 0, 0, 0];
        
        return baseValues.map((val, idx) => Math.max(0.5, Math.min(1.0, val + institutionAdjustment[idx])));
    }
    
    generateBiasMatrixData(institution, model) {
        // Base fairness matrix: [groups][metrics]
        // Groups: Gender, Age, Ethnicity, Income, Education, Geographic
        // Metrics: Disparate Impact, Equal Opportunity, Demographic Parity, Equalized Odds, Calibration
        const baseMatrix = [
            [0.84, 0.87, 0.82, 0.79, 0.91], // Gender
            [0.78, 0.85, 0.76, 0.83, 0.88], // Age
            [0.89, 0.92, 0.86, 0.88, 0.94], // Ethnicity
            [0.91, 0.89, 0.93, 0.87, 0.85], // Income
            [0.86, 0.83, 0.88, 0.81, 0.90], // Education
            [0.77, 0.82, 0.74, 0.86, 0.89]  // Geographic
        ];
        
        // Institution-specific adjustments
        const institutionAdjustments = {
            'bank-a': [
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0]
            ],
            'bank-b': [
                [-0.03, -0.02, -0.04, -0.05, -0.01],
                [-0.05, -0.03, -0.06, -0.02, -0.04],
                [-0.02, -0.01, -0.03, -0.03, -0.02],
                [-0.04, -0.05, -0.02, -0.06, -0.07],
                [-0.03, -0.04, -0.02, -0.05, -0.03],
                [-0.06, -0.04, -0.08, -0.03, -0.04]
            ],
            'bank-c': [
                [0.02, 0.01, 0.03, 0.04, 0.01],
                [0.04, 0.02, 0.05, 0.03, 0.02],
                [0.01, 0.02, 0.02, 0.02, 0.01],
                [0.02, 0.03, 0.01, 0.04, 0.03],
                [0.03, 0.02, 0.02, 0.04, 0.02],
                [0.05, 0.03, 0.06, 0.02, 0.03]
            ],
            'all': [
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0]
            ]
        };
        
        // Model-specific adjustments
        const modelMultipliers = {
            'credit-scoring-v1': 1.0,
            'credit-scoring-v2': 1.05,
            'credit-scoring-v3': 1.08,
            'fraud-detection-v1': 0.95,
            'risk-assessment-v1': 0.98
        };
        
        const adjustments = institutionAdjustments[institution] || institutionAdjustments['bank-a'];
        const multiplier = modelMultipliers[model] || 1.0;
        
        return baseMatrix.map((row, groupIndex) => 
            row.map((value, metricIndex) => {
                const adjusted = value + adjustments[groupIndex][metricIndex];
                const final = adjusted * multiplier;
                return Math.max(0.5, Math.min(1.0, final));
            })
        );
    }
    
    updateBiasSummary(biasMatrix) {
        // Calculate summary statistics
        const allValues = biasMatrix.flat();
        const overallScore = allValues.reduce((sum, val) => sum + val, 0) / allValues.length;
        const warningCount = allValues.filter(val => val < 0.8 && val >= 0.7).length;
        const criticalCount = allValues.filter(val => val < 0.7).length;
        
        // Update summary cards
        const summaryCards = document.querySelectorAll('#bias-fairness .summary-card .metric-value');
        if (summaryCards[0]) {
            summaryCards[0].textContent = overallScore.toFixed(2);
            summaryCards[0].className = `metric-value ${overallScore >= 0.8 ? 'status-good' : 'status-warning'}`;
        }
        if (summaryCards[1]) {
            summaryCards[1].textContent = `${warningCount + criticalCount} groups`;
            summaryCards[1].className = `metric-value ${(warningCount + criticalCount) === 0 ? 'status-good' : 'status-warning'}`;
        }
        if (summaryCards[2]) {
            summaryCards[2].textContent = criticalCount.toString();
            summaryCards[2].className = `metric-value ${criticalCount === 0 ? 'status-good' : 'status-danger'}`;
        }
        if (summaryCards[3]) {
            const complianceStatus = criticalCount > 0 ? 'Critical' : warningCount > 0 ? 'Needs Review' : 'Compliant';
            summaryCards[3].textContent = complianceStatus;
            summaryCards[3].className = `metric-value ${criticalCount > 0 ? 'status-danger' : warningCount > 0 ? 'status-warning' : 'status-good'}`;
        }
    }
    
    updateFeatureDriftTable(institution, model) {
        const featureDriftData = this.generateFeatureDriftData(institution, model);
        const driftRows = document.querySelectorAll('.drift-row:not(.drift-header)');
        
        featureDriftData.forEach((feature, index) => {
            if (driftRows[index]) {
                const psiElement = driftRows[index].querySelector('.psi-value');
                const statusElement = driftRows[index].querySelector('.drift-status');
                const barFill = driftRows[index].querySelector('.bar-fill');
                const changeText = driftRows[index].querySelector('.change-text');
                const riskBadge = driftRows[index].querySelector('.risk-badge');
                
                if (psiElement) {
                    psiElement.textContent = feature.psi.toFixed(2);
                }
                
                if (statusElement) {
                    statusElement.textContent = feature.status;
                    statusElement.className = `drift-status ${feature.statusClass}`;
                }
                
                if (barFill) {
                    barFill.style.width = `${feature.changePercent}%`;
                    barFill.className = `bar-fill ${feature.statusClass}`;
                }
                
                if (changeText) {
                    changeText.textContent = `+${feature.changeFromBaseline.toFixed(1)}%`;
                }
                
                if (riskBadge) {
                    riskBadge.textContent = feature.riskLevel;
                    riskBadge.className = `risk-badge ${feature.riskClass}`;
                }
                
                // Update row border color
                const row = driftRows[index];
                row.classList.remove('stable', 'warning', 'danger');
                row.classList.add(feature.statusClass);
            }
        });
        
        // Update summary statistics
        this.updateDriftSummary(featureDriftData);
    }
    
    generateFeatureDriftData(institution, model) {
        const features = [
            'Employment History', 'Annual Income', 'Debt-to-Income Ratio', 'Employment Years',
            'Age', 'Loan Amount', 'Education Level', 'Geographic Region'
        ];
        
        // Base PSI values for each feature
        const basePSI = [0.05, 0.07, 0.12, 0.04, 0.03, 0.15, 0.06, 0.28];
        
        // Institution-specific adjustments
        const institutionAdjustments = {
            'bank-a': [0, 0, 0, 0, 0, 0, 0, 0],
            'bank-b': [0.02, 0.03, 0.05, 0.01, 0.02, 0.08, 0.02, 0.12],
            'bank-c': [-0.01, -0.02, -0.03, -0.01, -0.01, -0.04, -0.01, -0.08],
            'all': [0, 0, 0, 0, 0, 0, 0, 0]
        };
        
        const adjustments = institutionAdjustments[institution] || institutionAdjustments['bank-a'];
        
        return basePSI.map((psi, index) => {
            const adjustedPSI = Math.max(0.01, psi + adjustments[index]);
            
            let status, statusClass, riskLevel, riskClass;
            if (adjustedPSI < 0.1) {
                status = 'Stable';
                statusClass = 'stable';
                riskLevel = 'Low';
                riskClass = 'low';
            } else if (adjustedPSI < 0.2) {
                status = 'Minor Drift';
                statusClass = 'warning';
                riskLevel = 'Medium';
                riskClass = 'medium';
            } else {
                status = 'Significant Drift';
                statusClass = 'danger';
                riskLevel = 'High';
                riskClass = 'high';
            }
            
            const changeFromBaseline = (adjustedPSI / basePSI[index] - 1) * 100;
            const changePercent = Math.min(100, (adjustedPSI / 0.3) * 100); // Scale to 100% at PSI = 0.3
            
            return {
                name: features[index],
                psi: adjustedPSI,
                status,
                statusClass,
                changeFromBaseline: Math.abs(changeFromBaseline),
                changePercent,
                riskLevel,
                riskClass
            };
        });
    }
    
    updateDriftSummary(featureDriftData) {
        // Calculate summary statistics
        const overallPSI = featureDriftData.reduce((sum, f) => sum + f.psi, 0) / featureDriftData.length;
        const featuresAtRisk = featureDriftData.filter(f => f.psi >= 0.1).length;
        
        // Update summary cards
        const summaryCards = document.querySelectorAll('#stability-drift .summary-card .metric-value');
        if (summaryCards[0]) {
            summaryCards[0].textContent = overallPSI.toFixed(2);
            summaryCards[0].className = `metric-value ${overallPSI < 0.1 ? 'status-good' : overallPSI < 0.2 ? 'status-warning' : 'status-danger'}`;
        }
        if (summaryCards[1]) {
            summaryCards[1].textContent = `${featuresAtRisk} features`;
            summaryCards[1].className = `metric-value ${featuresAtRisk === 0 ? 'status-good' : 'status-warning'}`;
        }
    }
    
    generateRobustnessData(institution, model) {
        // Different robustness based on institution and model
        const institutionFactor = {
            'bank-a': 1.0,
            'bank-b': 0.9,
            'bank-c': 1.1,
            'all': 1.0
        }[institution] || 1.0;
        
        const modelFactor = {
            'credit-scoring-v1': 1.0,
            'credit-scoring-v2': 0.95,
            'credit-scoring-v3': 0.85,
            'fraud-detection-v1': 1.1,
            'risk-assessment-v1': 1.05
        }[model] || 1.0;
        
        const basev1 = [94.2, 91.5, 87.8, 82.1, 75.6, 67.3, 58.9];
        const basev2 = [93.8, 92.1, 89.4, 85.7, 80.9, 74.2, 66.8];
        const basev3 = [95.1, 93.6, 91.2, 88.4, 84.7, 79.5, 73.1];
        
        return {
            v1: basev1.map(val => Math.max(0, val * institutionFactor * modelFactor)),
            v2: basev2.map(val => Math.max(0, val * institutionFactor * modelFactor)),
            v3: basev3.map(val => Math.max(0, val * institutionFactor * modelFactor))
        };
    }
    
    generateSegmentRobustnessData(institution, model) {
        const institutionFactor = {
            'bank-a': 1.0,
            'bank-b': 0.93,
            'bank-c': 1.05,
            'all': 1.0
        }[institution] || 1.0;
        
        const baseClean = [96.2, 93.8, 89.1];
        const baseRobust = [82.4, 76.9, 61.3];
        
        return {
            clean: baseClean.map(val => val * institutionFactor),
            robust: baseRobust.map(val => val * institutionFactor)
        };
    }
    
    generateConfusionMatrixData(institution, model) {
        const institutionFactor = {
            'bank-a': 1.0,
            'bank-b': 1.3,
            'bank-c': 0.8,
            'all': 1.0
        }[institution] || 1.0;
        
        // 3x3 matrix deltas: [Low->Low, Low->Med, Low->High, Med->Low, Med->Med, Med->High, High->Low, High->Med, High->High]
        const baseDeltas = [-0.12, 0.08, 0.04, 0.05, -0.07, 0.02, 0.03, 0.09, -0.12];
        
        return baseDeltas.map(delta => delta * institutionFactor);
    }
    
    generateReliabilityData(institution, model) {
        const institutionFactor = {
            'bank-a': 1.0,
            'bank-b': 0.9,
            'bank-c': 1.1,
            'all': 1.0
        }[institution] || 1.0;
        
        const modelFactor = {
            'credit-scoring-v1': 1.0,
            'credit-scoring-v2': 0.95,
            'credit-scoring-v3': 0.85,
            'fraud-detection-v1': 1.15,
            'risk-assessment-v1': 1.05
        }[model] || 1.0;
        
        const cleanCalibration = [];
        const adversarialCalibration = [];
        
        for (let i = 0; i <= 10; i++) {
            const confidence = i / 10;
            
            // Clean predictions: well-calibrated with minor deviations
            cleanCalibration.push({
                x: confidence, 
                y: Math.max(0, Math.min(1, confidence - 0.02 * institutionFactor + Math.random() * 0.04))
            });
            
            // Adversarial predictions: show overconfidence issue
            let actualAccuracy;
            const overconfidenceFactor = institutionFactor * modelFactor;
            
            if (confidence < 0.3) {
                // Low confidence stays roughly accurate
                actualAccuracy = confidence - 0.05 * overconfidenceFactor + Math.random() * 0.1;
            } else if (confidence < 0.7) {
                // Medium confidence shows moderate overconfidence
                actualAccuracy = confidence - 0.15 * overconfidenceFactor - (confidence - 0.3) * 0.2;
            } else {
                // High confidence shows severe overconfidence
                actualAccuracy = confidence - 0.25 * overconfidenceFactor - (confidence - 0.7) * 0.4;
            }
            
            adversarialCalibration.push({
                x: confidence, 
                y: Math.max(0, Math.min(1, actualAccuracy))
            });
        }
        
        return {
            clean: cleanCalibration,
            adversarial: adversarialCalibration
        };
    }
    
    generateCounterfactualData(institution, model) {
        const baseData = [23, 41, 19, 4, 13];
        
        // Different patterns for different institutions
        const institutionPatterns = {
            'bank-a': [23, 41, 19, 4, 13],
            'bank-b': [18, 35, 25, 8, 14],
            'bank-c': [28, 45, 15, 2, 10],
            'all': [23, 38, 21, 6, 12]
        };
        
        return institutionPatterns[institution] || baseData;
    }
    
    updateShapTable(shapDetails) {
        // Update the SHAP table with new values
        const shapRows = document.querySelectorAll('.shap-row:not(.shap-header)');
        
        shapDetails.forEach((detail, index) => {
            if (shapRows[index]) {
                const valueElement = shapRows[index].querySelector('.shap-value');
                const contributionBar = shapRows[index].querySelector('.bar-fill');
                const percentage = shapRows[index].querySelector('.percentage');
                
                if (valueElement) {
                    valueElement.textContent = detail.value >= 0 ? `+${detail.value.toFixed(2)}` : detail.value.toFixed(2);
                }
                
                // Update contribution percentage
                const totalContribution = shapDetails.reduce((sum, d) => sum + Math.abs(d.value), 0);
                const contrib = (Math.abs(detail.value) / totalContribution * 100);
                
                if (contributionBar) {
                    contributionBar.style.width = `${Math.min(100, contrib)}%`;
                }
                
                if (percentage) {
                    percentage.textContent = `${contrib.toFixed(1)}%`;
                }
                
                // Update row class based on positive/negative
                const row = shapRows[index];
                row.classList.remove('positive', 'negative');
                row.classList.add(detail.value >= 0 ? 'positive' : 'negative');
            }
        });
    }

    generateCounterfactualEffortData() {
        // Generate data for tornado chart showing minimal effort required to flip decision
        const features = [
            'Employment History',
            'Annual Income',
            'Debt-to-Income Ratio', 
            'Employment Years',
            'Loan Amount',
            'Education Level',
            'Geographic Region'
        ];

        // Minimal change required (in normalized business units) - sorted by magnitude
        const effort = [
            0.87,  // Employment History - most difficult to change
            0.52,  // Annual Income - moderate effort
            0.43,  // Debt-to-Income Ratio
            0.31,  // Employment Years
            0.19,  // Loan Amount - easier to adjust
            0.15,  // Education Level
            0.08   // Geographic Region - easiest
        ];

        // Feasibility cost (0-1 scale, where 1 = highest cost/lowest feasibility)
        const cost = [
            0.95,  // Employment History - very high cost to change
            0.25,  // Annual Income - moderate cost
            0.35,  // Debt-to-Income Ratio
            0.78,  // Employment Years - high cost
            0.10,  // Loan Amount - low cost
            0.60,  // Education Level - high cost but possible
            0.05   // Geographic Region - very low cost
        ];

        // Sort by effort magnitude (descending) for tornado effect
        const combined = features.map((feature, index) => ({
            feature,
            effort: effort[index],
            cost: cost[index]
        }));

        combined.sort((a, b) => b.effort - a.effort);

        return {
            features: combined.map(item => item.feature),
            effort: combined.map(item => item.effort),
            cost: combined.map(item => item.cost)
        };
    }
}

// Initialize the reports manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ReportsManager();
});

// Add CSS for success notifications
const style = document.createElement('style');
style.textContent = `
    .success-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #00d4ff, #0066cc);
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 4px 20px rgba(0, 212, 255, 0.3);
        transform: translateX(100%);
        transition: transform 0.3s ease;
        z-index: 10000;
        font-weight: 500;
    }
    
    .success-notification.show {
        transform: translateX(0);
    }
    
    .success-notification i {
        width: 20px;
        height: 20px;
    }
`;
document.head.appendChild(style);
