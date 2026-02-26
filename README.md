# Gateway Agente - Sepolia Testnet

Este repositório contém o contrato inteligente `GatewayAgente` e uma interface web (frontend) para interagir com ele. O contrato foi desenvolvido em Solidity e já se encontra implantado na rede **Sepolia Testnet**.

## 📌 Detalhes do Contrato

- **Endereço na Sepolia:** [`0x99905D8287B3bDA46fcCAA09Bc6a2819572bec04`](https://sepolia.etherscan.io/address/0x99905D8287B3bDA46fcCAA09Bc6a2819572bec04)
- **Compilador:** Solc ^0.8.20
- **Bibliotecas:** OpenZeppelin (Ownable)

## 📁 Estrutura do Projeto

- `/contracts`: Código-fonte do contrato Solidity (`GatewayAgente.sol`).
- `/frontend`: Interface HTML/JS com Ethers.js v6 pronta para interagir com o contrato. Pode ser hospedada diretamente no seu domínio (como GitHub Pages, Vercel ou Netlify).

## 🚀 Como usar o Frontend

1. **Abra o arquivo `index.html`** no seu navegador ou hospede a pasta `/frontend` em um servidor web.
2. Certifique-se de ter a extensão **MetaMask** instalada no seu navegador.
3. Altere a rede da sua MetaMask para a **Sepolia Testnet**.
4. Clique em **"Conectar MetaMask"**.
5. Interaja com as funções do contrato:
   - **Autorizar Operação:** Permite registrar que o agente negociou na Uniswap (passando o endereço correto do Uniswap Router).
   - **Atualizar Rota Segura (Apenas Dono):** Altera o endereço da Uniswap autorizado.
   - **Transferir para DAO (Apenas Dono):** Transfere a propriedade do contrato (Ownable) para outro endereço (ex: uma DAO).

## 💻 Desenvolvimento Local

Se você quiser compilar ou mexer no contrato localmente usando Hardhat/Foundry, as dependências do OpenZeppelin foram adicionadas ao projeto. Basta rodar:

```bash
npm install
```
