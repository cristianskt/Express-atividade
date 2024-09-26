const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();
const PORT = 5000;

// Simulação de autenticação via middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization'];
  if (token === 'Bearer valid-token') {
    console.log('Autenticado com sucesso');
    next(); // Usuário autenticado, seguir para a próxima função
  } else {
    res.status(401).json({ message: 'Não autorizado' });
  }
};

// Middleware global para registrar requisições
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} - ${req.url}`);
  next();
});

// Rota pública
app.get('/', (req, res) => {
  res.send('Bem-vindo ao Servidor Express Avançado!');
});

// Rota protegida por autenticação
app.get('/secure-data', authMiddleware, (req, res) => {
  res.json({ secretData: 'Este é um dado protegido' });
});

// Rota dinâmica com parâmetros
app.get('/user/:id', (req, res) => {
  const userId = req.params.id;
  res.send(`ID do usuário: ${userId}`);
});

// Configurando um proxy para o React, com manipulação de cabeçalhos
app.use('/react-api', createProxyMiddleware({
  target: 'http://localhost:3000',
  changeOrigin: true,
  pathRewrite: {
    '^/react-api': '', // Remove o prefixo /react-api antes de enviar a requisição para o servidor React
  },
  onProxyReq: (proxyReq, req, res) => {
    // Adicionar cabeçalhos personalizados na requisição
    proxyReq.setHeader('x-added-header', 'express-proxy');
  }
}));

// Middleware de erro para rotas não encontradas
app.use((req, res, next) => {
  res.status(404).send("Desculpe, a rota não existe.");
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor Express rodando em http://localhost:${PORT}`);
});
