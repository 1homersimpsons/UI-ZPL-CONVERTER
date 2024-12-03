// progress.js

// No arquivo progress.js
export const trackProgress = (request_id, updateProgress, showLoading) => {
    const socket = new WebSocket(`wss://zpl-prime.up.railway.app/ws/progress/${request_id}`);
    
    socket.onopen = () => {
        console.log("Conexão WebSocket aberta");
    };

    socket.onmessage = (event) => {
        const progress = parseFloat(event.data.replace("Progresso: ", "").replace("%", ""));
        updateProgress(progress); // Atualiza a barra de progresso com o valor recebido

        if (progress >= 100) {
            socket.close(); // Fecha a conexão quando atinge 100%
            showLoading(false); // Finaliza a animação de carregamento
        }
    };

    socket.onerror = (error) => {
        console.error("Erro no WebSocket:", error);
    };

    socket.onclose = () => {
        console.log("Conexão WebSocket fechada");
    };
};


// Função para atualizar a barra de progresso (pode ser chamada no onmessage)
export const updateProgress = (progress) => {
    const progressBar = document.getElementById("progress-bar");
    const progressText = document.getElementById("progress-text");

    progressBar.style.width = `${progress}%`;
    progressText.innerText = `Progresso: ${progress.toFixed(2)}%`;
};

