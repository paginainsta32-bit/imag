const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');
const promptInput = document.getElementById('promptInput');
const apiKeyInput = document.getElementById('apiKeyInput');
const generateBtn = document.getElementById('generateBtn');
const statusDiv = document.getElementById('status');
const outputVideo = document.getElementById('outputVideo');

let uploadedImageUrl = '';

// Evento ao selecionar o arquivo de imagem
imageInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // 1. Mostra a pré-visualização local imediatamente
  imagePreview.src = URL.createObjectURL(file);
  imagePreview.style.display = 'block';

  // Desabilita o botão até a URL pública da imagem estar pronta
  generateBtn.disabled = true;
  statusDiv.innerText = "Carregando e hospedando imagem na nuvem...";

  try {
    // Exemplo usando uma API pública e rápida de upload de imagens (catbox / tmpfiles)
    const formData = new FormData();
    formData.append('fileToUpload', file);
    formData.append('reqtype', 'fileupload');

    const res = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: formData
    });

    if (!res.ok) throw new Error("Falha no servidor de imagens");

    const imageUrl = await res.text(); // Retorna a URL direta (ex: https://files.catbox.moe/xyz.jpg)
    
    if (imageUrl && imageUrl.startsWith('http')) {
      uploadedImageUrl = imageUrl.trim();
      statusDiv.innerText = "Imagem pronta e hospedada com sucesso!";
      generateBtn.disabled = false; // Libera o botão
    } else {
      throw new Error("URL inválida retornada");
    }

  } catch (err) {
    console.error("Erro no Upload:", err);
    statusDiv.innerText = "Erro ao hospedar a imagem. Tente escolher a imagem novamente.";
    uploadedImageUrl = '';
    generateBtn.disabled = false;
  }
});

// Evento ao clicar em Gerar Vídeo
generateBtn.addEventListener('click', async () => {
  const apiKey = apiKeyInput.value.trim();
  const prompt = promptInput.value.trim();

  // Validações explícitas
  if (!uploadedImageUrl) {
    alert("A imagem ainda não terminou de ser hospedada na nuvem ou o upload falhou. Escolha a imagem novamente.");
    return;
  }
  if (!apiKey) {
    alert("Por favor, informe sua API Key da Fal.ai.");
    return;
  }

  generateBtn.disabled = true;
  statusDiv.innerText = "Enviando requisição para a IA (aguarde de 30 a 60 segundos)...";

  try {
    const response = await fetch("https://fal.run/fal-ai/kling-video/v1.5/pro/image-to-video", {
      method: "POST",
      headers: {
        "Authorization": `Key ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: prompt || "natural movement of characters and objects",
        image_url: uploadedImageUrl,
        duration: "5"
      })
    });

    const result = await response.json();

    if (result.video && result.video.url) {
      statusDiv.innerText = "Vídeo gerado com sucesso!";
      outputVideo.src = result.video.url;
      outputVideo.style.display = 'block';
    } else {
      console.error("Erro da API de IA:", result);
      statusDiv.innerText = "Erro retornado pela IA: " + (result.detail || JSON.stringify(result));
    }
  } catch (error) {
    console.error("Erro na chamada:", error);
    statusDiv.innerText = "Erro na requisição. Verifique o console ou sua chave de API.";
  } finally {
    generateBtn.disabled = false;
  }
});
