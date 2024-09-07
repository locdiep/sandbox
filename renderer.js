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

  document.getElementById('custom-layout-button').addEventListener('click', (event) => {
    event.preventDefault();
    const buttonRect = event.currentTarget.getBoundingClientRect();
    ipcRenderer.send('show-custom-layout-menu', {x: buttonRect.left, y: buttonRect.bottom});
  });

  ipcRenderer.on('toggle-primary-side-bar', (event) => {
    document.querySelector('#show-left-side-bar-button i').style.color = 'white';
  });
});
