document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const status = document.getElementById('status');

  // Form submit handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    // Validate fields
    if (!name || !email || !message) {
      showStatus("Please fill in all fields ❌", "error");
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showStatus("Please enter a valid email address ❌", "error");
      return;
    }

    // Show loading
    setButtonLoading(true);
    showStatus("Saving your message...", "loading");

    try {
      // POST to backend
      const res = await fetch("https://vikram-portfolio-mgq7.onrender.com/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      if (res.ok) {
        const data = await res.json();
        showStatus(`✅ ${data.message} <br><small>Email captured: ${data.email}</small>`, "success");
        form.reset();

        // Success animation
        submitBtn.style.background = "linear-gradient(135deg, #10b981, #059669)";
        setTimeout(() => submitBtn.style.background = "", 2000);
      } else {
        const errorText = await res.text();
        showStatus("Failed to save message: " + errorText + " ❌", "error");
      }

    } catch (err) {
      console.error("Error:", err);
      showStatus("Unable to connect to server ❌", "error");
    } finally {
      setButtonLoading(false);
    }
  });

  // Status message function
  function showStatus(message, type) {
    status.innerHTML = message;
    status.className = "show";
    status.classList.remove("success", "error", "loading");

    if (type === "success") {
      status.style.cssText = "color:#10b981;background:#d1fae5;border:2px solid #10b981;padding:10px;margin:10px 0;";
    } else if (type === "error") {
      status.style.cssText = "color:#ef4444;background:#fee2e2;border:2px solid #ef4444;padding:10px;margin:10px 0;";
    } else if (type === "loading") {
      status.style.cssText = "color:#3b82f6;background:#dbeafe;border:2px solid #3b82f6;padding:10px;margin:10px 0;";
    }

    if (type !== "loading") {
      setTimeout(() => {
        status.innerHTML = "";
        status.className = "";
      }, 5000);
    }
  }

  // Button loading state
  function setButtonLoading(isLoading) {
    const buttonText = submitBtn.querySelector('span');
    const buttonIcon = submitBtn.querySelector('i');

    if (isLoading) {
      submitBtn.disabled = true;
      buttonText.textContent = "Saving...";
      buttonIcon.className = "fas fa-spinner fa-spin";
      submitBtn.style.cursor = "not-allowed";
      submitBtn.style.opacity = "0.7";
    } else {
      submitBtn.disabled = false;
      buttonText.textContent = "Send Message";
      buttonIcon.className = "fas fa-paper-plane";
      submitBtn.style.cursor = "pointer";
      submitBtn.style.opacity = "1";
    }
  }

  // Input border feedback
  const inputs = form.querySelectorAll('input, textarea');
  inputs.forEach(input => {
    input.addEventListener('blur', function() {
      this.style.borderColor = this.value.trim() === '' && this.hasAttribute('required') ? '#ef4444' : '#10b981';
    });

    input.addEventListener('focus', function() {
      this.style.borderColor = '#2563eb';
    });
  });

  // Scroll animations
  const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -100px 0px' };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
  });
});