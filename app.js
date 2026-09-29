const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');
const promptInput = document.getElementById('promptInput');
const apiKeyInput = document.getElementById('apiKeyInput');
const generateBtn = document.getElementById('generateBtn');
const statusDiv = document.getElementById('status');
const outputVideo = document.getElementById('outputVideo');

let uploadedImageUrl = '';

// Converte a imagem local em URL temporária ou realiza upload para hospedar
imageInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  imagePreview.src = URL.createObjectURL(file);
  imagePreview.style.display = 'block';

  // Exemplo de upload simples para um servidor público de imagens (necessário para enviar URL à API)
  statusDiv.innerText = "Carregando imagem...";
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'ml_default'); // Caso use Cloudinary gratuito, por exemplo

  try {
    // Você pode usar qualquer serviço temporário de upload de imagem
    const res = await fetch('https://api.tmpfiles.org/api/v1/upload', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    uploadedImageUrl = data.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
    statusDiv.innerText = "Imagem pronta para geração!";
  } catch (err) {
    statusDiv.innerText = "Erro ao carregar a imagem. Tente novamente.";
  }
});

generateBtn.addEventListener('click', async () => {
  const apiKey = apiKeyInput.value.trim();
  const prompt = promptInput.value.trim();

  if (!uploadedImageUrl) {
    alert("Por favor, selecione uma imagem primeiro.");
    return;
  }
  if (!apiKey) {
    alert("Insira sua API Key da Fal.ai ou da plataforma configurada.");
    return;
  }

  generateBtn.disabled = true;
  statusDiv.innerText = "Iniciando geração do vídeo com IA (pode levar cerca de 30 a 60 segundos)...";

  try {
    // Chamada para o modelo Luma / Kling na Fal.ai
    const response = await fetch("https://fal.run/fal-ai/luma-dream-machine/image-to-video", {
      method: "POST",
      headers: {
        "Authorization": `Key ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: prompt || "natural realistic character motion",
        image_url: uploadedImageUrl
      })
    });

    const result = await response.json();

    if (result.video && result.video.url) {
      statusDiv.innerText = "Vídeo gerado com sucesso!";
      outputVideo.src = result.video.url;
      outputVideo.style.display = 'block';
    } else {
      statusDiv.innerText = "Erro ao processar o vídeo: " + JSON.stringify(result);
    }
  } catch (error) {
    console.error(error);
    statusDiv.innerText = "Erro de conexão ou requisição falhou.";
  } finally {
    generateBtn.disabled = false;
  }
});
