// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Importando a biblioteca de segurança padrão do mercado
import "@openzeppelin/contracts/access/Ownable.sol";

contract GatewayAgente is Ownable {
    
    // 1. O "RG" da Uniswap (onde o agente tem permissão para atuar)
    address public uniswapRouter = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    
    // 2. Variável para registrar o histórico na blockchain (Requisito do Trabalho)
    string public ultimoRegistro;

    // 3. O construtor define você (quem fez o deploy) como o dono absoluto do contrato
    constructor() Ownable(msg.sender) {}

    // 4. A função que o Agente ou o Site vai chamar
    function autorizarOperacao(address _destino) public {
        // O Filtro de Segurança 
        require(_destino == uniswapRouter, "Bloqueado pelo Gateway: Destino invalido!");
        ultimoRegistro = "Operacao aprovada: Agente negociou na Uniswap.";
    }

    // 5. Função de Admin para emergências
    function atualizarRotaSegura(address _novoDestino) public onlyOwner {
        uniswapRouter = _novoDestino;
        ultimoRegistro = "Admin alterou a rota de seguranca com sucesso.";
    }

    // 6. A EVOLUÇÃO PARA A DAO: Transfere o poder em definitivo
    function transferirParaDAO(address _enderecoDAO) public onlyOwner {
        require(_enderecoDAO != address(0), "Endereco da DAO nao pode ser zero");
        
        // Função nativa da OpenZeppelin que passa o bastão
        transferOwnership(_enderecoDAO);
        
        // Registrando o marco histórico na blockchain
        ultimoRegistro = "Controle descentralizado: Gateway agora e governado pela DAO.";
    }
}
