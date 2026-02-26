const contractAddress = "0x99905D8287B3bDA46fcCAA09Bc6a2819572bec04";

const contractABI = [
    "function uniswapRouter() public view returns (address)",
    "function atualizarRotaSegura(address _novoDestino) public",
    "function transferirParaDAO(address _enderecoDAO) public",
    "function owner() public view returns (address)"
];

let provider;
let signer;
let contract;

const connectWalletBtn = document.getElementById("connectWalletBtn");
const walletAddressSpan = document.getElementById("walletAddress");
const atualizarRotaBtn = document.getElementById("atualizarRotaBtn");
const transferirDAOBtn = document.getElementById("transferirDAOBtn");

const ownerAddressSpan = document.getElementById("ownerAddress");
const routerAddressSpan = document.getElementById("routerAddress");
const statusMessage = document.getElementById("statusMessage");
const adminPanel = document.getElementById("adminPanel");

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
            if (network.chainId !== 11155111n) {
                showStatus("Por favor, mude para a rede Sepolia Testnet no MetaMask!", true);
                return;
            }

            const address = await signer.getAddress();
            
            // Instancia o contrato apenas para leitura primeiro (verificar owner)
            const readContract = new ethers.Contract(contractAddress, contractABI, provider);
            const owner = await readContract.owner();

            if (address.toLowerCase() !== owner.toLowerCase()) {
                showStatus(`Acesso Negado: A carteira ${address.substring(0, 6)}... não é a dona do contrato!`, true);
                adminPanel.style.display = "none";
                return;
            }

            // Se for o Owner, libera o painel
            walletAddressSpan.textContent = address.substring(0, 6) + "..." + address.substring(38);
            connectWalletBtn.textContent = "Admin Conectado";
            connectWalletBtn.disabled = true;
            adminPanel.style.display = "block";

            // Inicializa contrato com Signer
            contract = new ethers.Contract(contractAddress, contractABI, signer);
            
            await updateContractData();
            showStatus("Bem-vindo, Admin! Painel liberado.");
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
        const readContract = new ethers.Contract(contractAddress, contractABI, provider);
        const owner = await readContract.owner();
        const router = await readContract.uniswapRouter();

        ownerAddressSpan.textContent = owner;
        routerAddressSpan.textContent = router;
    } catch (error) {
        console.error("Erro ao ler dados:", error);
    }
}

async function sendTransaction(action, ...args) {
    if (!contract) return;
    try {
        showStatus("Processando transação de administrador... Confirme na MetaMask.");
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

atualizarRotaBtn.addEventListener("click", () => {
    const novaRota = document.getElementById("novaRotaInput").value;
    if (!novaRota) {
        showStatus("Informe o novo endereço da rota.", true);
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