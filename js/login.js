// Login functionality for Apollo Esmoriz
document.addEventListener('DOMContentLoaded', function() {
    // Form elements
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    
    // Modal elements
    const registerModal = document.getElementById('register-modal');
    const forgotPasswordModal = document.getElementById('forgot-password-modal');
    
    // Buttons and links
    const showRegisterBtn = document.getElementById('show-register');
    const closeRegisterBtn = document.getElementById('close-register');
    const closeForgotPasswordBtn = document.getElementById('close-forgot-password');
    const forgotPasswordLink = document.querySelector('.forgot-password');
    const googleLoginBtn = document.getElementById('google-login');
    const facebookLoginBtn = document.getElementById('facebook-login');

    // Login form handling
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Register form handling
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Forgot password form handling
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', handleForgotPassword);
    }

    // Modal controls
    if (showRegisterBtn) {
        showRegisterBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showModal(registerModal);
        });
    }

    if (closeRegisterBtn) {
        closeRegisterBtn.addEventListener('click', function() {
            hideModal(registerModal);
        });
    }

    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            showModal(forgotPasswordModal);
        });
    }

    if (closeForgotPasswordBtn) {
        closeForgotPasswordBtn.addEventListener('click', function() {
            hideModal(forgotPasswordModal);
        });
    }

    // Social login buttons
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', handleGoogleLogin);
    }

    if (facebookLoginBtn) {
        facebookLoginBtn.addEventListener('click', handleFacebookLogin);
    }

    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            hideModal(e.target);
        }
    });

    // Real-time validation
    setupRealTimeValidation();
});

// Login form handler
async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const email = formData.get('email').trim();
    const password = formData.get('password').trim();
    const rememberMe = document.getElementById('remember-me').checked;
    
    // Clear previous errors
    clearErrors();
    
    // Validate inputs
    let hasErrors = false;
    
    if (!email) {
        showFieldError('email', 'Email é obrigatório');
        hasErrors = true;
    } else if (!isValidEmail(email)) {
        showFieldError('email', 'Email inválido');
        hasErrors = true;
    }
    
    if (!password) {
        showFieldError('password', 'Palavra-passe é obrigatória');
        hasErrors = true;
    } else if (password.length < 6) {
        showFieldError('password', 'Palavra-passe deve ter pelo menos 6 caracteres');
        hasErrors = true;
    }
    
    if (hasErrors) return;
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'A entrar...';
    submitBtn.disabled = true;
    
    try {
        // Simulate API call
        const response = await simulateLogin(email, password);
        
        if (response.success) {
            // Store user data
            const userData = {
                email: email,
                name: response.user.name,
                token: response.token,
                rememberMe: rememberMe
            };
            
            if (rememberMe) {
                localStorage.setItem('apolloUser', JSON.stringify(userData));
            } else {
                sessionStorage.setItem('apolloUser', JSON.stringify(userData));
            }
            
            window.ApolloEsmoriz.showNotification('Login realizado com sucesso!', 'success');
            
            // Redirect after success
            setTimeout(() => {
                const urlParams = new URLSearchParams(window.location.search);
                const redirect = urlParams.get('redirect') || 'index.html';
                window.location.href = redirect;
            }, 1500);
            
        } else {
            showFieldError('password', response.message || 'Email ou palavra-passe incorretos');
        }
        
    } catch (error) {
        console.error('Login error:', error);
        window.ApolloEsmoriz.showNotification('Erro no servidor. Tente novamente.', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Register form handler
async function handleRegister(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const name = formData.get('name').trim();
    const email = formData.get('email').trim();
    const phone = formData.get('phone').trim();
    const password = formData.get('password').trim();
    const confirmPassword = formData.get('confirm-password').trim();
    const acceptTerms = document.getElementById('accept-terms').checked;
    const newsletterSignup = document.getElementById('newsletter-signup').checked;
    
    // Clear previous errors
    clearErrors('reg-');
    
    // Validate inputs
    let hasErrors = false;
    
    if (!name) {
        showFieldError('reg-name', 'Nome é obrigatório');
        hasErrors = true;
    } else if (name.length < 2) {
        showFieldError('reg-name', 'Nome deve ter pelo menos 2 caracteres');
        hasErrors = true;
    }
    
    if (!email) {
        showFieldError('reg-email', 'Email é obrigatório');
        hasErrors = true;
    } else if (!isValidEmail(email)) {
        showFieldError('reg-email', 'Email inválido');
        hasErrors = true;
    }
    
    if (!password) {
        showFieldError('reg-password', 'Palavra-passe é obrigatória');
        hasErrors = true;
    } else if (password.length < 8) {
        showFieldError('reg-password', 'Palavra-passe deve ter pelo menos 8 caracteres');
        hasErrors = true;
    } else if (!isStrongPassword(password)) {
        showFieldError('reg-password', 'Palavra-passe deve conter letras, números e símbolos');
        hasErrors = true;
    }
    
    if (!confirmPassword) {
        showFieldError('reg-confirm-password', 'Confirmação de palavra-passe é obrigatória');
        hasErrors = true;
    } else if (password !== confirmPassword) {
        showFieldError('reg-confirm-password', 'Palavras-passe não coincidem');
        hasErrors = true;
    }
    
    if (!acceptTerms) {
        window.ApolloEsmoriz.showNotification('Deve aceitar os Termos e Condições', 'error');
        hasErrors = true;
    }
    
    if (hasErrors) return;
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'A criar conta...';
    submitBtn.disabled = true;
    
    try {
        // Simulate API call
        const response = await simulateRegister({
            name,
            email,
            phone,
            password,
            newsletterSignup
        });
        
        if (response.success) {
            window.ApolloEsmoriz.showNotification('Conta criada com sucesso! Pode agora fazer login.', 'success');
            hideModal(registerModal);
            
            // Pre-fill login form
            document.getElementById('email').value = email;
            
        } else {
            showFieldError('reg-email', response.message || 'Erro ao criar conta');
        }
        
    } catch (error) {
        console.error('Register error:', error);
        window.ApolloEsmoriz.showNotification('Erro no servidor. Tente novamente.', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Forgot password handler
async function handleForgotPassword(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const email = formData.get('email').trim();
    
    // Clear previous errors
    clearErrors('forgot-');
    
    if (!email) {
        showFieldError('forgot-email', 'Email é obrigatório');
        return;
    }
    
    if (!isValidEmail(email)) {
        showFieldError('forgot-email', 'Email inválido');
        return;
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'A enviar...';
    submitBtn.disabled = true;
    
    try {
        // Simulate API call
        await simulateForgotPassword(email);
        
        window.ApolloEsmoriz.showNotification('Instruções enviadas para o seu email!', 'success');
        hideModal(forgotPasswordModal);
        
    } catch (error) {
        console.error('Forgot password error:', error);
        window.ApolloEsmoriz.showNotification('Erro ao enviar email. Tente novamente.', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Social login handlers
function handleGoogleLogin() {
    window.ApolloEsmoriz.showNotification('Login com Google em breve!', 'info');
    // In a real app, integrate with Google OAuth
}

function handleFacebookLogin() {
    window.ApolloEsmoriz.showNotification('Login com Facebook em breve!', 'info');
    // In a real app, integrate with Facebook Login
}

// Utility functions
function showModal(modal) {
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Focus first input
        const firstInput = modal.querySelector('input');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
}

function hideModal(modal) {
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Clear form
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
            clearErrors();
        }
    }
}

function showFieldError(fieldId, message) {
    const errorElement = document.getElementById(fieldId + '-error');
    const inputElement = document.getElementById(fieldId);
    
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
    
    if (inputElement) {
        inputElement.classList.add('error');
    }
}

function clearErrors(prefix = '') {
    const errorElements = document.querySelectorAll(`[id^="${prefix}"][id$="-error"]`);
    errorElements.forEach(element => {
        element.textContent = '';
        element.style.display = 'none';
    });
    
    const inputElements = document.querySelectorAll('.error');
    inputElements.forEach(element => {
        element.classList.remove('error');
    });
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isStrongPassword(password) {
    // At least 8 characters, 1 letter, 1 number
    const strongRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    return strongRegex.test(password);
}

function setupRealTimeValidation() {
    // Email validation
    const emailInputs = document.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        input.addEventListener('blur', function() {
            const value = this.value.trim();
            const errorId = this.id + '-error';
            
            if (value && !isValidEmail(value)) {
                showFieldError(this.id, 'Email inválido');
            } else {
                const errorElement = document.getElementById(errorId);
                if (errorElement) {
                    errorElement.style.display = 'none';
                    this.classList.remove('error');
                }
            }
        });
    });
    
    // Password confirmation validation
    const confirmPasswordInput = document.getElementById('reg-confirm-password');
    const passwordInput = document.getElementById('reg-password');
    
    if (confirmPasswordInput && passwordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            const password = passwordInput.value;
            const confirmPassword = this.value;
            
            if (confirmPassword && password !== confirmPassword) {
                showFieldError(this.id, 'Palavras-passe não coincidem');
            } else {
                const errorElement = document.getElementById(this.id + '-error');
                if (errorElement) {
                    errorElement.style.display = 'none';
                    this.classList.remove('error');
                }
            }
        });
    }
}

// Simulate API calls (replace with real API calls)
async function simulateLogin(email, password) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Demo users
            const demoUsers = [
                { email: 'admin@apolloesmoriz.pt', password: '123456', name: 'Administrador' },
                { email: 'user@example.com', password: 'password', name: 'Utilizador Demo' }
            ];
            
            const user = demoUsers.find(u => u.email === email && u.password === password);
            
            if (user) {
                resolve({
                    success: true,
                    user: { name: user.name, email: user.email },
                    token: 'demo-token-' + Date.now()
                });
            } else {
                resolve({
                    success: false,
                    message: 'Email ou palavra-passe incorretos'
                });
            }
        }, 1000);
    });
}

async function simulateRegister(userData) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulate email already exists check
            if (userData.email === 'admin@apolloesmoriz.pt') {
                resolve({
                    success: false,
                    message: 'Este email já está registado'
                });
            } else {
                resolve({
                    success: true,
                    message: 'Conta criada com sucesso'
                });
            }
        }, 1500);
    });
}

async function simulateForgotPassword(email) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ success: true });
        }, 1000);
    });
}

// Check if user is already logged in
function checkAuthStatus() {
    const userData = localStorage.getItem('apolloUser') || sessionStorage.getItem('apolloUser');
    
    if (userData) {
        try {
            const user = JSON.parse(userData);
            // User is logged in, could redirect or show different UI
            console.log('User logged in:', user.name);
        } catch (error) {
            // Invalid stored data, clear it
            localStorage.removeItem('apolloUser');
            sessionStorage.removeItem('apolloUser');
        }
    }
}

// Initialize auth check
checkAuthStatus();
