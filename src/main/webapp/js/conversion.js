// No arquivo conversion.js

export const convertFile = async (file, format, showLoading, handleZipFile) => {
    try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`https://zpl-prime.up.railway.app/convert_${format}`, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Erro ao iniciar a conversão: ${response.statusText}`);
        }

        const contentType = response.headers.get("Content-Type");

        if (contentType && contentType.includes("application/json")) {
            const jsonResponse = await response.json();
            console.log('Resposta JSON do backend:', jsonResponse);

            const { request_id, message, websocket_url } = jsonResponse;
            console.log(`Request ID extraído: ${request_id}`);

            // Aqui, o arquivo binário será buscado a partir do novo endpoint
            return { request_id, websocket_url };

        } else {
            console.error("Tipo de resposta não esperado.");
            throw new Error("Tipo de resposta não esperado.");
        }

    } catch (error) {
        console.error("Erro no envio do arquivo:", error);
        alert(`Erro: ${error.message}`);
    }
};
