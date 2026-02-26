const contractAddress = "0x99905D8287B3bDA46fcCAA09Bc6a2819572bec04";

const contractABI = [
    "function uniswapRouter() public view returns (address)",
    "function ultimoRegistro() public view returns (string)",
    "function autorizarOperacao(address _destino) public",
    "function atualizarRotaSegura(address _novoDestino) public",
    "function owner() public view returns (address)"
];

let provider;
let signer;
let contract;

// UI Elements
const connectWalletBtn = document.getElementById("btn-connect");
const walletAddressSpan = document.getElementById("wallet-address");

const ownerAddressSpan = document.getElementById("ownerAddress");
const routerAddressSpan = document.getElementById("routerAddress");
const lastRecordSpan = document.getElementById("lastRecord");

const btnApprove = document.getElementById("btn-approve");
const inputAdapterAddress = document.getElementById("input-adapter-address");

const btnTradeSafe = document.getElementById("btn-trade-safe");
const btnTradeHack = document.getElementById("btn-trade-hack");
const inputTradeDestination = document.getElementById("input-trade-destination");

const consoleOutput = document.getElementById("console-output");

// Helper para o Terminal Virtual
function logToTerminal(message, type = "normal") {
    const timestamp = new Date().toLocaleTimeString();
    let cssClass = "";
    if (type === "error") cssClass = "log-error";
    if (type === "success") cssClass = "log-success";
    
    consoleOutput.innerHTML += `<span class="${cssClass}">[${timestamp}] ${message}</span><br>`;
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

async function connectWallet() {
    if (typeof window.ethereum !== "undefined") {
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" });
            provider = new ethers.BrowserProvider(window.ethereum);
            signer = await provider.getSigner();
            
            const network = await provider.getNetwork();
            // Sepolia = 11155111
            if (network.chainId !== 11155111n) {
                try {
                    logToTerminal("> Solicitando troca para a rede Sepolia...", "yellow");
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: '0xaa36a7' }],
                    });
                    provider = new ethers.BrowserProvider(window.ethereum);
                    signer = await provider.getSigner();
                } catch (switchError) {
                    logToTerminal("> Acesso cancelado. Troque para Sepolia manualmente.", "error");
                    return;
                }
            }

            const address = await signer.getAddress();
            walletAddressSpan.textContent = address.substring(0, 6) + "..." + address.substring(38);
            connectWalletBtn.textContent = "Conectado";
            
            contract = new ethers.Contract(contractAddress, contractABI, signer);
            
            // Ativa botões dependendo se é owner ou não
            const currentOwner = await contract.owner();
            if (address.toLowerCase() === currentOwner.toLowerCase()) {
                btnApprove.disabled = false;
                logToTerminal("> Conectado como ADMIN (Owner). Privilégios elevados.", "success");
            } else {
                logToTerminal("> Conectado como USUÁRIO comum. Acesso restrito a IA.", "normal");
            }
            
            btnTradeSafe.disabled = false;
            btnTradeHack.disabled = false;

            await updateContractData();
        } catch (error) {
            logToTerminal(`> Erro de conexão: ${error.message}`, "error");
        }
    } else {
        logToTerminal("> MetaMask não encontrada! Instale a extensão.", "error");
    }
}

async function updateContractData() {
    try {
        let readProvider = provider;
        if (!readProvider) {
            readProvider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");
        }
        
        const readContract = new ethers.Contract(contractAddress, contractABI, readProvider);
        
        const owner = await readContract.owner();
        const router = await readContract.uniswapRouter();
        const record = await readContract.ultimoRegistro();

        ownerAddressSpan.textContent = owner;
        routerAddressSpan.textContent = router;
        lastRecordSpan.textContent = record || "Nenhum registro";
        
        // Auto preencher o input de simulação segura com o adapter correto para facilitar o teste
        inputTradeDestination.value = router;
        
        logToTerminal("> Dados on-chain sincronizados com sucesso.", "success");
    } catch (error) {
        logToTerminal("> Falha ao ler RPC da Sepolia.", "error");
    }
}

async function sendTransaction(action, arg, typeMessage) {
    if (!contract) return;
    try {
        logToTerminal(`> Iniciando ${typeMessage}... Aguardando assinatura.`, "yellow");
        
        // Se for a tentativa de hack, tentar estimar o gás primeiro.
        // Se falhar na estimativa (revert do require), a gente já pega o erro do contrato aqui e mostra no terminal
        try {
             await contract[action].estimateGas(arg);
        } catch(estError) {
             let reason = estError.reason || "Transação revertida pelo contrato (Bloqueado)";
             logToTerminal(`> ❌ BLOQUEADO: ${reason}`, "error");
             return; // Para aqui, nem tenta mandar pra rede pra não gastar gás do usuário
        }

        const tx = await contract[action](arg);
        logToTerminal(`> Tx enviada! Hash: ${tx.hash.substring(0,10)}... Aguardando mineração.`, "yellow");
        
        await tx.wait();
        
        logToTerminal(`> ✅ SUCESSO: ${typeMessage} confirmada!`, "success");
        await updateContractData();
    } catch (error) {
        // Se o usuário cancelar na MetaMask ou der erro antes da estimativa
        logToTerminal(`> ERRO: ${error.shortMessage || error.message}`, "error");
    }
}

connectWalletBtn.addEventListener("click", connectWallet);

btnApprove.addEventListener("click", () => {
    const novaRota = inputAdapterAddress.value;
    if (!novaRota || novaRota.length !== 42) {
        logToTerminal("> Insira um endereço de Adapter válido.", "error");
        return;
    }
    sendTransaction("atualizarRotaSegura", novaRota, "Atualização de Rota (Admin)");
});

btnTradeSafe.addEventListener("click", () => {
    const destino = inputTradeDestination.value;
    sendTransaction("autorizarOperacao", destino, "Simulação IA (Adapter Correto)");
});

btnTradeHack.addEventListener("click", () => {
    // Tenta mandar pra um endereço aleatório (DeFi Hacker)
    const destinoFalso = "0x1111111111111111111111111111111111111111";
    logToTerminal(`> IA Maliciosa tentando rotear para: ${destinoFalso}`, "error");
    sendTransaction("autorizarOperacao", destinoFalso, "Simulação IA (Ataque Hacker)");
});

window.onload = updateContractData;
