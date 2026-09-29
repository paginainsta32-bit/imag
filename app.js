const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');
const promptInput = document.getElementById('promptInput');
const apiKeyInput = document.getElementById('apiKeyInput');
const generateBtn = document.getElementById('generateBtn');
const statusDiv = document.getElementById('status');
const outputVideo = document.getElementById('outputVideo');

let uploadedImageUrl = '';

// 1. Quando o usuário escolhe a imagem
imageInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Mostra a pré-visualização local imediatamente no Canvas/Img
  imagePreview.src = URL.createObjectURL(file);
  imagePreview.style.display = 'block';

  const apiKey = apiKeyInput.value.trim();

  // Se a chave já estiver preenchida, faz o upload imediato para a Fal.ai
  if (apiKey) {
    await uploadImageToFal(file, apiKey);
  } else {
    statusDiv.innerText = "Imagem carregada localmente. Insira sua API Key para enviar a imagem para a nuvem.";
  }
});

// 2. Função para fazer upload direto usando a infraestrutura oficial da Fal.ai
async function uploadImageToFal(file, apiKey) {
  generateBtn.disabled = true;
  statusDiv.innerText = "Enviando imagem para os servidores da Fal.ai...";

  try {
    // Passo 1: Solicita URL de upload para a Fal.ai
    const res = await fetch("https://rest.alpha.fal.ai/storage/upload/initiate", {
      method: "POST",
      headers: {
        "Authorization": `Key ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        file_name: file.name,
        content_type: file.type
      })
    });

    if (!res.ok) throw new Error("Verifique se sua API Key da Fal.ai está correta.");

    const uploadData = await res.json();
    
    // Passo 2: Envia o arquivo diretamente via PUT para a URL gerada
    const uploadRes = await fetch(uploadData.upload_url, {
      method: "PUT",
      headers: {
        "Content-Type": file.type
      },
      body: file
    });

    if (!uploadRes.ok) throw new Error("Falha no upload do arquivo.");

    uploadedImageUrl = uploadData.file_url;
    statusDiv.innerText = "Imagem pronta para geração!";
    generateBtn.disabled = false;

  } catch (err) {
    console.error("Erro no upload:", err);
    statusDiv.innerText = "Erro ao enviar a imagem: " + err.message;
    uploadedImageUrl = '';
    generateBtn.disabled = false;
  }
}

// 3. Evento do botão "Gerar Vídeo"
generateBtn.addEventListener('click', async () => {
  const apiKey = apiKeyInput.value.trim();
  const prompt = promptInput.value.trim();
  const file = imageInput.files[0];

  if (!apiKey) {
    alert("Por favor, preencha sua Chave API da Fal.ai.");
    return;
  }

  // Se a imagem ainda não foi enviada para a nuvem, tenta enviar agora
  if (!uploadedImageUrl && file) {
    await uploadImageToFal(file, apiKey);
  }

  if (!uploadedImageUrl) {
    alert("A imagem ainda não foi carregada na nuvem. Selecione a imagem novamente.");
    return;
  }

  generateBtn.disabled = true;
  statusDiv.innerText = "Processando vídeo com IA (pode levar entre 30 a 60 segundos)...";

  try {
    // Chamada para o modelo Kling 1.5 na Fal.ai
    const response = await fetch("https://fal.run/fal-ai/kling-video/v1.5/pro/image-to-video", {
      method: "POST",
      headers: {
        "Authorization": `Key ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: prompt || "personagens e objetos se movendo de forma natural",
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
      console.error("Erro no retorno:", result);
      statusDiv.innerText = "Erro ao gerar vídeo: " + (result.detail || JSON.stringify(result));
    }
  } catch (error) {
    console.error("Erro de requisição:", error);
    statusDiv.innerText = "Erro na chamada da API da Fal.ai. Verifique o console.";
  } finally {
    generateBtn.disabled = false;
  }
});
