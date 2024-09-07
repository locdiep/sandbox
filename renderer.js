window.addEventListener('DOMContentLoaded', () => {
  const { ipcRenderer } = window;

  if (window.platform.isWindows) {
    const minimizeButton = document.getElementById('minimize-button');
    const maximizeButton = document.getElementById('maximize-button');
    const restoreButton = document.getElementById('restore-button');
    const closeButton = document.getElementById('close-button');

    // Handle minimize button
    minimizeButton.style.display = 'inline';
    minimizeButton.addEventListener('click', () => {
      ipcRenderer.send('minimize-window');
    });

    // Handle close button
    closeButton.style.display = 'inline';
    closeButton.addEventListener('click', () => {
      ipcRenderer.send('quit-app')
    })

    // Handle maximize/restore button
    maximizeButton.addEventListener('click', () => {
      ipcRenderer.send('maximize-window');
    });
    restoreButton.addEventListener('click', () => {
        ipcRenderer.send('restore-window');
    });
    ipcRenderer.on('window-maximized', () => {
        maximizeButton.style.display = 'none';
        restoreButton.style.display = 'inline';
    });
    ipcRenderer.on('window-unmaximized', () => {
        maximizeButton.style.display = 'inline';
        restoreButton.style.display = 'none';
    });
  } else {
    minimizeButton.style.display = 'none';
    maximizeButton.style.display = 'none';
    restoreButton.style.display = 'none';
    closeButton.style.display = 'none';
  }

  ipcRenderer.on('blur', () => {
    document.getElementById('title-bar').style.backgroundColor = '#1f1f1f'
  });

  ipcRenderer.on('focus', () => {
    document.getElementById('title-bar').style.backgroundColor = '#1f1f1f'
  });
});
