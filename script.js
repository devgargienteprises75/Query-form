document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('queryForm');
    const successMessage = document.getElementById('successMessage');
    const newQueryBtn = document.getElementById('newQueryBtn');
    const submitBtn = document.getElementById('submitBtn');

    // =============================================
    // PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE
    // =============================================
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxxkYiXEWEvHQSfuGTcDNrm4LaC1lNLtx8NjmvUiKGz8XGJv5oEETmbHhTpMm0G0mrc/exec';

    // =============================================
    // DEPARTMENT → CATEGORY MAPPING
    // =============================================
    const CATEGORY_MAP = {
        'Sales & Floor Incharge': [
            'Supply',
            'Negotiation',
            'Discount / Offer Issue',
            'Display',
            'Price Issue',
            'Staff Shortage on Floor',
            'Customer Complaint on Floor',
            'Training',
            'Other'
        ],
        'Purchase & Accounts': [
            'Invoice / Bill Mismatch',
            'Payment Pending',
            'Purchase Order Issue',
            'GST / Tax Related',
            'Other'
        ],
        'Research and Development': [
            'Market Research Request',
            'Tech Related Issue',
            'Other'
        ],
        'HR': [
            'Attendance / Leave Issue',
            'Salary / Payroll Query',
            'Staff Misconduct / Complaint',
            'Training / Onboarding Request',
            'Other'
        ],
        'Operations & Inventory': [
            'Stock Mismatch',
            'Gofrugal Software Issue',
            'Barcode / Label Problem',
            'Warehouse / Storage Issue',
            'Other'
        ],
        'Customer Service': [
            'Product Exchange / Return',
            'Home Delivery Issue',
            'Warranty / Service Request',
            'Customer Feedback / Escalation',
            'Other'
        ],
        'Logistic': [
            'Delivery Delay',
            'Damaged in Transit',
            'Vehicle / Transport Issue',
            'Inter-store Transfer Problem',
            'Other'
        ],
        'Front desk': [
            'Visitor / Vendor Entry Issue',
            'Phone / Communication Problem',
            'Courier / Parcel Issue',
            'Facility Complaint',
            'Process',
            'Other'
        ],
        'Billing Team': [
            'System',
            'Billing Error',
            'Tender Issue',
            'Bill Reprint / Cancellation',
            'Price Mismatch',
            'Process',
            'Other'
        ],
        'Social Media & Marketing': [
            'Campaign / Promotion Request',
            'Creative / Banner Design',
            'Influencer / Collaboration',
            'Social Media Query / Escalation',
            'Ad Budget / Boost Request',
            'Other'
        ]
    };

    // =============================================
    // DROPDOWN HELPER — handles open/close/select
    // =============================================
    function setupDropdownTrigger(select) {
        const trigger = select.querySelector('.select-trigger');

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            // Close all other dropdowns
            document.querySelectorAll('.custom-select.open').forEach(other => {
                if (other !== select) other.classList.remove('open');
            });
            select.classList.toggle('open');
        });

        trigger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                trigger.click();
            }
            if (e.key === 'Escape') {
                select.classList.remove('open');
            }
        });
    }

    function setupDropdownItems(select, onSelect) {
        const items = select.querySelectorAll('.select-options li');
        const valueSpan = select.querySelector('.select-value');
        const hiddenInput = select.querySelector('input[type="hidden"]');

        items.forEach(item => {
            item.addEventListener('click', () => {
                const value = item.dataset.value;
                const text = item.textContent;

                if (value) {
                    valueSpan.textContent = text;
                    valueSpan.classList.add('has-value');
                    hiddenInput.value = value;
                } else {
                    valueSpan.textContent = valueSpan.dataset.placeholder;
                    valueSpan.classList.remove('has-value');
                    hiddenInput.value = '';
                }

                items.forEach(i => i.classList.remove('selected'));
                if (value) item.classList.add('selected');

                select.classList.remove('open');

                // Clear error
                const card = select.closest('.form-card');
                if (card) clearCardError(card);

                // Custom callback
                if (onSelect) onSelect(value);
            });
        });
    }

    // Close all dropdowns on outside click
    document.addEventListener('click', () => {
        document.querySelectorAll('.custom-select.open').forEach(s => {
            s.classList.remove('open');
        });
    });

    // =============================================
    // DEPARTMENT DROPDOWN
    // =============================================
    const departmentSelect = document.getElementById('departmentSelect');
    const queryCategoryCard = document.getElementById('queryCategoryCard');
    const queryCategorySelect = document.getElementById('queryCategorySelect');

    setupDropdownTrigger(departmentSelect);
    setupDropdownItems(departmentSelect, (selectedDept) => {
        // When department is selected → update categories
        if (selectedDept && CATEGORY_MAP[selectedDept]) {
            buildCategoryOptions(CATEGORY_MAP[selectedDept]);
            queryCategoryCard.style.display = 'block';
        } else {
            queryCategoryCard.style.display = 'none';
        }
    });

    // =============================================
    // CATEGORY DROPDOWN — built dynamically
    // =============================================
    setupDropdownTrigger(queryCategorySelect);

    function buildCategoryOptions(categories) {
        const optionsList = queryCategorySelect.querySelector('.select-options');
        const valueSpan = queryCategorySelect.querySelector('.select-value');
        const hiddenInput = queryCategorySelect.querySelector('input[type="hidden"]');

        // Reset current selection
        valueSpan.textContent = 'Choose';
        valueSpan.classList.remove('has-value');
        hiddenInput.value = '';

        // Clear old options
        optionsList.innerHTML = '';

        // Add "Choose" placeholder
        const chooseLi = document.createElement('li');
        chooseLi.dataset.value = '';
        chooseLi.textContent = 'Choose';
        optionsList.appendChild(chooseLi);

        // Add category options
        categories.forEach(cat => {
            const li = document.createElement('li');
            li.dataset.value = cat;
            li.textContent = cat;
            optionsList.appendChild(li);
        });

        // Attach click handlers to the NEW items
        setupDropdownItems(queryCategorySelect, null);
    }

    // ===== Form Submission =====
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Clear previous errors
        document.querySelectorAll('.form-card.has-error').forEach(card => clearCardError(card));
        let firstError = null;

        // Department — required
        const department = document.getElementById('department').value;
        if (!department) {
            const card = departmentSelect.closest('.form-card');
            showCardError(card, 'This is a required question');
            if (!firstError) firstError = card;
        }

        // Query Category — required (only if visible)
        const queryCategory = document.getElementById('queryCategory').value;
        if (department && !queryCategory) {
            showCardError(queryCategoryCard, 'This is a required question');
            if (!firstError) firstError = queryCategoryCard;
        }

        // Priority Level — required
        const priorityLevel = document.querySelector('input[name="priorityLevel"]:checked');
        if (!priorityLevel) {
            const card = document.getElementById('priorityLevel').closest('.form-card');
            showCardError(card, 'This is a required question');
            if (!firstError) firstError = card;
        }

        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        // Collect data
        const formData = {
            employeeName: document.getElementById('employeeName').value.trim(),
            department,
            queryCategory,
            queryDescription: document.getElementById('queryDescription').value.trim(),
            queryRelatedDepartments: Array.from(
                document.querySelectorAll('input[name="queryRelatedDept"]:checked')
            ).map(cb => cb.value).join(', '),
            priorityLevel: priorityLevel.value
        };

        // Send to Google Sheets
        if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
            console.log('⚠️ Google Script URL not set. Form data:', formData);
            alert('⚠️ Please set your Google Apps Script URL in script.js.\n\nData logged to console.');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        try {
            let iframe = document.getElementById('hidden-iframe');
            if (!iframe) {
                iframe = document.createElement('iframe');
                iframe.name = 'hidden-iframe';
                iframe.id = 'hidden-iframe';
                iframe.style.display = 'none';
                document.body.appendChild(iframe);
            }

            const tempForm = document.createElement('form');
            tempForm.method = 'POST';
            tempForm.action = GOOGLE_SCRIPT_URL;
            tempForm.target = 'hidden-iframe';
            tempForm.style.display = 'none';

            for (const [key, value] of Object.entries(formData)) {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = value;
                tempForm.appendChild(input);
            }

            document.body.appendChild(tempForm);
            tempForm.submit();
            tempForm.remove();

            setTimeout(() => {
                form.style.display = 'none';
                successMessage.classList.add('visible');
                window.scrollTo({ top: 0, behavior: 'smooth' });
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit';
            }, 1500);

        } catch (error) {
            console.error('Submission error:', error);
            alert('Failed to submit. Please check your internet connection and try again.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit';
        }
    });

    // ===== New Query =====
    newQueryBtn.addEventListener('click', () => {
        form.reset();
        resetForm();
        form.style.display = 'block';
        successMessage.classList.remove('visible');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ===== Clear form =====
    form.addEventListener('reset', () => {
        setTimeout(() => resetForm(), 10);
    });

    function resetForm() {
        // Reset all dropdown displays
        document.querySelectorAll('.custom-select').forEach(select => {
            const valueSpan = select.querySelector('.select-value');
            const hiddenInput = select.querySelector('input[type="hidden"]');
            if (valueSpan) {
                valueSpan.textContent = valueSpan.dataset.placeholder || 'Choose';
                valueSpan.classList.remove('has-value');
            }
            if (hiddenInput) hiddenInput.value = '';
            select.querySelectorAll('.select-options li').forEach(li => li.classList.remove('selected'));
        });

        // Hide category dropdown
        queryCategoryCard.style.display = 'none';

        // Clear errors
        document.querySelectorAll('.form-card.has-error').forEach(card => clearCardError(card));
    }

    // ===== Error helpers =====
    function showCardError(card, message) {
        if (!card) return;
        card.classList.add('has-error');
        if (!card.querySelector('.error-msg')) {
            const errorEl = document.createElement('div');
            errorEl.className = 'error-msg';
            errorEl.textContent = message;
            card.querySelector('.form-group').appendChild(errorEl);
        }
    }

    function clearCardError(card) {
        if (!card) return;
        card.classList.remove('has-error');
        const errorEl = card.querySelector('.error-msg');
        if (errorEl) errorEl.remove();
    }

    // Clear error on radio change
    document.querySelectorAll('.radio-option input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', () => {
            const card = radio.closest('.form-card');
            if (card) clearCardError(card);
        });
    });
});
