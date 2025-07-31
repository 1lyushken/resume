// Валидация формы
function validateForm() {
  const name = document.querySelector('input[name="name"]').value;
  const email = document.querySelector('input[name="email"]').value;
  const message = document.querySelector('textarea[name="message"]').value;
  const formMessage = document.getElementById('formMessage');

  if (!name || !email || !message) {
    formMessage.textContent = "Пожалуйста, заполните все поля.";
    formMessage.style.color = "red";
    return false;
  }

  formMessage.textContent = "Сообщение отправляется...";
  formMessage.style.color = "green";
  return true;
}

// Раскрытие и сворачивание секций при клике на заголовок
document.querySelectorAll('.toggle-section').forEach(section => {
  const header = section.querySelector('.section-header');
  const btn = section.querySelector('.toggle-btn');
  const content = section.querySelector('.section-content');

  header.addEventListener('click', () => {
    const isOpen = content.classList.contains('open');
    content.classList.toggle('open');
    btn.textContent = isOpen ? '+' : '−';
  });
});

header.addEventListener('click', (e) => {
  if (e.target.classList.contains('toggle-btn')) return;

  const isOpen = content.classList.contains('open');
  content.classList.toggle('open');
  btn.textContent = isOpen ? '+' : '−';
});

(() => {
  const canvas = document.getElementById('abstract-bg');
  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;
  const particles = [];
  const PARTICLE_COUNT = Math.min(120, Math.floor((width * height) / 6000));
  const MAX_DIST = 140;
  const mouse = { x: null, y: null, radius: 100 };

  // утилита: случайное в диапазоне
  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = rand(0, width);
      this.y = rand(0, height);
      const speed = rand(0.1, 0.6);
      const angle = rand(0, Math.PI * 2);
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.size = rand(1.5, 3.5);
      this.phase = Math.random() * Math.PI * 2; // для пульсации
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;

      // циклически выход за границы
      if (this.x < -20) this.x = width + 20;
      if (this.x > width + 20) this.x = -20;
      if (this.y < -20) this.y = height + 20;
      if (this.y > height + 20) this.y = -20;

      // лёгкая пульсация
      this.phase += 0.03;
    }
    draw() {
      const pulse = 0.5 + Math.sin(this.phase) * 0.3; // от 0.2 до 0.8
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * pulse, 0, Math.PI * 2);
      const gradient = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, this.size * pulse * 3
      );
      // цветовая смена по времени
      const t = (Date.now() * 0.00008) % 1;
      const hue = Math.floor(220 + Math.sin(t * Math.PI * 2) * 40); // 180–260
      gradient.addColorStop(0, `hsla(${hue}, 70%, 70%, 0.9)`);
      gradient.addColorStop(1, `hsla(${hue}, 70%, 30%, 0)`);
      ctx.fillStyle = gradient;
      ctx.fill();
    }
  }

  function initParticles() {
    particles.length = 0;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < MAX_DIST) {
          const alpha = 0.25 * (1 - dist / MAX_DIST);
          // если мышь рядом — усилить
          if (mouse.x !== null) {
            const dmx = (a.x + b.x) / 2 - mouse.x;
            const dmy = (a.y + b.y) / 2 - mouse.y;
            const dMouse = Math.hypot(dmx, dmy);
            if (dMouse < mouse.radius) {
              // ближе к мыши — ярче и чуть толще
              ctx.lineWidth = 1.2;
              ctx.strokeStyle = `hsla(200, 80%, 80%, ${Math.min(0.6, alpha + 0.2)})`;
            } else {
              ctx.lineWidth = 0.7;
              ctx.strokeStyle = `hsla(200, 80%, 80%, ${alpha})`;
            }
          } else {
            ctx.lineWidth = 0.7;
            ctx.strokeStyle = `hsla(200, 80%, 80%, ${alpha})`;
          }
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    // слегка затемнённый слой для эффекта “тумана”
    ctx.fillStyle = 'rgba(10, 20, 50, 0.26)';
    ctx.fillRect(0, 0, width, height);

    // обновление и отрисовка частиц
    particles.forEach(p => {
      p.update();
      p.draw();
    });

    drawConnections();
    requestAnimationFrame(animate);
  }

  // мышь/тач для интерактивности
  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });
  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initParticles();
  });

  // инициализация
  initParticles();
  requestAnimationFrame(animate);
})();
