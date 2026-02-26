// const { ethers } = window;

const contractAddress = "0x99905D8287B3bDA46fcCAA09Bc6a2819572bec04";

// ABI minimalista para interagir com o contrato GatewayAgente
const contractABI = [
    "function uniswapRouter() public view returns (address)",
    "function ultimoRegistro() public view returns (string)",
    "function autorizarOperacao(address _destino) public",
    "function atualizarRotaSegura(address _novoDestino) public",
    "function transferirParaDAO(address _enderecoDAO) public",
    "function owner() public view returns (address)"
];

let provider;
let signer;
let contract;

// Elementos da UI
const connectWalletBtn = document.getElementById("connectWalletBtn");
const walletAddressSpan = document.getElementById("walletAddress");
const refreshBtn = document.getElementById("refreshBtn");
const autorizarBtn = document.getElementById("autorizarBtn");
const atualizarRotaBtn = document.getElementById("atualizarRotaBtn");
const transferirDAOBtn = document.getElementById("transferirDAOBtn");

const ownerAddressSpan = document.getElementById("ownerAddress");
const routerAddressSpan = document.getElementById("routerAddress");
const lastRecordSpan = document.getElementById("lastRecord");
const statusMessage = document.getElementById("statusMessage");

// Função para exibir mensagens na tela
function showStatus(message, isError = false) {
    statusMessage.style.display = "block";
    statusMessage.textContent = message;
    if (isError) {
        statusMessage.classList.add("error");
    } else {
        statusMessage.classList.remove("error");
    }
}

// Conectar a carteira MetaMask
async function connectWallet() {
    if (typeof window.ethereum !== "undefined") {
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" });
            provider = new ethers.BrowserProvider(window.ethereum);
            signer = await provider.getSigner();
            
            // Verificar rede Sepolia
            const network = await provider.getNetwork();
            if (network.chainId !== 11155111n) {
                showStatus("Por favor, mude para a rede Sepolia Testnet no MetaMask!", true);
                return;
            }

            const address = await signer.getAddress();
            walletAddressSpan.textContent = address.substring(0, 6) + "..." + address.substring(38);
            connectWalletBtn.textContent = "Conectado";
            connectWalletBtn.disabled = true;

            // Habilitar botões de transação
            autorizarBtn.disabled = false;
            atualizarRotaBtn.disabled = false;
            transferirDAOBtn.disabled = false;

            // Inicializar o contrato com o signer para enviar transações
            contract = new ethers.Contract(contractAddress, contractABI, signer);
            
            await updateContractData();
            showStatus("Carteira conectada e contrato carregado com sucesso.");
        } catch (error) {
            console.error(error);
            showStatus("Erro ao conectar carteira: " + error.message, true);
        }
    } else {
        showStatus("MetaMask não encontrado. Instale a extensão no seu navegador.", true);
    }
}

// Ler dados do contrato (View Functions)
async function updateContractData() {
    if (!provider) {
        // Se não houver provedor injetado, tenta conectar via RPC público da Sepolia apenas para leitura
        provider = new ethers.JsonRpcProvider("https://rpc.sepolia.org");
    }
    
    try {
        const readContract = new ethers.Contract(contractAddress, contractABI, provider);
        
        const owner = await readContract.owner();
        const router = await readContract.uniswapRouter();
        const record = await readContract.ultimoRegistro();

        ownerAddressSpan.textContent = owner;
        routerAddressSpan.textContent = router;
        lastRecordSpan.textContent = record || "Nenhum registro encontrado.";
        
    } catch (error) {
        console.error("Erro ao ler dados:", error);
        showStatus("Erro ao carregar dados do contrato. Certifique-se de estar na rede Sepolia.", true);
    }
}

// Função para enviar uma transação
async function sendTransaction(action, ...args) {
    if (!contract) return;
    try {
        showStatus("Processando transação... Por favor, confirme no MetaMask.");
        const tx = await contract[action](...args);
        showStatus(`Transação enviada! Aguardando confirmação... Hash: ${tx.hash}`);
        
        await tx.wait(); // Aguarda a transação ser minerada
        
        showStatus(`Sucesso! Transação confirmada.`);
        await updateContractData(); // Atualiza a tela
    } catch (error) {
        console.error(error);
        // Tenta capturar o motivo do erro no contrato (ex: "Bloqueado pelo Gateway")
        let errorMsg = "Erro na transação.";
        if (error.reason) errorMsg += " Motivo: " + error.reason;
        else if (error.message) errorMsg += " Mensagem: " + error.message;
        showStatus(errorMsg, true);
    }
}

// Event Listeners
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

atualizarRotaBtn.addEventListener("click", () => {
    const novaRota = document.getElementById("novaRotaInput").value;
    if (!novaRota) {
        showStatus("Informe o novo endereço do router.", true);
        return;
    }
    sendTransaction("atualizarRotaSegura", novaRota);
});

transferirDAOBtn.addEventListener("click", () => {
    const novaDAO = document.getElementById("novaDAOInput").value;
    if (!novaDAO) {
        showStatus("Informe o endereço da nova DAO.", true);
        return;
    }
    sendTransaction("transferirParaDAO", novaDAO);
});

// Atualiza dados na inicialização apenas para leitura
window.onload = updateContractData;
