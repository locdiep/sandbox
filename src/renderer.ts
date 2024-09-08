window.addEventListener('DOMContentLoaded', () => {
  const { ipcRenderer } = window;
  const minimizeButton = document.getElementById('minimize-button');
  const maximizeButton = document.getElementById('maximize-button');
  const restoreButton = document.getElementById('restore-button');
  const closeButton = document.getElementById('close-button');

  if (window.platform.isWindows) {
    // Handle minimize button
    minimizeButton!.style.display = 'inline';
    minimizeButton!.addEventListener('click', () => {
      ipcRenderer.send('minimize-window');
    });

    // Handle close button
    closeButton!.style.display = 'inline';
    closeButton!.addEventListener('click', () => {
      ipcRenderer.send('quit-app')
    })

    // Handle maximize/restore button
    maximizeButton!.addEventListener('click', () => {
      ipcRenderer.send('maximize-window');
    });
    restoreButton!.addEventListener('click', () => {
        ipcRenderer.send('restore-window');
    });
    ipcRenderer.on('window-maximized', () => {
        maximizeButton!.style.display = 'none';
        restoreButton!.style.display = 'inline';
    });
    ipcRenderer.on('window-unmaximized', () => {
        maximizeButton!.style.display = 'inline';
        restoreButton!.style.display = 'none';
    });
  } else {
    minimizeButton!.style.display = 'none';
    maximizeButton!.style.display = 'none';
    restoreButton!.style.display = 'none';
    closeButton!.style.display = 'none';
    document.getElementById('logo')!.style.display = 'none';
    document.getElementById('custom-layout-button')!.style.marginRight = '5px';
  }

  ipcRenderer.on('blur', () => {
    document.getElementById('title-bar')!.style.backgroundColor = '#1f1f1f'
  });

  ipcRenderer.on('focus', () => {
    document.getElementById('title-bar')!.style.backgroundColor = '#1f1f1f'
  });

  document.getElementById('custom-layout-button')!.addEventListener('click', (event) => {
    event.preventDefault();
    const buttonRect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    ipcRenderer.send('show-custom-layout-menu', {x: buttonRect.left, y: buttonRect.bottom});
  });

  ipcRenderer.on('global-shortcut', (event, shortcut) => {
    switch (shortcut) {
      case 'ctrl+B': updatePrimarySideBarUI(); break;
      case 'ctrl+shift+B': updateSecondarySideBarUI(); break;
      case 'ctrl+J': updatePanelUI(); break;
      default:
    }
    
  });

  initActivityBarUI();
  initPrimarySideBarUI();
  initSecondarySideBarUI();
  initPanelUI();
  initStatusBarUI();

  ipcRenderer.on('toggle-activity-bar', updateActivityBarUI);

  ipcRenderer.on('toggle-primary-side-bar', updatePrimarySideBarUI);

  ipcRenderer.on('toggle-secondary-side-bar', updateSecondarySideBarUI);

  ipcRenderer.on('toggle-panel', updatePanelUI);

  ipcRenderer.on('toggle-status-bar', updateStatusBarUI);

  async function initActivityBarUI() {
    const value = await window.electronStore.get('workspace.activityBar.visible');
    if (value) {
      window.electronStore.set('workspace.activityBar.visible', true);
      window.electronMenu.setChecked('activity-bar-item', true);
    } else {
      window.electronStore.set('workspace.activityBar.visible', false);
      window.electronMenu.setChecked('activity-bar-item', false);
    }
  }

  async function initPrimarySideBarUI() {
    const value = await window.electronStore.get('workspace.primarySideBar.visible');
    if (value) {
      window.electronStore.set('workspace.primarySideBar.visible', true);
      (document.querySelector('#toggle-left-side-bar-button i') as HTMLElement).style.color = 'white';
      window.electronMenu.setChecked('primary-side-bar-item', true);
    } else {
      window.electronStore.set('workspace.primarySideBar.visible', false);
      (document.querySelector('#toggle-left-side-bar-button i') as HTMLElement).style.color = '#939494';
      window.electronMenu.setChecked('primary-side-bar-item', false);
    }
  }

  async function initSecondarySideBarUI() {
    const value = await window.electronStore.get('workspace.secondarySideBar.visible');
    if (value) {
      window.electronStore.set('workspace.secondarySideBar.visible', true);
      (document.querySelector('#toggle-right-side-bar-button i') as HTMLElement).style.color = 'white';
      window.electronMenu.setChecked('secondary-side-bar-item', true);
    } else {
      window.electronStore.set('workspace.secondarySideBar.visible', false);
      (document.querySelector('#toggle-right-side-bar-button i') as HTMLElement).style.color = '#939494';
      window.electronMenu.setChecked('secondary-side-bar-item', false);
    }
  }

  async function initPanelUI() {
    const value = await window.electronStore.get('workspace.panel.visible');
    if (value) {
      window.electronStore.set('workspace.panel.visible', true);
      (document.querySelector('#toggle-panel-button i') as HTMLElement).style.color = 'white';
      window.electronMenu.setChecked('panel-item', true);
    } else {
      window.electronStore.set('workspace.panel.visible', false);
      (document.querySelector('#toggle-panel-button i') as HTMLElement).style.color = '#939494';
      window.electronMenu.setChecked('panel-item', false);
    }
  }

  async function initStatusBarUI() {
    const value = await window.electronStore.get('workspace.statusBar.visible');
    if (value) {
      window.electronStore.set('workspace.statusBar.visible', true);
      window.electronMenu.setChecked('status-bar-item', true);
      document.getElementById('status-bar')!.style.display = 'flex';
    } else {
      window.electronStore.set('workspace.statusBar.visible', false);
      window.electronMenu.setChecked('status-bar-item', false);
      document.getElementById('status-bar')!.style.display = 'none';
    }
  }

  async function updateActivityBarUI() {
    const value = await window.electronStore.get('workspace.activityBar.visible');
    if (value) {
      window.electronStore.set('workspace.activityBar.visible', false);
      window.electronMenu.setChecked('activity-bar-item', false);
    } else {
      window.electronStore.set('workspace.activityBar.visible', true);
      window.electronMenu.setChecked('activity-bar-item', true);
    }
  }

  async function updatePrimarySideBarUI() {
    const value = await window.electronStore.get('workspace.primarySideBar.visible');
    if (value) {
      window.electronStore.set('workspace.primarySideBar.visible', false);
      (document.querySelector('#toggle-left-side-bar-button i') as HTMLElement).style.color = '#939494';
      window.electronMenu.setChecked('primary-side-bar-item', false);
    } else {
      window.electronStore.set('workspace.primarySideBar.visible', true);
      (document.querySelector('#toggle-left-side-bar-button i') as HTMLElement).style.color = 'white';
      window.electronMenu.setChecked('primary-side-bar-item', true);
    }
  }

  async function updateSecondarySideBarUI() {
    const value = await window.electronStore.get('workspace.secondarySideBar.visible');
    if (value) {
      window.electronStore.set('workspace.secondarySideBar.visible', false);
      (document.querySelector('#toggle-right-side-bar-button i') as HTMLElement).style.color = '#939494';
      window.electronMenu.setChecked('secondary-side-bar-item', false);
    } else {
      window.electronStore.set('workspace.secondarySideBar.visible', true);
      (document.querySelector('#toggle-right-side-bar-button i') as HTMLElement).style.color = 'white';
      window.electronMenu.setChecked('secondary-side-bar-item', true);
    }
  }

  async function updatePanelUI() {
    const value = await window.electronStore.get('workspace.panel.visible');
    if (value) {
      window.electronStore.set('workspace.panel.visible', false);
      (document.querySelector('#toggle-panel-button i') as HTMLElement).style.color = '#939494';
      window.electronMenu.setChecked('panel-item', false);
    } else {
      window.electronStore.set('workspace.panel.visible', true);
      (document.querySelector('#toggle-panel-button i') as HTMLElement).style.color = 'white';
      window.electronMenu.setChecked('panel-item', true);
    }
  }

  async function updateStatusBarUI() {
    const value = await window.electronStore.get('workspace.statusBar.visible');
    if (value) {
      window.electronStore.set('workspace.statusBar.visible', false);
      window.electronMenu.setChecked('status-bar-item', false);
      document.getElementById('status-bar')!.style.display = 'none';
    } else {
      window.electronStore.set('workspace.statusBar.visible', true);
      window.electronMenu.setChecked('status-bar-item', true);
      document.getElementById('status-bar')!.style.display = 'flex';
    }
  }
});
