const imageInput = document.getElementById('imageInput');
const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d');
const renderBtn = document.getElementById('renderBtn');
const outputVideo = document.getElementById('outputVideo');
const downloadBtn = document.getElementById('downloadBtn');

let img = new Image();

imageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  img.onload = () => {
    // Desenha estado inicial
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    renderBtn.disabled = false;
  };
  img.src = url;
});

renderBtn.addEventListener('click', async () => {
  renderBtn.disabled = true;
  renderBtn.innerText = 'Processando...';

  const duration = 5; // segundos
  const fps = 30;
  const totalFrames = duration * fps;
  
  // Stream do Canvas
  const stream = canvas.captureStream(fps);
  const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
  
  const chunks = [];
  mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
  mediaRecorder.onstop = () => {
    const blob = new Blob(chunks, { type: 'video/webm' });
    const videoUrl = URL.createObjectURL(blob);
    outputVideo.src = videoUrl;
    downloadBtn.href = videoUrl;
    downloadBtn.download = 'video-5s.webm';
    downloadBtn.style.display = 'inline-block';
    downloadBtn.innerText = 'Baixar Vídeo';
    renderBtn.disabled = false;
    renderBtn.innerText = 'Gerar Vídeo MP4/WebM';
  };

  mediaRecorder.start();

  let frame = 0;
  const interval = setInterval(() => {
    const progress = frame / totalFrames; // 0.0 a 1.0

    // Limpa canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Efeito de Zoom Leve (Ken Burns) ao longo dos 5s
    const scale = 1 + progress * 0.1; // Zoom de 10% em 5s
    const w = canvas.width * scale;
    const h = canvas.height * scale;
    const x = (canvas.width - w) / 2;
    const y = (canvas.height - h) / 2;

    ctx.drawImage(img, x, y, w, h);

    frame++;
    if (frame > totalFrames) {
      clearInterval(interval);
      mediaRecorder.stop();
    }
  }, 1000 / fps);
});