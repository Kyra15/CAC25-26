document.addEventListener('DOMContentLoaded', function() {
    const errorDiv = document.getElementById('error-message-lg');
    if (errorDiv && errorDiv.textContent.trim() !== '') {
        setTimeout(function() {
            errorDiv.innerHTML = '';
        }, 3000);
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const errorDiv = document.getElementById('error-message-su');
    if (errorDiv && errorDiv.textContent.trim() !== '') {
        setTimeout(function() {
            errorDiv.innerHTML = '';
        }, 3000);
    }
});