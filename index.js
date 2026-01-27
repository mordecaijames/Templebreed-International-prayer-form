const form = document.getElementById("dataForm");
const statusDiv = document.getElementById("status");
const submitBtn = document.getElementById("submitBtn");
const formContainer = document.getElementById("formContainer");
const successContainer = document.getElementById("successContainer");

// ✅ Your actual Google Apps Script URL
const scriptURL = "https://script.google.com/macros/s/AKfycbzdcYq5C_mPMNJ4vAa_PfNqLfUmrWhWJsWpYd32S2fI7IJ_Xha2AKq0BnOcQ7chFuU9/exec";

const allowedTimes = [
  "11pm - 12am",
  "12am - 1am",
  "1am - 2am",
  "2am - 3am",
  "3am - 4am",
  "4am - 5am",
  "5am - 6am",
  "10pm - 11pm"
];

// Email validation
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Phone validation
function validatePhone(phone) {
  const re = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
  return re.test(phone.replace(/\s/g, ''));
}

// Status display
function showStatus(message, type = 'info') {
  statusDiv.textContent = message;
  statusDiv.className = type;
  statusDiv.style.opacity = "1";
  
  statusDiv.animate([
    { transform: 'scale(0.9)', opacity: 0 },
    { transform: 'scale(1.05)', opacity: 1 },
    { transform: 'scale(1)', opacity: 1 }
  ], { 
    duration: 400,
    easing: 'ease-out'
  });
}

// Toggle loading state
function setLoading(isLoading) {
  const btnText = submitBtn.querySelector('.btn-text');
  const spinner = submitBtn.querySelector('.spinner');
  
  if (isLoading) {
    submitBtn.disabled = true;
    btnText.textContent = 'Submitting...';
    spinner.style.display = 'inline-block';
  } else {
    submitBtn.disabled = false;
    btnText.textContent = 'Submit';
    spinner.style.display = 'none';
  }
}

// Show success page
function showSuccessPage() {
  // Hide form container with fade out animation
  formContainer.style.animation = 'fadeOut 0.5s ease-out forwards';
  
  setTimeout(() => {
    formContainer.style.display = 'none';
    successContainer.style.display = 'block';
    
    // Scroll to top smoothly
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, 500);
}

// Add fadeOut animation to CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeOut {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(-20px);
    }
  }
`;
document.head.appendChild(style);

// Form submit handler
form.addEventListener("submit", function (e) {
  e.preventDefault();
  
  statusDiv.textContent = "";
  statusDiv.className = "";
  
  const formData = new FormData(form);
  const selectedTime = formData.get("prayer_time");
  const email = formData.get("email").trim();
  const phone = formData.get("phone").trim();
  
  // Validate prayer time
  if (!allowedTimes.includes(selectedTime)) {
    showStatus("⚠️ Prayer time must be between 10PM and 6:00 AM", "warning");
    return;
  }
  
  // Validate email
  if (!validateEmail(email)) {
    showStatus("⚠️ Please enter a valid email address", "warning");
    document.getElementById("email").focus();
    return;
  }
  
  // Validate phone
  if (!validatePhone(phone)) {
    showStatus("⚠️ Please enter a valid phone number", "warning");
    document.getElementById("phone").focus();
    return;
  }
  
  // Show loading
  setLoading(true);
  showStatus("Sending your request...", "info");

  // Submit
  fetch(scriptURL, {
    method: "POST",
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      setLoading(false);

      if (!data.success) {
        showStatus("✗ " + data.message, "error");
        return;
      }

      // Show success page instead of just a message
      showSuccessPage();
    })
    .catch(error => {
      setLoading(false);
      showStatus("✗ Submission failed. Please try again.", "error");
      console.error("Submission Error:", error);

      setTimeout(() => {
        statusDiv.style.opacity = "0";
        setTimeout(() => {
          statusDiv.textContent = "";
          statusDiv.className = "";
        }, 300);
      }, 7000);
    });
});

// Clear status on typing
form.addEventListener("input", function() {
  if (statusDiv.className === 'error' || statusDiv.className === 'warning') {
    statusDiv.style.opacity = "0";
    setTimeout(() => {
      statusDiv.textContent = "";
      statusDiv.className = "";
    }, 300);
  }
});