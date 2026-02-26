const contractAddress = "0x99905D8287B3bDA46fcCAA09Bc6a2819572bec04";

const contractABI = [
    "function uniswapRouter() public view returns (address)",
    "function ultimoRegistro() public view returns (string)",
    "function autorizarOperacao(address _destino) public",
    "function owner() public view returns (address)"
];

let provider;
let signer;
let contract;

const connectWalletBtn = document.getElementById("connectWalletBtn");
const walletAddressSpan = document.getElementById("walletAddress");
const refreshBtn = document.getElementById("refreshBtn");
const autorizarBtn = document.getElementById("autorizarBtn");

const ownerAddressSpan = document.getElementById("ownerAddress");
const routerAddressSpan = document.getElementById("routerAddress");
const lastRecordSpan = document.getElementById("lastRecord");
const statusMessage = document.getElementById("statusMessage");

function showStatus(message, isError = false) {
    statusMessage.style.display = "block";
    statusMessage.textContent = message;
    if (isError) {
        statusMessage.classList.add("error");
    } else {
        statusMessage.classList.remove("error");
    }
}

async function connectWallet() {
    if (typeof window.ethereum !== "undefined") {
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" });
            provider = new ethers.BrowserProvider(window.ethereum);
            signer = await provider.getSigner();
            
            const network = await provider.getNetwork();
            // Verificando Chain ID da Polygon Amoy (80002)
            if (network.chainId !== 80002n) {
                showStatus("Aviso: Você não está na rede Polygon Amoy Testnet (Chain ID 80002). As transações podem falhar.", true);
                // return; // Comentado para permitir conexão mesmo em rede errada temporariamente
            }

            const address = await signer.getAddress();
            walletAddressSpan.textContent = address.substring(0, 6) + "..." + address.substring(38);
            connectWalletBtn.textContent = "Conectado";
            connectWalletBtn.disabled = true;

            autorizarBtn.disabled = false;
            contract = new ethers.Contract(contractAddress, contractABI, signer);
            
            await updateContractData();
            showStatus("Carteira conectada! Pronto para enviar transações.");
        } catch (error) {
            console.error(error);
            showStatus("Erro ao conectar carteira: " + error.message, true);
        }
    } else {
        showStatus("MetaMask não encontrado. Instale a extensão no seu navegador.", true);
    }
}

async function updateContractData() {
    try {
        let readProvider = provider;
        if (!readProvider) {
            // Usa o RPC público da Amoy se a MetaMask não estiver conectada
            readProvider = new ethers.JsonRpcProvider("https://rpc-amoy.polygon.technology/");
        }
        
        const readContract = new ethers.Contract(contractAddress, contractABI, readProvider);
        
        const owner = await readContract.owner();
        const router = await readContract.uniswapRouter();
        const record = await readContract.ultimoRegistro();

        ownerAddressSpan.textContent = owner;
        routerAddressSpan.textContent = router;
        lastRecordSpan.textContent = record || "Nenhum registro encontrado.";
        
    } catch (error) {
        console.error("Erro ao ler dados:", error);
        ownerAddressSpan.textContent = "Erro na rede";
        routerAddressSpan.textContent = "Erro na rede";
        lastRecordSpan.textContent = "Erro na rede";
        showStatus("Erro de conexão com a Polygon Amoy. A rede pode estar congestionada.", true);
    }
}

async function sendTransaction(action, ...args) {
    if (!contract) return;
    try {
        showStatus("Processando transação... Por favor, confirme no MetaMask.");
        const tx = await contract[action](...args);
        showStatus(`Transação enviada! Aguardando confirmação... Hash: ${tx.hash}`);
        
        await tx.wait();
        
        showStatus(`Sucesso! Transação confirmada.`);
        await updateContractData();
    } catch (error) {
        console.error(error);
        let errorMsg = "Erro na transação.";
        if (error.reason) errorMsg += " Motivo: " + error.reason;
        else if (error.message) errorMsg += " Mensagem: " + error.message;
        showStatus(errorMsg, true);
    }
}

connectWalletBtn.addEventListener("click", connectWallet);
refreshBtn.addEventListener("click", updateContractData);

autorizarBtn.addEventListener("click", () => {
    const destino = document.getElementById("destinoInput").value;
    if (!destino) {
        showStatus("Informe o endereço de destino.", true);
        return;
    }
    sendTransaction("autorizarOperacao", destino);
});

// Apenas lê os dados do contrato (não chama MetaMask) ao abrir a página
window.onload = updateContractData;