# Portal Escolar Abel

Portal institucional demonstrativo da **Escola Estadual Professor Abel Freire Coelho**, desenvolvido como atividade escolar no formato **PWA** (Progressive Web App) com **HTML, CSS e JavaScript puro** — sem frameworks ou bibliotecas externas.

> ⚠️ Todo o conteúdo (avisos, calendário, cursos, contato) é **fictício e demonstrativo**. Não há dados pessoais reais nem informações institucionais oficiais.

## Funcionalidades

- Página inicial com apresentação institucional e menu de navegação.
- Seção de cursos e informações escolares (exemplos).
- Avisos e comunicados da coordenação com **filtro por categoria** (Acadêmico, Eventos, Administrativo, Urgente).
- Calendário escolar em linha do tempo.
- Seção de contato com formulário **demonstrativo** (sem envio de dados).
- **Menu mobile** acessível (abre/fecha, fecha com `Esc` e ao clicar fora).
- Navegação entre seções com rolagem suave e destaque do link ativo.
- Barra de progresso de leitura, botão "voltar ao topo" e ano atual automático.
- **PWA instalável** com manifesto e service worker (funciona offline após o primeiro acesso).

## Arquivos

| Arquivo | Descrição |
| --- | --- |
| `index.html` | Estrutura semântica de todas as seções. |
| `style.css` | Estilos responsivos com paleta azul-escuro, azul-claro, branco e detalhes em verde. |
| `script.js` | Menu mobile, navegação, filtros, validação e registro do service worker. |
| `manifest.json` | Configuração do PWA (nome, cores, ícones, `standalone`). |
| `service-worker.js` | Cache dos arquivos essenciais e suporte offline. |
| `icons/icon.svg` | Ícone do aplicativo em SVG. |

## Como executar e testar

O service worker só funciona em contexto seguro (`https://` ou `localhost`), por isso **não abra o `index.html` diretamente** pelo sistema de arquivos.

1. Na raiz do projeto, inicie um servidor local:

   ```bash
   # Python 3
   python3 -m http.server 8080

   # ou com Node.js
   npx serve .
   ```

2. Abra `http://localhost:8080` no navegador.

3. Para testar o modo offline: no DevTools, aba **Application → Service Workers**, confirme que o service worker está "activated", marque **Offline** e recarregue a página.

4. Para testar a instalação: use o ícone de **instalar** na barra de endereços do navegador (Chrome/Edge), ou no celular use **"Adicionar à tela inicial"**.

## Publicação no GitHub Pages

O projeto está configurado com **caminhos relativos** (`./`), compatíveis com o GitHub Pages ao ser publicado em um repositório chamado `portal-abel-pwa` (URL `https://<usuario>.github.io/portal-abel-pwa/`).

1. Envie os arquivos para o repositório:

   ```bash
   git add .
   git commit -m "Implementa o Portal Escolar Abel (PWA)"
   git push origin main
   ```

2. No GitHub, acesse **Settings → Pages**, selecione a branch `main` e a pasta `/ (root)` e salve.

3. Aguarde alguns instantes e acesse `https://<usuario>.github.io/portal-abel-pwa/`.

## Acessibilidade

- HTML semântico, `lang="pt-BR"` e link "pular para o conteúdo".
- Foco visível, contraste adequado e navegação por teclado.
- `aria-*` no menu, nos filtros e nas mensagens de status.
- Respeita a preferência `prefers-reduced-motion`.
