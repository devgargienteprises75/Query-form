document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('queryForm');
    const successMessage = document.getElementById('successMessage');
    const newQueryBtn = document.getElementById('newQueryBtn');
    const submitBtn = document.getElementById('submitBtn');

    // =============================================
    // PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE
    // =============================================
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxxkYiXEWEvHQSfuGTcDNrm4LaC1lNLtx8NjmvUiKGz8XGJv5oEETmbHhTpMm0G0mrc/exec';

    // ===== Custom Dropdown Logic =====
    document.querySelectorAll('.custom-select').forEach(select => {
        const trigger = select.querySelector('.select-trigger');
        const options = select.querySelector('.select-options');
        const valueSpan = select.querySelector('.select-value');
        const hiddenInput = select.querySelector('input[type="hidden"]');
        const items = options.querySelectorAll('li');

        // Toggle dropdown
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.custom-select.open').forEach(other => {
                if (other !== select) other.classList.remove('open');
            });
            select.classList.toggle('open');
        });

        // Keyboard support
        trigger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                trigger.click();
            }
            if (e.key === 'Escape') {
                select.classList.remove('open');
            }
        });

        // Select an option
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

                const card = select.closest('.form-card');
                if (card) clearCardError(card);
            });
        });
    });

    // Close dropdowns on outside click
    document.addEventListener('click', () => {
        document.querySelectorAll('.custom-select.open').forEach(s => {
            s.classList.remove('open');
        });
    });

    // ===== Form Submission =====
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Clear all previous errors
        document.querySelectorAll('.form-card.has-error').forEach(card => clearCardError(card));

        let firstError = null;

        // Department — required
        const department = document.getElementById('department').value;
        if (!department) {
            const card = document.getElementById('departmentSelect').closest('.form-card');
            showCardError(card, 'This is a required question');
            if (!firstError) firstError = card;
        }

        // Query Category — required
        const queryCategory = document.getElementById('queryCategory').value;
        if (!queryCategory) {
            const card = document.getElementById('queryCategorySelect').closest('.form-card');
            showCardError(card, 'This is a required question');
            if (!firstError) firstError = card;
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

        // ===== Send to Google Sheets =====
        if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
            // URL not set — log to console as fallback
            console.log('⚠️ Google Script URL not set. Form data:', formData);
            alert('⚠️ Please set your Google Apps Script URL in script.js (line 11).\n\nData logged to console.');
            return;
        }

        // Show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        try {
            // Create hidden iframe (to prevent page redirect)
            let iframe = document.getElementById('hidden-iframe');
            if (!iframe) {
                iframe = document.createElement('iframe');
                iframe.name = 'hidden-iframe';
                iframe.id = 'hidden-iframe';
                iframe.style.display = 'none';
                document.body.appendChild(iframe);
            }

            // Create a temporary form and submit to the iframe
            const tempForm = document.createElement('form');
            tempForm.method = 'POST';
            tempForm.action = GOOGLE_SCRIPT_URL;
            tempForm.target = 'hidden-iframe';
            tempForm.style.display = 'none';

            // Add each field as a hidden input
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

            // Wait briefly for submission, then show success
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

        // Reset custom dropdowns
        document.querySelectorAll('.custom-select').forEach(select => {
            const valueSpan = select.querySelector('.select-value');
            const hiddenInput = select.querySelector('input[type="hidden"]');
            valueSpan.textContent = valueSpan.dataset.placeholder;
            valueSpan.classList.remove('has-value');
            hiddenInput.value = '';
            select.querySelectorAll('.select-options li').forEach(li => li.classList.remove('selected'));
        });

        document.querySelectorAll('.form-card.has-error').forEach(card => clearCardError(card));

        form.style.display = 'block';
        successMessage.classList.remove('visible');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ===== Clear form =====
    form.addEventListener('reset', () => {
        setTimeout(() => {
            document.querySelectorAll('.custom-select').forEach(select => {
                const valueSpan = select.querySelector('.select-value');
                const hiddenInput = select.querySelector('input[type="hidden"]');
                valueSpan.textContent = valueSpan.dataset.placeholder;
                valueSpan.classList.remove('has-value');
                hiddenInput.value = '';
                select.querySelectorAll('.select-options li').forEach(li => li.classList.remove('selected'));
            });
            document.querySelectorAll('.form-card.has-error').forEach(card => clearCardError(card));
        }, 10);
    });

    // ===== Error helpers =====
    function showCardError(card, message) {
        card.classList.add('has-error');
        if (!card.querySelector('.error-msg')) {
            const errorEl = document.createElement('div');
            errorEl.className = 'error-msg';
            errorEl.textContent = message;
            card.querySelector('.form-group').appendChild(errorEl);
        }
    }

    function clearCardError(card) {
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
