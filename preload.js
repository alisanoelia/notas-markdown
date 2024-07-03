const { marked } = require('marked');
const { ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
  const markdownTextarea = document.getElementById('markdown');
  const resultDiv = document.getElementById('result');
  let currentFilePath = null;

  // Función para sincronizar el scroll del resultado con el scroll del textarea
  const syncScroll = () => {
    const scrollPercentage = markdownTextarea.scrollTop / (markdownTextarea.scrollHeight - markdownTextarea.clientHeight);
    resultDiv.scrollTop = scrollPercentage * (resultDiv.scrollHeight - resultDiv.clientHeight);
  };

  // Función para renderizar el contenido Markdown
  const renderMarkdown = () => {
    const markdownText = markdownTextarea.value;
    resultDiv.innerHTML = marked(markdownText);
    syncScroll();
  };

  renderMarkdown();
  markdownTextarea.addEventListener('input', renderMarkdown);
  markdownTextarea.addEventListener('scroll', syncScroll);

  // IPC handlers
  ipcRenderer.on('menu-new', () => {
    currentFilePath = null;
    markdownTextarea.value = '';
    renderMarkdown();
  });

  ipcRenderer.on('menu-open', () => {
    ipcRenderer.invoke('open-file').then((result) => {
      if (result) {
        currentFilePath = result.filePath;
        markdownTextarea.value = result.content;
        renderMarkdown();
      }
    });
  });

  ipcRenderer.on('menu-save', () => {
    const content = markdownTextarea.value;
    if (currentFilePath) {
      ipcRenderer.invoke('save-file', { filePath: currentFilePath, content });
    } else {
      ipcRenderer.invoke('save-file', { content }).then((filePath) => {
        if (filePath) {
          currentFilePath = filePath;
        }
      });
    }
  });

  // Función de autoguardado
  setInterval(() => {
    const content = markdownTextarea.value;
    if (currentFilePath) {
      ipcRenderer.invoke('save-file', { filePath: currentFilePath, content });
    }
  }, 2000); // Autoguarda cada 5 segundos
});
