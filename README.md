# 🐸 WIDESTYC - 7TV Wide Emote Maker

Uma ferramenta web simples, rápida e segura para criar versões **WIDE** (esticadas) dos seus emotes favoritos para a Twitch, YouTube e Kick via [7TV](https://7tv.app/). Funciona perfeitamente com imagens estáticas e GIFs animados.

## ✨ Funcionalidades

- **Processamento 100% Local:** Suas imagens e GIFs nunca são enviados para nenhum servidor. Todo o processamento (Canvas/Web Workers) é feito diretamente no navegador do usuário, garantindo privacidade absoluta e velocidade.
- **Suporte a GIFs Animados:** Decodifica, estica quadro a quadro, otimiza as cores (removendo bordas pretas / *alpha bleeding*) e renderiza de volta para um GIF pronto para o upload.
- **Importação Direta:** Basta colar o link ou ID de um emote do 7TV e a ferramenta baixa automaticamente a melhor qualidade disponível (4x) para você editar.
- **Controles Personalizados:**
  - **WIDE Factor:** Estique o emote em 2x, 2.5x ou o limite máximo absoluto permitido pelo 7TV (2.99x).
  - **Velocidade (GIFs):** Acelere os GIFs em até 2x para compensar o alongamento horizontal.
- **Validações do 7TV:** Proteções embutidas para garantir que o emote final nunca ultrapasse o limite de resolução (1000x1000px) e limite de proporção/aspect-ratio (máx 3:1).

## 🛠️ Tecnologias Utilizadas

- **[React](https://reactjs.org/) & [TypeScript](https://www.typescriptlang.org/)** - Estrutura da interface e lógica tipada.
- **[Vite](https://vitejs.dev/)** - Bundler e ambiente de desenvolvimento ultrarrápido.
- **[Tailwind CSS](https://tailwindcss.com/)** - Estilização da interface moderna e responsiva.
- **[gifuct-js](https://github.com/matt-way/gifuct-js)** - Para desconstruir GIFs em quadros (frames).
- **[gif.js](https://github.com/jnordberg/gif.js)** - Para renderizar/codificar os quadros manipulados de volta em um GIF otimizado usando Web Workers.
- **API do 7TV (v3)** - Fetching de metadados e blobs de imagens diretamente do CDN.

## 🚀 Como executar localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) instalado no seu computador.

### Passos

1. Clone ou baixe este repositório.
2. Abra o terminal na pasta do projeto e instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor local de desenvolvimento:
   ```bash
   npm run dev
   ```
4. Acesse o link fornecido no terminal (geralmente `http://localhost:5173`) no seu navegador.

## 📦 Build para Hospedagem

Para gerar a versão otimizada e minificada pronta para produção (para hospedar na Vercel, Netlify, GitHub Pages, etc):

```bash
npm run build
```
Isso criará uma pasta `dist` contendo todos os arquivos estáticos necessários para hospedar o site de graça.

## 🔒 Segurança

Como a aplicação é uma *Single Page Application* estática, ela não possui um back-end ativo recebendo arquivos. 
O sistema lida com o tamanho de buffers e limita a quantidade máxima de quadros de um GIF (1000 frames) para evitar travamentos locais (Out of Memory) no navegador do usuário, protegendo computadores mais modestos de Denial of Service local na aba.
