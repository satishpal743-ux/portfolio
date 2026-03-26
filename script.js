document.addEventListener('DOMContentLoaded', () => {
  const SAMPLE_ACHIEVEMENTS = [
    {
      icon: "🏆",
      title: "Hackathon Winner — College Tech Fest",
      description: "1st place at the annual college hackathon for building an AI-based health tracker.",
      year: "2024",
    },
    {
      icon: "🥇",
      title: "Academic Excellence Award",
      description: "Ranked in the top 5% of the batch with a GPA of 9.2/10 in second semester.",
      year: "2023",
    },
    {
      icon: "🎓",
      title: "Google Cloud Certified",
      description: "Completed the Google Cloud Associate certification via the Student Developer Program.",
      year: "2024",
    },
  ];

  const SKILLS = [
    { name: "HTML & CSS", icon: "🌐", level: 85, label: "Advanced" },
    { name: "JavaScript", icon: "⚡", level: 75, label: "Intermediate" },
    { name: "Python", icon: "🐍", level: 80, label: "Advanced" },
    { name: "React.js", icon: "⚛️", level: 65, label: "Intermediate" },
    { name: "Node.js", icon: "🟢", level: 60, label: "Intermediate" },
    { name: "SQL / Database", icon: "🗄️", level: 70, label: "Intermediate" },
    { name: "Git & GitHub", icon: "🔧", level: 78, label: "Advanced" },
    { name: "Machine Learning", icon: "🤖", level: 55, label: "Beginner+" },
  ];

  const form = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const status = document.getElementById('status');

  async function fetchProfile() {
    try {
      const res = await fetch('/profile');
      const data = await res.json();
      if (data.success && data.profile) {
        document.getElementById('nav-name').textContent = data.profile.name;
        document.getElementById('hero-title').textContent = data.profile.title;
        document.getElementById('aboutParagraph').textContent = data.profile.about;
        document.getElementById('locationField').textContent = data.profile.location;
        document.getElementById('emailField').textContent = data.profile.email;
        document.getElementById('phoneField').textContent = data.profile.phone;
        document.getElementById('githubField').href = data.profile.github;
        document.getElementById('githubField').textContent = data.profile.github;
        document.getElementById('profileImage').src = data.profile.photoUrl || 'photoo.jpg.jpg';
        document.getElementById('resumeDownload').href = data.profile.resumeUrl || 'resume.pdf.pdf';

        const skillsGrid = document.getElementById('skillsGrid');
        skillsGrid.innerHTML = '';
        const profileSkills = Array.isArray(data.profile.skills) && data.profile.skills.length ? data.profile.skills : SKILLS;
        profileSkills.forEach((skill) => {
          const card = document.createElement('div');
          card.className = 'card';
          const iconClass = skill.icon || 'fa-solid fa-circle-chevron-right';
          const label = skill.label ? ` <span class="skill-level">${skill.label}</span>` : '';
          card.innerHTML = `<i class='${iconClass}'></i> ${skill.name || skill}${label}`;
          skillsGrid.appendChild(card);
        });
      }
    } catch (err) {
      console.error('Profile load failed', err);
    }
  }

  async function fetchAchievements() {
    try {
      const res = await fetch('/achievements');
      const data = await res.json();
      if (data.success && Array.isArray(data.achievements)) {
        const list = document.getElementById('achievementsList');
        list.innerHTML = '';
        const achievements = data.achievements.length ? data.achievements : SAMPLE_ACHIEVEMENTS;
        achievements.forEach((item) => {
          const li = document.createElement('li');
          li.className = 'achievement-item';
          const icon = item.icon ? `${item.icon} ` : '';
          const year = item.year || item.date || '';
          li.innerHTML = `<strong>${icon}${item.title}</strong> ${year ? `<em>(${year})</em>` : ''}<p>${item.description}</p>`;
          list.appendChild(li);
        });
      }
    } catch (err) {
      console.error('Achievements load failed', err);
    }
  }

  function createParticles(count = 90) {
    const container = document.getElementById('particle-bg');
    if (!container) return;
    container.innerHTML = '';

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const size = 3 + Math.random() * 10;
      p.style.left = `${x}vw`;
      p.style.top = `${y}vh`;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.animationDuration = `${4 + Math.random() * 8}s`;
      p.style.opacity = `${0.2 + Math.random() * 0.8}`;
      container.appendChild(p);
    }
  }

  createParticles();
  setInterval(() => createParticles(), 9000);

  fetchProfile();
  fetchAchievements();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!name || !email || !message) {
      showStatus('Please fill in all fields ❌', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showStatus('Please enter a valid email address ❌', 'error');
      return;
    }

    setButtonLoading(true);
    showStatus('Saving your message...', 'loading');

    try {
      const res = await fetch('/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });

      if (res.ok) {
        const data = await res.json();
        showStatus(`✅ ${data.message} <br><small>Email captured: ${data.email}</small>`, 'success');
        form.reset();
      } else {
        const errorText = await res.text();
        showStatus('Failed to save message: ' + errorText + ' ❌', 'error');
      }
    } catch (err) {
      console.error('Error:', err);
      showStatus('Unable to connect to server ❌', 'error');
    } finally {
      setButtonLoading(false);
    }
  });

  function showStatus(message, type) {
    status.innerHTML = message;
    status.className = 'show';
    status.classList.remove('success', 'error', 'loading');

    if (type === 'success') {
      status.style.cssText = 'color:#10b981;background:#d1fae5;border:2px solid #10b981;padding:10px;margin:10px 0;';
    } else if (type === 'error') {
      status.style.cssText = 'color:#ef4444;background:#fee2e2;border:2px solid #ef4444;padding:10px;margin:10px 0;';
    } else if (type === 'loading') {
      status.style.cssText = 'color:#3b82f6;background:#dbeafe;border:2px solid #3b82f6;padding:10px;margin:10px 0;';
    }

    if (type !== 'loading') {
      setTimeout(() => {
        status.innerHTML = '';
        status.className = '';
      }, 5000);
    }
  }

  function setButtonLoading(isLoading) {
    const buttonText = submitBtn.querySelector('span');
    const buttonIcon = submitBtn.querySelector('i');

    if (isLoading) {
      submitBtn.disabled = true;
      buttonText.textContent = 'Saving...';
      buttonIcon.className = 'fas fa-spinner fa-spin';
      submitBtn.style.cursor = 'not-allowed';
      submitBtn.style.opacity = '0.7';
    } else {
      submitBtn.disabled = false;
      buttonText.textContent = 'Send Message';
      buttonIcon.className = 'fas fa-paper-plane';
      submitBtn.style.cursor = 'pointer';
      submitBtn.style.opacity = '1';
    }
  }

  const inputs = form.querySelectorAll('input, textarea');
  inputs.forEach(input => {
    input.addEventListener('blur', function() {
      this.style.borderColor = this.value.trim() === '' && this.hasAttribute('required') ? '#ef4444' : '#10b981';
    });

    input.addEventListener('focus', function() {
      this.style.borderColor = '#2563eb';
    });
  });

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
