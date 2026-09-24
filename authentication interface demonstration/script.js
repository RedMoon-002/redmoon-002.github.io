/**
 * SecureGate — Next-Gen 2-Step Authentication Prototype Controller
 * Mock local authentication, validation, timers, animations, and session management.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. Constants & Application State
  // --------------------------------------------------------------------------
  const DEMO_CONFIG = {
    username: 'demo',
    password: 'password123',
    otp: '123456',
    maxOtpAttempts: 3,
    lockoutDurationSeconds: 30,
    resendDurationSeconds: 30
  };

  const state = {
    currentStep: 1, // 1: Login, 2: OTP, 3: Profile, 3.5: Success, 4: Dashboard
    loginPassed: false,
    otpPassed: false,
    profilePassed: false,
    remainingOtpAttempts: DEMO_CONFIG.maxOtpAttempts,
    isLockedOut: false,
    lockoutTimerId: null,
    resendTimerId: null,
    resendSecondsRemaining: DEMO_CONFIG.resendDurationSeconds,
    profileData: {
      fullName: '',
      dob: '',
      gender: '',
      phone: '',
      email: '',
      occupation: '',
      rollNumber: '',
      college: '',
      course: '',
      semester: '',
      address: '',
      city: '',
      state: '',
      country: '',
      zip: ''
    }
  };

  // --------------------------------------------------------------------------
  // 2. DOM Elements
  // --------------------------------------------------------------------------
  const elements = {
    // Stepper & Nav
    stepperNav: document.getElementById('stepperNav'),
    stepNode1: document.getElementById('stepNode1'),
    stepNode2: document.getElementById('stepNode2'),
    stepNode3: document.getElementById('stepNode3'),
    connector1: document.getElementById('connector1'),
    connector2: document.getElementById('connector2'),
    brandLogoBtn: document.getElementById('brandLogoBtn'),

    // Pages
    loginPage: document.getElementById('loginPage'),
    otpPage: document.getElementById('otpPage'),
    profilePage: document.getElementById('profilePage'),
    successPage: document.getElementById('successPage'),
    dashboardPage: document.getElementById('dashboardPage'),

    // Page 1: Login
    loginForm: document.getElementById('loginForm'),
    loginUsername: document.getElementById('loginUsername'),
    loginPassword: document.getElementById('loginPassword'),
    togglePasswordBtn: document.getElementById('togglePasswordBtn'),
    btnLoginSubmit: document.getElementById('btnLoginSubmit'),
    loginAlert: document.getElementById('loginAlert'),
    loginAlertMsg: document.getElementById('loginAlertMsg'),
    loginUserError: document.getElementById('loginUserError'),
    loginPassError: document.getElementById('loginPassError'),
    btnAutoFillLogin: document.getElementById('btnAutoFillLogin'),
    forgotPasswordLink: document.getElementById('forgotPasswordLink'),
    createAccountLink: document.getElementById('createAccountLink'),

    // Page 2: OTP
    otpForm: document.getElementById('otpForm'),
    otpDigits: Array.from(document.querySelectorAll('.otp-digit')),
    btnVerifyOtp: document.getElementById('btnVerifyOtp'),
    otpAlert: document.getElementById('otpAlert'),
    otpAlertMsg: document.getElementById('otpAlertMsg'),
    attemptsRemainingText: document.getElementById('attemptsRemainingText'),
    lockoutAlert: document.getElementById('lockoutAlert'),
    lockoutSeconds: document.getElementById('lockoutSeconds'),
    resendCountdown: document.getElementById('resendCountdown'),
    resendTimerVal: document.getElementById('resendTimerVal'),
    btnResendCode: document.getElementById('btnResendCode'),
    btnAutoFillOtp: document.getElementById('btnAutoFillOtp'),
    altMethodsBtn: document.getElementById('altMethodsBtn'),
    backToLoginBtn: document.getElementById('backToLoginBtn'),
    otpTargetMask: document.getElementById('otpTargetMask'),

    // Page 3: Profile Details
    profileDetailsForm: document.getElementById('profileDetailsForm'),
    btnFillSampleProfile: document.getElementById('btnFillSampleProfile'),
    btnSaveProfile: document.getElementById('btnSaveProfile'),
    btnBackToOtp: document.getElementById('btnBackToOtp'),
    profileAlert: document.getElementById('profileAlert'),
    profileAlertMsg: document.getElementById('profileAlertMsg'),
    
    // Profile Fields
    fullName: document.getElementById('fullName'),
    dob: document.getElementById('dob'),
    gender: document.getElementById('gender'),
    phone: document.getElementById('phone'),
    email: document.getElementById('email'),
    occupation: document.getElementById('occupation'),
    rollNumber: document.getElementById('rollNumber'),
    college: document.getElementById('college'),
    course: document.getElementById('course'),
    semester: document.getElementById('semester'),
    address: document.getElementById('address'),
    city: document.getElementById('city'),
    stateField: document.getElementById('state'),
    country: document.getElementById('country'),
    zip: document.getElementById('zip'),

    // Inline errors for profile
    errFullName: document.getElementById('errFullName'),
    errDob: document.getElementById('errDob'),
    errGender: document.getElementById('errGender'),
    errPhone: document.getElementById('errPhone'),
    errEmail: document.getElementById('errEmail'),
    errOccupation: document.getElementById('errOccupation'),
    errRollNumber: document.getElementById('errRollNumber'),
    errCollege: document.getElementById('errCollege'),
    errCourse: document.getElementById('errCourse'),
    errSemester: document.getElementById('errSemester'),
    errAddress: document.getElementById('errAddress'),
    errCity: document.getElementById('errCity'),
    errState: document.getElementById('errState'),
    errCountry: document.getElementById('errCountry'),
    errZip: document.getElementById('errZip'),

    // Page 3b: Success
    btnGoToDashboard: document.getElementById('btnGoToDashboard'),
    successSummaryName: document.getElementById('successSummaryName'),
    successSummaryOrg: document.getElementById('successSummaryOrg'),

    // Page 4: Dashboard
    dashUserName: document.getElementById('dashUserName'),
    dashAvatarInitials: document.getElementById('dashAvatarInitials'),
    dashRoleBadge: document.getElementById('dashRoleBadge'),
    dashTimestamp: document.getElementById('dashTimestamp'),
    dashSessionId: document.getElementById('dashSessionId'),
    dashOccupation: document.getElementById('dashOccupation'),
    dashRollNumber: document.getElementById('dashRollNumber'),
    dashCourse: document.getElementById('dashCourse'),
    dashCollege: document.getElementById('dashCollege'),
    dashSemester: document.getElementById('dashSemester'),
    dashFullName: document.getElementById('dashFullName'),
    dashEmail: document.getElementById('dashEmail'),
    dashPhone: document.getElementById('dashPhone'),
    dashDob: document.getElementById('dashDob'),
    dashGender: document.getElementById('dashGender'),
    dashAddress: document.getElementById('dashAddress'),
    dashCity: document.getElementById('dashCity'),
    dashState: document.getElementById('dashState'),
    dashCountry: document.getElementById('dashCountry'),
    dashZip: document.getElementById('dashZip'),
    btnLogoutBtn: document.getElementById('btnLogoutBtn'),

    // Modals & Toasts
    altMethodsModal: document.getElementById('altMethodsModal'),
    closeAltModalBtn: document.getElementById('closeAltModalBtn'),
    cancelAltModalBtn: document.getElementById('cancelAltModalBtn'),
    confirmAltModalBtn: document.getElementById('confirmAltModalBtn'),
    infoModal: document.getElementById('infoModal'),
    infoModalTitle: document.getElementById('infoModalTitle'),
    infoModalBody: document.getElementById('infoModalBody'),
    closeInfoModalBtn: document.getElementById('closeInfoModalBtn'),
    ackInfoModalBtn: document.getElementById('ackInfoModalBtn'),
    toastContainer: document.getElementById('toastContainer')
  };

  // --------------------------------------------------------------------------
  // 3. Helper Utilities (Toasts, Animations, Stepper Sync)
  // --------------------------------------------------------------------------

  /**
   * Shows a transient toast notification
   * @param {string} message 
   * @param {'info'|'success'|'error'} type 
   */
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
    } else {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    }

    toast.innerHTML = `
      <div class="toast-icon">${iconSvg}</div>
      <div class="toast-body">${message}</div>
    `;

    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 260);
    }, 3600);
  }

  /**
   * Shakes an element briefly
   * @param {HTMLElement} element 
   */
  function triggerShake(element) {
    if (!element) return;
    element.classList.remove('shake-animation');
    void element.offsetWidth; // Trigger reflow
    element.classList.add('shake-animation');
    setTimeout(() => {
      element.classList.remove('shake-animation');
    }, 550);
  }

  /**
   * Sets button loading state
   * @param {HTMLButtonElement} btn 
   * @param {boolean} isLoading 
   * @param {string} loadingText 
   */
  function setButtonLoading(btn, isLoading, loadingText = '') {
    const textSpan = btn.querySelector('.btn-text');
    const spinner = btn.querySelector('.btn-spinner');
    const arrow = btn.querySelector('.btn-arrow');

    if (isLoading) {
      btn.disabled = true;
      if (spinner) spinner.classList.remove('hidden');
      if (arrow) arrow.classList.add('hidden');
      if (textSpan && loadingText) textSpan.textContent = loadingText;
    } else {
      btn.disabled = false;
      if (spinner) spinner.classList.add('hidden');
      if (arrow) arrow.classList.remove('hidden');
    }
  }

  /**
   * Updates multi-step progress bar visually
   * @param {number} step 
   */
  function updateStepper(step) {
    state.currentStep = step;

    if (step >= 4) {
      // Hide stepper on dashboard
      elements.stepperNav.classList.add('hidden-stepper');
      return;
    } else {
      elements.stepperNav.classList.remove('hidden-stepper');
    }

    // Step 1
    if (step === 1) {
      elements.stepNode1.className = 'step-node active';
      elements.stepNode2.className = 'step-node';
      elements.stepNode3.className = 'step-node';
      elements.connector1.className = 'step-connector';
      elements.connector2.className = 'step-connector';
    } else if (step === 2) {
      elements.stepNode1.className = 'step-node completed';
      elements.stepNode2.className = 'step-node active';
      elements.stepNode3.className = 'step-node';
      elements.connector1.className = 'step-connector filled';
      elements.connector2.className = 'step-connector';
    } else if (step >= 3) {
      elements.stepNode1.className = 'step-node completed';
      elements.stepNode2.className = 'step-node completed';
      elements.stepNode3.className = step === 3 ? 'step-node active' : 'step-node completed';
      elements.connector1.className = 'step-connector filled';
      elements.connector2.className = 'step-connector filled';
    }
  }

  /**
   * Smoothly switches between pages
   * @param {HTMLElement} targetPage 
   */
  function navigateTo(targetPage) {
    const allPages = [
      elements.loginPage,
      elements.otpPage,
      elements.profilePage,
      elements.successPage,
      elements.dashboardPage
    ];

    allPages.forEach(p => {
      p.classList.remove('active');
    });

    targetPage.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --------------------------------------------------------------------------
  // 4. Page 1: Login Logic & Validation
  // --------------------------------------------------------------------------

  // Toggle Password Visibility
  elements.togglePasswordBtn.addEventListener('click', () => {
    const isPassword = elements.loginPassword.type === 'password';
    elements.loginPassword.type = isPassword ? 'text' : 'password';

    const eyeOpen = elements.togglePasswordBtn.querySelector('.eye-open');
    const eyeClosed = elements.togglePasswordBtn.querySelector('.eye-closed');

    if (isPassword) {
      eyeOpen.classList.add('hidden');
      eyeClosed.classList.remove('hidden');
      elements.togglePasswordBtn.setAttribute('aria-label', 'Hide password');
    } else {
      eyeOpen.classList.remove('hidden');
      eyeClosed.classList.add('hidden');
      elements.togglePasswordBtn.setAttribute('aria-label', 'Show password');
    }
  });

  // Auto-fill Demo Login Credentials
  elements.btnAutoFillLogin.addEventListener('click', () => {
    elements.loginUsername.value = DEMO_CONFIG.username;
    elements.loginPassword.value = DEMO_CONFIG.password;
    clearLoginErrors();
    showToast('Demo credentials filled (demo / password123)', 'info');
  });

  function clearLoginErrors() {
    elements.loginAlert.classList.add('hidden');
    elements.loginUsername.classList.remove('input-error');
    elements.loginPassword.classList.remove('input-error');
    elements.loginUserError.textContent = '';
    elements.loginPassError.textContent = '';
  }

  // Clear errors upon typing
  elements.loginUsername.addEventListener('input', () => {
    if (elements.loginUsername.classList.contains('input-error')) {
      elements.loginUsername.classList.remove('input-error');
      elements.loginUserError.textContent = '';
    }
    elements.loginAlert.classList.add('hidden');
  });

  elements.loginPassword.addEventListener('input', () => {
    if (elements.loginPassword.classList.contains('input-error')) {
      elements.loginPassword.classList.remove('input-error');
      elements.loginPassError.textContent = '';
    }
    elements.loginAlert.classList.add('hidden');
  });

  // Login Form Submission
  elements.loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearLoginErrors();

    const usernameVal = elements.loginUsername.value.trim();
    const passwordVal = elements.loginPassword.value;

    let hasFieldErrors = false;

    // 1. Check whether both fields are filled
    if (!usernameVal) {
      elements.loginUsername.classList.add('input-error');
      elements.loginUserError.textContent = 'Please enter your username or email address.';
      hasFieldErrors = true;
    }

    if (!passwordVal) {
      elements.loginPassword.classList.add('input-error');
      elements.loginPassError.textContent = 'Please enter your account password.';
      hasFieldErrors = true;
    }

    if (hasFieldErrors) {
      triggerShake(elements.loginPage);
      return;
    }

    // 2. Compare with predefined demo credentials
    const isCredMatch = (usernameVal.toLowerCase() === DEMO_CONFIG.username || usernameVal.toLowerCase() === 'demo@securegate.io') &&
                        passwordVal === DEMO_CONFIG.password;

    if (!isCredMatch) {
      // 3. Incorrect credentials:
      // Do NOT continue to the next page.
      // Show error: "Incorrect username or password. Login failed."
      // Add shake animation to login card. Keep user on login page.
      elements.loginAlertMsg.textContent = 'Incorrect username or password. Login failed.';
      elements.loginAlert.classList.remove('hidden');
      elements.loginUsername.classList.add('input-error');
      elements.loginPassword.classList.add('input-error');
      triggerShake(elements.loginPage);
      return;
    }

    // 4. Correct credentials:
    // Show short loading state
    const defaultBtnText = elements.btnLoginSubmit.querySelector('.btn-text').textContent;
    setButtonLoading(elements.btnLoginSubmit, true, 'Authenticating...');

    setTimeout(() => {
      setButtonLoading(elements.btnLoginSubmit, false);
      elements.btnLoginSubmit.querySelector('.btn-text').textContent = defaultBtnText;
      state.loginPassed = true;

      // Update email mask if email was entered
      if (usernameVal.includes('@')) {
        elements.otpTargetMask.textContent = usernameVal;
      }

      // Transition to Page 2 (2FA)
      updateStepper(2);
      navigateTo(elements.otpPage);
      startResendCountdown();

      // Focus first OTP box automatically
      setTimeout(() => {
        elements.otpDigits[0].focus();
        elements.otpDigits[0].select();
      }, 100);

      showToast('Login verified! Please enter your 2FA security code.', 'success');
    }, 700);
  });

  // --------------------------------------------------------------------------
  // 5. Page 2: Two-Factor Authentication (OTP)
  // --------------------------------------------------------------------------

  /**
   * Resend Countdown Timer
   */
  function startResendCountdown() {
    clearInterval(state.resendTimerId);
    state.resendSecondsRemaining = DEMO_CONFIG.resendDurationSeconds;
    elements.resendCountdown.classList.remove('hidden');
    elements.btnResendCode.classList.add('hidden');
    elements.resendTimerVal.textContent = `00:${state.resendSecondsRemaining.toString().padStart(2, '0')}`;

    state.resendTimerId = setInterval(() => {
      state.resendSecondsRemaining--;
      if (state.resendSecondsRemaining <= 0) {
        clearInterval(state.resendTimerId);
        elements.resendCountdown.classList.add('hidden');
        elements.btnResendCode.classList.remove('hidden');
      } else {
        elements.resendTimerVal.textContent = `00:${state.resendSecondsRemaining.toString().padStart(2, '0')}`;
      }
    }, 1000);
  }

  // Resend Button Click
  elements.btnResendCode.addEventListener('click', () => {
    if (state.isLockedOut) return;
    startResendCountdown();
    showToast('New verification code generated: 123456', 'info');
  });

  // Back to Login Button Click
  elements.backToLoginBtn.addEventListener('click', () => {
    updateStepper(1);
    navigateTo(elements.loginPage);
  });

  // Auto-fill Demo OTP Button
  elements.btnAutoFillOtp.addEventListener('click', () => {
    if (state.isLockedOut) return;
    fillOtpCode(DEMO_CONFIG.otp);
    showToast('Demo OTP filled (123456)', 'info');
  });

  function fillOtpCode(code) {
    const digits = code.split('').slice(0, 6);
    elements.otpDigits.forEach((input, idx) => {
      input.value = digits[idx] || '';
      input.classList.remove('otp-error');
      if (input.value) {
        input.classList.add('otp-filled');
      } else {
        input.classList.remove('otp-filled');
      }
    });
    elements.otpAlert.classList.add('hidden');
    elements.otpDigits[5].focus();
  }

  function getEnteredOtp() {
    return elements.otpDigits.map(d => d.value.trim()).join('');
  }

  function clearOtpInputs() {
    elements.otpDigits.forEach(d => {
      d.value = '';
      d.classList.remove('otp-filled', 'otp-error');
    });
  }

  // OTP Input event listeners (Numeric only, auto-advance, backspace, paste)
  elements.otpDigits.forEach((input, index) => {
    // Input event
    input.addEventListener('input', (e) => {
      const val = e.target.value;

      // Filter out non-numeric characters
      const cleanVal = val.replace(/[^0-9]/g, '');
      input.value = cleanVal;

      if (cleanVal) {
        input.classList.add('otp-filled');
        input.classList.remove('otp-error');
        elements.otpAlert.classList.add('hidden');

        // Move to next box if not the last
        if (index < elements.otpDigits.length - 1) {
          elements.otpDigits[index + 1].focus();
          elements.otpDigits[index + 1].select();
        }
      } else {
        input.classList.remove('otp-filled');
      }

      // If all 6 filled, trigger verification automatically or wait for submit
      if (getEnteredOtp().length === 6) {
        // slight delay for visual satisfaction
        setTimeout(() => {
          elements.btnVerifyOtp.focus();
        }, 120);
      }
    });

    // Keydown handling for backspace & arrows
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace') {
        if (!input.value && index > 0) {
          elements.otpDigits[index - 1].focus();
          elements.otpDigits[index - 1].value = '';
          elements.otpDigits[index - 1].classList.remove('otp-filled', 'otp-error');
        } else {
          input.value = '';
          input.classList.remove('otp-filled', 'otp-error');
        }
      } else if (e.key === 'ArrowLeft' && index > 0) {
        elements.otpDigits[index - 1].focus();
      } else if (e.key === 'ArrowRight' && index < elements.otpDigits.length - 1) {
        elements.otpDigits[index + 1].focus();
      }
    });

    // Paste event handling: distributes characters across boxes
    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const pastedData = (e.clipboardData || window.clipboardData).getData('text');
      const numericDigits = pastedData.replace(/[^0-9]/g, '').slice(0, 6);

      if (numericDigits.length > 0) {
        fillOtpCode(numericDigits);
        showToast(`Pasted OTP code (${numericDigits})`, 'info');
      }
    });
  });

  // OTP Form Submission
  elements.otpForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (state.isLockedOut) {
      showToast('Account is temporarily locked. Please wait for the lockout countdown.', 'error');
      return;
    }

    const enteredOtp = getEnteredOtp();

    if (enteredOtp.length < 6) {
      elements.otpAlertMsg.textContent = 'Please enter all 6 verification digits.';
      elements.attemptsRemainingText.textContent = `${state.remainingOtpAttempts} attempt(s) remaining`;
      elements.otpAlert.classList.remove('hidden');
      elements.otpDigits.forEach(d => {
        if (!d.value) d.classList.add('otp-error');
      });
      triggerShake(elements.otpPage);
      return;
    }

    // Check OTP Match
    if (enteredOtp === DEMO_CONFIG.otp) {
      // Correct OTP → continue to Page 3 — Personal Details
      clearOtpErrors();
      setButtonLoading(elements.btnVerifyOtp, true, 'Verifying...');

      setTimeout(() => {
        setButtonLoading(elements.btnVerifyOtp, false);
        state.otpPassed = true;

        // Auto-seed email if user logged in with an email
        const loginUser = elements.loginUsername.value.trim();
        if (loginUser.includes('@') && !elements.email.value) {
          elements.email.value = loginUser;
        }

        updateStepper(3);
        navigateTo(elements.profilePage);
        showToast('Identity verified! Please complete your profile details.', 'success');
      }, 700);

    } else {
      // Incorrect OTP → remain on 2FA page
      state.remainingOtpAttempts--;
      elements.otpDigits.forEach(d => d.classList.add('otp-error'));
      triggerShake(elements.otpPage);

      if (state.remainingOtpAttempts <= 0) {
        // Trigger Temporary Lockout
        triggerLockout();
      } else {
        // Show: "Incorrect verification code. Please try again."
        elements.otpAlertMsg.textContent = 'Incorrect verification code. Please try again.';
        elements.attemptsRemainingText.textContent = `${state.remainingOtpAttempts} attempt(s) remaining`;
        elements.otpAlert.classList.remove('hidden');
      }
    }
  });

  function clearOtpErrors() {
    elements.otpAlert.classList.add('hidden');
    elements.otpDigits.forEach(d => d.classList.remove('otp-error'));
  }

  /**
   * Activates Temporary 30s Lockout after exceeding demo attempts
   */
  function triggerLockout() {
    state.isLockedOut = true;
    elements.otpAlert.classList.add('hidden');
    elements.lockoutAlert.classList.remove('hidden');
    
    // Disable inputs and button
    elements.otpDigits.forEach(d => d.disabled = true);
    elements.btnVerifyOtp.disabled = true;
    elements.btnResendCode.disabled = true;

    let secondsLeft = DEMO_CONFIG.lockoutDurationSeconds;
    elements.lockoutSeconds.textContent = secondsLeft;

    showToast('Too many failed attempts. Temporary lockout initiated (30s).', 'error');

    clearInterval(state.lockoutTimerId);
    state.lockoutTimerId = setInterval(() => {
      secondsLeft--;
      elements.lockoutSeconds.textContent = secondsLeft;

      if (secondsLeft <= 0) {
        clearInterval(state.lockoutTimerId);
        // Release Lockout
        state.isLockedOut = false;
        state.remainingOtpAttempts = DEMO_CONFIG.maxOtpAttempts;
        elements.lockoutAlert.classList.add('hidden');
        elements.otpDigits.forEach(d => {
          d.disabled = false;
          d.value = '';
          d.classList.remove('otp-error', 'otp-filled');
        });
        elements.btnVerifyOtp.disabled = false;
        elements.btnResendCode.disabled = false;
        elements.otpDigits[0].focus();
        showToast('Lockout expired. You may retry entering your 6-digit OTP.', 'info');
      }
    }, 1000);
  }

  // --------------------------------------------------------------------------
  // 6. Page 3: Personal Details Form Validation & Submission
  // --------------------------------------------------------------------------

  // Restrict phone input to numeric digits only on keyboard input
  elements.phone.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
    validateField(elements.phone, elements.errPhone, validatePhone);
  });

  // Restrict roll number to alphanumeric values (letters, numbers, hyphen, underscore)
  elements.rollNumber.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^A-Za-z0-9\-_]/g, '');
    validateField(elements.rollNumber, elements.errRollNumber, validateRollNumber);
  });

  // Back button returns to 2FA Page
  elements.btnBackToOtp.addEventListener('click', () => {
    updateStepper(2);
    navigateTo(elements.otpPage);
  });

  // Auto-Fill Sample Profile Button
  elements.btnFillSampleProfile.addEventListener('click', () => {
    elements.fullName.value = 'Alex Morgan';
    elements.dob.value = '2002-08-14';
    elements.gender.value = 'Female';
    elements.phone.value = '9876543210';
    elements.email.value = 'alex.morgan@securegate.io';
    elements.occupation.value = 'Student';
    elements.rollNumber.value = 'CS2026-8942';
    elements.college.value = 'MIT Computer Science & AI Lab';
    elements.course.value = 'Cybersecurity & Distributed Systems';
    elements.semester.value = '3rd Year / Semester 5';
    elements.address.value = '77 Massachusetts Avenue, Suite 400';
    elements.city.value = 'Cambridge';
    elements.stateField.value = 'Massachusetts';
    elements.country.value = 'United States';
    elements.zip.value = '02139';

    // Clear any previous error styling
    clearAllProfileErrors();
    showToast('Sample profile data loaded!', 'info');
  });

  function clearAllProfileErrors() {
    elements.profileAlert.classList.add('hidden');
    const allInputs = elements.profileDetailsForm.querySelectorAll('.form-input');
    allInputs.forEach(i => i.classList.remove('input-error'));
    const allFeedbacks = elements.profileDetailsForm.querySelectorAll('.inline-feedback');
    allFeedbacks.forEach(f => f.textContent = '');
  }

  // Field Validation Helpers
  function validateRequired(val) {
    return val && val.trim().length > 0;
  }

  function validateEmail(val) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(val.trim());
  }

  function validatePhone(val) {
    const clean = val.replace(/[^0-9]/g, '');
    return clean.length >= 7 && clean.length <= 15;
  }

  function validateRollNumber(val) {
    const alphanumericRegex = /^[A-Za-z0-9\-_]{2,30}$/;
    return alphanumericRegex.test(val.trim());
  }

  function validateZip(val) {
    return val.trim().length >= 3 && val.trim().length <= 12;
  }

  /**
   * Validates a single input element and updates its inline message
   * @param {HTMLElement} input 
   * @param {HTMLElement} feedbackEl 
   * @param {Function} validatorFn 
   * @param {string} customMsg 
   * @returns {boolean}
   */
  function validateField(input, feedbackEl, validatorFn, customMsg = '') {
    const isValid = validatorFn(input.value);
    if (!isValid) {
      input.classList.add('input-error');
      feedbackEl.textContent = customMsg || 'This field is required or invalid.';
      return false;
    } else {
      input.classList.remove('input-error');
      feedbackEl.textContent = '';
      return true;
    }
  }

  // Bind live blur / change validations to all inputs
  const fieldValidationRules = [
    { input: elements.fullName, err: elements.errFullName, fn: validateRequired, msg: 'Please enter your full name.' },
    { input: elements.dob, err: elements.errDob, fn: validateRequired, msg: 'Please provide your date of birth.' },
    { input: elements.gender, err: elements.errGender, fn: validateRequired, msg: 'Please select your gender.' },
    { input: elements.phone, err: elements.errPhone, fn: validatePhone, msg: 'Please enter a valid numeric phone number (7-15 digits).' },
    { input: elements.email, err: elements.errEmail, fn: validateEmail, msg: 'Please enter a valid email address.' },
    { input: elements.occupation, err: elements.errOccupation, fn: validateRequired, msg: 'Please select an occupation.' },
    { input: elements.rollNumber, err: elements.errRollNumber, fn: validateRollNumber, msg: 'Roll number must be alphanumeric (2-30 characters).' },
    { input: elements.college, err: elements.errCollege, fn: validateRequired, msg: 'Please enter your college or organization.' },
    { input: elements.course, err: elements.errCourse, fn: validateRequired, msg: 'Please specify your course or department.' },
    { input: elements.semester, err: elements.errSemester, fn: validateRequired, msg: 'Please select your semester or year.' },
    { input: elements.address, err: elements.errAddress, fn: validateRequired, msg: 'Please enter your street address.' },
    { input: elements.city, err: elements.errCity, fn: validateRequired, msg: 'Please enter your city.' },
    { input: elements.stateField, err: elements.errState, fn: validateRequired, msg: 'Please enter your state or province.' },
    { input: elements.country, err: elements.errCountry, fn: validateRequired, msg: 'Please enter your country.' },
    { input: elements.zip, err: elements.errZip, fn: validateZip, msg: 'Please enter a valid PIN or ZIP code.' }
  ];

  fieldValidationRules.forEach(rule => {
    rule.input.addEventListener('blur', () => {
      if (rule.input.value.trim() !== '') {
        validateField(rule.input, rule.err, rule.fn, rule.msg);
      }
    });

    rule.input.addEventListener('input', () => {
      if (rule.input.classList.contains('input-error')) {
        validateField(rule.input, rule.err, rule.fn, rule.msg);
      }
    });
  });

  // Profile Form Submission
  elements.profileDetailsForm.addEventListener('submit', (e) => {
    e.preventDefault();

    let allValid = true;
    let firstInvalidInput = null;

    fieldValidationRules.forEach(rule => {
      const isValid = validateField(rule.input, rule.err, rule.fn, rule.msg);
      if (!isValid) {
        allValid = false;
        if (!firstInvalidInput) {
          firstInvalidInput = rule.input;
        }
      }
    });

    if (!allValid) {
      elements.profileAlertMsg.textContent = 'Please resolve the highlighted validation errors before continuing.';
      elements.profileAlert.classList.remove('hidden');
      triggerShake(elements.profilePage);

      if (firstInvalidInput) {
        firstInvalidInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstInvalidInput.focus();
      }
      return;
    }

    // Save validated data into application state
    state.profileData = {
      fullName: elements.fullName.value.trim(),
      dob: elements.dob.value,
      gender: elements.gender.value,
      phone: elements.phone.value.trim(),
      email: elements.email.value.trim(),
      occupation: elements.occupation.value,
      rollNumber: elements.rollNumber.value.trim(),
      college: elements.college.value.trim(),
      course: elements.course.value.trim(),
      semester: elements.semester.value,
      address: elements.address.value.trim(),
      city: elements.city.value.trim(),
      state: elements.stateField.value.trim(),
      country: elements.country.value.trim(),
      zip: elements.zip.value.trim()
    };

    // When Save & Continue is clicked with valid info:
    // 1. Show short loading state
    setButtonLoading(elements.btnSaveProfile, true, 'Saving Profile...');

    setTimeout(() => {
      setButtonLoading(elements.btnSaveProfile, false);
      state.profilePassed = true;

      // Update success card summary values
      elements.successSummaryName.textContent = state.profileData.fullName;
      elements.successSummaryOrg.textContent = `${state.profileData.course} @ ${state.profileData.college}`;

      // 2. Display success page (Page 3b)
      updateStepper(3); // Marked complete
      navigateTo(elements.successPage);
      showToast('Profile completed successfully!', 'success');
    }, 700);
  });

  // --------------------------------------------------------------------------
  // 7. Page 3b: Success Page -> Dashboard Transition
  // --------------------------------------------------------------------------
  elements.btnGoToDashboard.addEventListener('click', () => {
    populateDashboard(state.profileData);
    updateStepper(4); // hides stepper
    navigateTo(elements.dashboardPage);
    showToast('Welcome to your SecureGate Dashboard!', 'success');
  });

  /**
   * Populates Page 4 Dashboard with exact submitted values
   * @param {Object} data 
   */
  function populateDashboard(data) {
    elements.dashUserName.textContent = data.fullName || 'Authorized User';
    
    // Compute avatar initials
    const nameParts = (data.fullName || 'User').split(' ').filter(Boolean);
    let initials = nameParts[0] ? nameParts[0][0].toUpperCase() : 'U';
    if (nameParts.length > 1) {
      initials += nameParts[nameParts.length - 1][0].toUpperCase();
    }
    elements.dashAvatarInitials.textContent = initials;

    elements.dashRoleBadge.textContent = data.occupation || 'Student';
    elements.dashTimestamp.textContent = new Date().toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Session random code for realism
    elements.dashSessionId.textContent = `SG-${Math.floor(1000 + Math.random() * 9000)}-${initials}`;

    // Academic
    elements.dashOccupation.textContent = data.occupation || '—';
    elements.dashRollNumber.textContent = data.rollNumber || '—';
    elements.dashCourse.textContent = data.course || '—';
    elements.dashCollege.textContent = data.college || '—';
    elements.dashSemester.textContent = data.semester || '—';

    // Personal & Contact
    elements.dashFullName.textContent = data.fullName || '—';
    elements.dashEmail.textContent = data.email || '—';
    elements.dashPhone.textContent = data.phone || '—';
    elements.dashDob.textContent = data.dob || '—';
    elements.dashGender.textContent = data.gender || '—';

    // Address Coordinates
    elements.dashAddress.textContent = data.address || '—';
    elements.dashCity.textContent = data.city || '—';
    elements.dashState.textContent = data.state || '—';
    elements.dashCountry.textContent = data.country || '—';
    elements.dashZip.textContent = data.zip || '—';
  }

  // --------------------------------------------------------------------------
  // 8. Page 4: Dashboard Logout Handler
  // --------------------------------------------------------------------------
  elements.btnLogoutBtn.addEventListener('click', () => {
    // Reset state & return to Login Page
    state.loginPassed = false;
    state.otpPassed = false;
    state.profilePassed = false;
    state.remainingOtpAttempts = DEMO_CONFIG.maxOtpAttempts;

    // Reset fields
    elements.loginPassword.value = '';
    clearLoginErrors();
    clearOtpInputs();
    clearOtpErrors();
    clearAllProfileErrors();

    updateStepper(1);
    navigateTo(elements.loginPage);
    showToast('You have been logged out of SecureGate.', 'info');
  });

  // Clicking brand logo from top returns to current step or login
  elements.brandLogoBtn.addEventListener('click', () => {
    if (state.currentStep >= 4) {
      navigateTo(elements.dashboardPage);
    } else if (state.currentStep === 3) {
      navigateTo(elements.profilePage);
    } else if (state.currentStep === 2) {
      navigateTo(elements.otpPage);
    } else {
      navigateTo(elements.loginPage);
    }
  });

  // --------------------------------------------------------------------------
  // 9. Modals Logic (Alternate 2FA Methods & Info Dialogs)
  // --------------------------------------------------------------------------

  // Open Alternate 2FA Methods Modal
  elements.altMethodsBtn.addEventListener('click', () => {
    elements.altMethodsModal.classList.remove('hidden');
  });

  function closeAltModal() {
    elements.altMethodsModal.classList.add('hidden');
  }

  elements.closeAltModalBtn.addEventListener('click', closeAltModal);
  elements.cancelAltModalBtn.addEventListener('click', closeAltModal);

  // Select Method inside Modal
  const methodOptions = elements.altMethodsModal.querySelectorAll('.method-option-card');
  let selectedMethod = 'email';

  methodOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      methodOptions.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      selectedMethod = opt.getAttribute('data-method');
    });
  });

  elements.confirmAltModalBtn.addEventListener('click', () => {
    closeAltModal();
    if (selectedMethod === 'sms') {
      elements.otpTargetMask.textContent = '+1 (•••) •••-4290';
      showToast('Switched to SMS verification. New code sent: 123456', 'info');
    } else if (selectedMethod === 'totp') {
      elements.otpTargetMask.textContent = 'Authenticator App (TOTP)';
      showToast('Switched to Authenticator App. Demo code remains: 123456', 'info');
    } else if (selectedMethod === 'fido') {
      showToast('Hardware Passkey detected. Use code 123456 to verify session.', 'info');
    } else {
      elements.otpTargetMask.textContent = 'd***@securegate.io';
      showToast('Using Primary Email verification. Code: 123456', 'info');
    }
    startResendCountdown();
  });

  // Info Modal (Forgot Password & Create Account)
  function showInfoModal(title, message) {
    elements.infoModalTitle.textContent = title;
    elements.infoModalBody.textContent = message;
    elements.infoModal.classList.remove('hidden');
  }

  function closeInfoModal() {
    elements.infoModal.classList.add('hidden');
  }

  elements.closeInfoModalBtn.addEventListener('click', closeInfoModal);
  elements.ackInfoModalBtn.addEventListener('click', closeInfoModal);

  elements.forgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    showInfoModal(
      'Demo Password Reset',
      'In this prototype sandbox, default credentials are predefined. Please use Username: "demo" and Password: "password123" to proceed through the demo flow.'
    );
  });

  elements.createAccountLink.addEventListener('click', (e) => {
    e.preventDefault();
    showInfoModal(
      'Prototype Registration Sandbox',
      'SecureGate is currently in local prototype evaluation mode. To evaluate the registration and profile onboarding pipeline, sign in with "demo" / "password123" to experience the 2FA and full profile setup workflow.'
    );
  });

  // Close modals when clicking backdrop or pressing Escape
  window.addEventListener('click', (e) => {
    if (e.target === elements.altMethodsModal) closeAltModal();
    if (e.target === elements.infoModal) closeInfoModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAltModal();
      closeInfoModal();
    }
  });

  // Initialize view
  updateStepper(1);
  navigateTo(elements.loginPage);
});
