(() => {
  const yesButton = document.getElementById('btn-yes');
  const noButton = document.getElementById('btn-no');
  const banner = document.querySelector('.banner');
  const main = document.querySelector('main');

  if (!yesButton) return;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return;

  Object.assign(canvas.style, {
    position: 'fixed',
    inset: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: '9999',
    display: 'none',
  });

  document.body.appendChild(canvas);

  const fireworks = [];
  const confetti = [];
  let width = 0;
  let height = 0;
  let running = false;
  let animationId = 0;
  let lastBurst = 0;
  let gravity = 0.08;

  const FIREWORK_COLORS = [
    '#ff2d95',
    '#ff7f50',
    '#ffd166',
    '#06d6a0',
    '#00bbf9',
    '#9b5de5',
    '#ffffff',
  ];

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;

    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function createFireworkBurst(originX, originY) {
    const count = Math.floor(random(55, 90));
    const color = pick(FIREWORK_COLORS);

    for (let i = 0; i < count; i += 1) {
      const angle = random(0, Math.PI * 2);
      const speed = random(1.2, 6.4);

      fireworks.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: random(1.2, 3.2),
        alpha: 1,
        decay: random(0.008, 0.02),
        color,
        trail: [],
      });
    }
  }

  function createConfettiWave() {
    const totalPieces = Math.max(200, Math.floor(width / 6));

    for (let i = 0; i < totalPieces; i += 1) {
      confetti.push({
        x: random(0, width),
        y: random(-height * 0.85, -20),
        vx: random(-1.3, 1.3),
        vy: random(0.8, 2.4),
        wobble: random(0, Math.PI * 2),
        wobbleSpeed: random(0.04, 0.15),
        size: random(6, 13),
        color: pick(FIREWORK_COLORS),
        rotation: random(0, Math.PI * 2),
        rotationSpeed: random(-0.15, 0.15),
        alpha: 1,
      });
    }
  }

  function drawFireworks() {
    for (let i = fireworks.length - 1; i >= 0; i -= 1) {
      const p = fireworks[i];

      p.trail.push({ x: p.x, y: p.y, alpha: p.alpha });

      if (p.trail.length > 7) p.trail.shift();

      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.985;
      p.vy *= 0.985;
      p.vy += gravity;
      p.alpha -= p.decay;

      for (let t = p.trail.length - 1; t >= 0; t -= 1) {
        const trailPoint = p.trail[t];
        const trailAlpha = (trailPoint.alpha * (t + 1)) / p.trail.length;

        ctx.beginPath();
        ctx.fillStyle = `${p.color}${Math.floor(trailAlpha * 100)
          .toString(16)
          .padStart(2, '0')}`;
        ctx.arc(trailPoint.x, trailPoint.y, p.size * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }

      if (p.alpha <= 0) {
        fireworks.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.fillStyle = `${p.color}${Math.floor(p.alpha * 255)
        .toString(16)
        .padStart(2, '0')}`;
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawConfetti() {
    for (let i = confetti.length - 1; i >= 0; i -= 1) {
      const c = confetti[i];

      c.wobble += c.wobbleSpeed;
      c.rotation += c.rotationSpeed;
      c.x += c.vx + Math.sin(c.wobble) * 0.6;
      c.y += c.vy;
      c.vy += 0.006;

      if (c.vy > 3.8) c.vy = 3.8;

      if (c.y > height + 24) {
        confetti.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rotation);
      ctx.globalAlpha = c.alpha;
      ctx.fillStyle = c.color;
      ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size * 0.65);
      ctx.restore();
    }
  }

  function animate(now) {
    if (!running) return;

    ctx.fillStyle = '#ebaac8';
    ctx.fillRect(0, 0, width, height);

    if (!lastBurst || now - lastBurst > random(220, 620)) {
      const x = random(width * 0.12, width * 0.88);
      const y = random(height * 0.1, height * 0.48);
      createFireworkBurst(x, y);
      lastBurst = now;
    }

    drawFireworks();
    drawConfetti();

    if (fireworks.length > 1300) fireworks.splice(0, fireworks.length - 1300);

    animationId = window.requestAnimationFrame(animate);
  }

  function startCelebration() {
    if (running) return;
    running = true;
    canvas.style.display = 'block';
    resizeCanvas();
    createFireworkBurst(width / 2, height * 0.35);
    createFireworkBurst(width * 0.35, height * 0.48);
    createFireworkBurst(width * 0.65, height * 0.4);
    createConfettiWave();
    animationId = window.requestAnimationFrame(animate);
  }

  function toggleBanner() {
    if (!banner) return;

    banner.classList.toggle('hidden');
    main.classList.toggle('hidden');
  }

  yesButton.addEventListener('click', startCelebration);
  if (noButton) noButton.addEventListener('click', toggleBanner);
  window.addEventListener('resize', resizeCanvas);

  window.addEventListener('beforeunload', () =>
    window.cancelAnimationFrame(animationId),
  );
})();
