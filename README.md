# Gateway Agente - Smart Vault (AI Security)

Este repositório contém o contrato inteligente `GatewayAgente` e uma interface web (frontend) para interagir com ele. O projeto atua como um "Cofre Inteligente" (proxy/firewall) de segurança para Agentes de IA no mercado DeFi.

## 🏁 Sprints e Entregas (MVP)

### Sprint 1: Prova de Conceito Web3 (Concluída)
**Objetivo:** Demonstrar a integração básica entre um site e um contrato inteligente ("Um site conversa com um contrato na blockchain") implementando o registro de um dado on-chain.
- [x] Contrato Solidity simplificado (`^0.8.19`), achatado para remover dependências externas e evitar problemas de opcode em redes específicas.
- [x] Deploy na rede **Polygon Amoy Testnet** (Chain ID: 80002).
- [x] Interface frontend (HTML/JS) simples conectada via Ethers.js (v5.7.2) e MetaMask.
- [x] Interação on-chain: leitura de estado, simulação de bloqueio (require) e transação bem-sucedida alterando o estado (`ultimoRegistro`).
- **Entregáveis Acadêmicos:**
  - Print 1: Deploy do contrato no explorador amoy.polygonscan.com.
  - Print 2: Interface frontend conectada à MetaMask.
  - Print 3: Transação confirmada no explorador (hash da operação segura).

---

## 📌 Detalhes do Contrato (Amoy Testnet)

- **Rede:** Polygon Amoy Testnet
- **Compilador:** Solc ^0.8.19
- **Características:** Sem dependências externas (flattened) para evitar o opcode `PUSH0`.

### Funcionalidades
- **Whitelisting (Filtro de Destino):** O agente só pode operar com endereços autorizados (ex: Uniswap Router).
- **Registro On-chain:** Cumpre o requisito de gravar o histórico da operação na variável `ultimoRegistro`.
- **Governança Progressiva:** O admin pode transferir a propriedade (owner) do contrato para uma DAO (`transferirParaDAO`).

## 📁 Estrutura do Projeto

- `/contracts`: Código-fonte do contrato Solidity (`GatewayAgente.sol`).
- `/frontend`: Interface HTML/JS com Ethers.js pronta para interagir com o contrato.

## 🚀 Como usar o Frontend

1. **Abra o arquivo `index.html`** no seu navegador ou hospede a pasta `/frontend`.
2. Certifique-se de ter a **MetaMask** instalada.
3. Altere a rede da sua MetaMask para a **Polygon Amoy Testnet**.
4. Clique em **"Conectar MetaMask"**.
5. Interaja com as funções do contrato (Simular Ataque, Operação Segura, etc).
