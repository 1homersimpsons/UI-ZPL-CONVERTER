// index.js

import { showLoading, updateBodyMargin, toggleLogoTransition, toggleAdvancedOptions, updateProgress } from './effects.js';
import { convertFile } from './conversion.js';
import { trackProgress } from './progress.js';
import { handleZipFile } from './utils.js';

document.addEventListener("DOMContentLoaded", () => {
    const codeEditor = document.getElementById("codeEditor");
    const previewArea = document.getElementById("previewArea");
    const convertBtn = document.getElementById("convertBtn");
    const printBtn = document.getElementById("printBtn");
    const formatSelect = document.getElementById("fileFormat");
    const downloadBtn = document.getElementById("downloadBtn");
    const progressBar = document.getElementById("progress-bar");
    const progressText = document.getElementById("progress-text");

    let fileUrls = [];
    let fileNames = [];
    let request_id = null;
    let websocket_url = null;
    let socket = null;

    // Inicializa os efeitos
    showLoading(false, convertBtn);  // Garantindo que o botão de conversão não esteja desabilitado inicialmente

    // Chama a função updateBodyMargin ao carregar a página
    updateBodyMargin();

    // Chama a função toggleLogoTransition para alternar os logos
    toggleLogoTransition();

    // Chama a função para alternar opções avançadas
    toggleAdvancedOptions();

    // Evento do botão Converter
    convertBtn.addEventListener("click", () => {
        const zplCode = codeEditor.value.trim();
        const format = formatSelect.value;

        if (!zplCode) {
            alert("Por favor, insira ou cole um código ZPL válido.");
            return;
        }

        if (!format) {
            alert("Por favor, selecione um formato antes de converter.");
            return;
        }

        const zplBlob = new Blob([zplCode], { type: "text/plain" });
        showLoading(true, convertBtn);  // Inicia a animação de carregamento

        convertFile(zplBlob, format, showLoading, handleZipFile)
            .then(response => {
                if (response && response.request_id && response.websocket_url) {
                    // O request_id e a URL do WebSocket foram retornados, vamos usar para monitorar o progresso
                    request_id = response.request_id;
                    websocket_url = response.websocket_url;
                    trackProgress(request_id, websocket_url);  // Monitorar o progresso via WebSocket
                } else {
                    console.log("Arquivo binário recebido sem request_id ou websocket_url.");
                }
            })
            .catch(error => {
                console.error("Erro ao iniciar a conversão:", error);
            });
    });

    // Função para conectar ao WebSocket e monitorar o progresso
    const trackProgress = (request_id, websocket_url) => {
        if (websocket_url) {
            socket = new WebSocket(websocket_url);

            socket.onopen = () => {
                console.log(`Conexão WebSocket aberta para o request_id: ${request_id}`);
                socket.send(JSON.stringify({ request_id: request_id })); // Envia o request_id
            };

            socket.onmessage = (event) => {
                console.log("Atualização recebida do WebSocket:", event.data);
                updateProgress(event.data);  // Atualiza a barra de progresso
            };

            socket.onerror = (error) => {
                console.error("Erro no WebSocket:", error);
            };

            socket.onclose = () => {
                console.log("Conexão WebSocket fechada.");
            };
        } else {
            console.error("WebSocket URL não fornecido.");
        }
    };

    // Evento do botão Baixar
    downloadBtn.addEventListener("click", () => {
        if (!fileUrls || !fileNames) {
            alert("Nenhum arquivo disponível para download.");
            return;
        }

        fileUrls.forEach((url, index) => {
            const a = document.createElement("a");
            a.href = url;
            a.download = fileNames[index];
            a.click();
        });
    });

    // Evento do botão Imprimir
    printBtn.addEventListener("click", () => {
        if (!fileUrls || !fileNames) {
            alert("Nenhum arquivo disponível para impressão.");
            return;
        }

        try {
            fileUrls.forEach((url) => {
                const newWindow = window.open(url, "_blank");
                newWindow.onload = () => newWindow.print();
            });
        } catch (error) {
            console.error("Erro ao imprimir:", error);
            alert("Erro ao imprimir os arquivos.");
        }
    });
});
