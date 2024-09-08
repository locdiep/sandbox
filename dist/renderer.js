"use strict";
window.addEventListener('DOMContentLoaded', () => {
    const { ipcRenderer } = window;
    const minimizeButton = document.getElementById('minimize-button');
    const maximizeButton = document.getElementById('maximize-button');
    const restoreButton = document.getElementById('restore-button');
    const closeButton = document.getElementById('close-button');
    if (window.platform.isWindows) {
        // Handle minimize button
        minimizeButton.style.display = 'inline';
        minimizeButton.addEventListener('click', () => {
            ipcRenderer.send('minimize-window');
        });
        // Handle close button
        closeButton.style.display = 'inline';
        closeButton.addEventListener('click', () => {
            ipcRenderer.send('quit-app');
        });
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
    }
    else {
        minimizeButton.style.display = 'none';
        maximizeButton.style.display = 'none';
        restoreButton.style.display = 'none';
        closeButton.style.display = 'none';
        document.getElementById('logo').style.display = 'none';
        document.getElementById('custom-layout-button').style.marginRight = '5px';
    }
    ipcRenderer.on('blur', () => {
        document.getElementById('title-bar').style.backgroundColor = '#1f1f1f';
    });
    ipcRenderer.on('focus', () => {
        document.getElementById('title-bar').style.backgroundColor = '#181818';
    });
    document.getElementById('custom-layout-button').addEventListener('click', (event) => {
        event.preventDefault();
        const buttonRect = event.currentTarget.getBoundingClientRect();
        ipcRenderer.send('show-custom-layout-menu', { x: buttonRect.left, y: buttonRect.bottom });
    });
    document.getElementById('status-bar').addEventListener('contextmenu', (event) => {
        event.preventDefault();
        ipcRenderer.send('show-status-bar-menu');
    });
    ipcRenderer.on('global-shortcut', (event, shortcut) => {
        switch (shortcut) {
            case 'ctrl+B':
                updatePrimarySideBarUI();
                break;
            case 'ctrl+shift+B':
                updateSecondarySideBarUI();
                break;
            case 'ctrl+J':
                updatePanelUI();
                break;
            default:
        }
    });
    initActivityBarUI();
    initPrimarySideBarUI();
    initSecondarySideBarUI();
    initPanelUI();
    initStatusBarUI();
    initSideBar();
    initPanelAlignment();
    ipcRenderer.on('toggle-activity-bar', updateActivityBarUI);
    ipcRenderer.on('toggle-primary-side-bar', updatePrimarySideBarUI);
    ipcRenderer.on('toggle-secondary-side-bar', updateSecondarySideBarUI);
    ipcRenderer.on('toggle-panel', updatePanelUI);
    ipcRenderer.on('toggle-status-bar', updateStatusBarUI);
    ipcRenderer.on('set-left-side-bar-primary', setLeftSideBarPrimary);
    ipcRenderer.on('set-right-side-bar-primary', setRightSideBarPrimary);
    ipcRenderer.on('set-left-panel', setLeftPanelAlignment);
    ipcRenderer.on('set-center-panel', setCenterPanelAlignment);
    ipcRenderer.on('set-right-panel', setRightPanelAlignment);
    ipcRenderer.on('set-full-panel', setFullPanelAlignment);
    async function initSideBar() {
        //TODO
    }
    async function initActivityBarUI() {
        const value = await window.electronStore.get('workspace.activityBar.visible');
        if (value) {
            window.electronStore.set('workspace.activityBar.visible', true);
            window.electronMenu.setChecked('activity-bar-item', true);
        }
        else {
            window.electronStore.set('workspace.activityBar.visible', false);
            window.electronMenu.setChecked('activity-bar-item', false);
        }
    }
    async function initPrimarySideBarUI() {
        const value = await window.electronStore.get('workspace.primarySideBar.visible');
        if (value) {
            window.electronStore.set('workspace.primarySideBar.visible', true);
            document.querySelector('#toggle-left-side-bar-button i').style.color = 'white';
            window.electronMenu.setChecked('primary-side-bar-item', true);
        }
        else {
            window.electronStore.set('workspace.primarySideBar.visible', false);
            document.querySelector('#toggle-left-side-bar-button i').style.color = '#939494';
            window.electronMenu.setChecked('primary-side-bar-item', false);
        }
    }
    async function initSecondarySideBarUI() {
        const value = await window.electronStore.get('workspace.secondarySideBar.visible');
        if (value) {
            window.electronStore.set('workspace.secondarySideBar.visible', true);
            document.querySelector('#toggle-right-side-bar-button i').style.color = 'white';
            window.electronMenu.setChecked('secondary-side-bar-item', true);
        }
        else {
            window.electronStore.set('workspace.secondarySideBar.visible', false);
            document.querySelector('#toggle-right-side-bar-button i').style.color = '#939494';
            window.electronMenu.setChecked('secondary-side-bar-item', false);
        }
    }
    async function initPanelUI() {
        const value = await window.electronStore.get('workspace.panel.visible');
        if (value) {
            window.electronStore.set('workspace.panel.visible', true);
            document.querySelector('#toggle-panel-button i').style.color = 'white';
            window.electronMenu.setChecked('panel-item', true);
        }
        else {
            window.electronStore.set('workspace.panel.visible', false);
            document.querySelector('#toggle-panel-button i').style.color = '#939494';
            window.electronMenu.setChecked('panel-item', false);
        }
    }
    async function initStatusBarUI() {
        const value = await window.electronStore.get('workspace.statusBar.visible');
        if (value) {
            window.electronStore.set('workspace.statusBar.visible', true);
            window.electronMenu.setChecked('status-bar-item', true);
            document.getElementById('status-bar').style.display = 'flex';
        }
        else {
            window.electronStore.set('workspace.statusBar.visible', false);
            window.electronMenu.setChecked('status-bar-item', false);
            document.getElementById('status-bar').style.display = 'none';
        }
    }
    function selectPanelAlignment(selectedAlignment, allAlignments) {
        document.getElementById(selectedAlignment).style.display = 'flex';
        allAlignments.forEach(alignment => {
            if (alignment !== selectedAlignment) {
                document.getElementById(alignment).style.display = 'none';
            }
        });
    }
    async function initPanelAlignment() {
        const value = await window.electronStore.get('workspace.panelAlignment');
        switch (value) {
            case 'left': {
                selectPanelAlignment('left-panel-placeholder', ['left-panel-placeholder', 'center-panel-placeholder', 'right-panel-placeholder', 'full-panel-placeholder']);
                break;
            }
            case 'center': {
                selectPanelAlignment('center-panel-placeholder', ['left-panel-placeholder', 'center-panel-placeholder', 'right-panel-placeholder', 'full-panel-placeholder']);
                break;
            }
            case 'right': {
                selectPanelAlignment('right-panel-placeholder', ['left-panel-placeholder', 'center-panel-placeholder', 'right-panel-placeholder', 'full-panel-placeholder']);
                break;
            }
            case 'full': {
                selectPanelAlignment('full-panel-placeholder', ['left-panel-placeholder', 'center-panel-placeholder', 'right-panel-placeholder', 'full-panel-placeholder']);
                break;
            }
            default: break;
        }
    }
    async function updateActivityBarUI() {
        const value = await window.electronStore.get('workspace.activityBar.visible');
        if (value) {
            window.electronStore.set('workspace.activityBar.visible', false);
            window.electronMenu.setChecked('activity-bar-item', false);
        }
        else {
            window.electronStore.set('workspace.activityBar.visible', true);
            window.electronMenu.setChecked('activity-bar-item', true);
        }
    }
    async function updatePrimarySideBarUI() {
        const value = await window.electronStore.get('workspace.primarySideBar.visible');
        if (value) {
            window.electronStore.set('workspace.primarySideBar.visible', false);
            document.querySelector('#toggle-left-side-bar-button i').style.color = '#939494';
            window.electronMenu.setChecked('primary-side-bar-item', false);
        }
        else {
            window.electronStore.set('workspace.primarySideBar.visible', true);
            document.querySelector('#toggle-left-side-bar-button i').style.color = 'white';
            window.electronMenu.setChecked('primary-side-bar-item', true);
        }
    }
    async function updateSecondarySideBarUI() {
        const value = await window.electronStore.get('workspace.secondarySideBar.visible');
        if (value) {
            window.electronStore.set('workspace.secondarySideBar.visible', false);
            document.querySelector('#toggle-right-side-bar-button i').style.color = '#939494';
            window.electronMenu.setChecked('secondary-side-bar-item', false);
        }
        else {
            window.electronStore.set('workspace.secondarySideBar.visible', true);
            document.querySelector('#toggle-right-side-bar-button i').style.color = 'white';
            window.electronMenu.setChecked('secondary-side-bar-item', true);
        }
    }
    async function updatePanelUI() {
        const value = await window.electronStore.get('workspace.panel.visible');
        if (value) {
            window.electronStore.set('workspace.panel.visible', false);
            document.querySelector('#toggle-panel-button i').style.color = '#939494';
            window.electronMenu.setChecked('panel-item', false);
        }
        else {
            window.electronStore.set('workspace.panel.visible', true);
            document.querySelector('#toggle-panel-button i').style.color = 'white';
            window.electronMenu.setChecked('panel-item', true);
        }
    }
    async function updateStatusBarUI() {
        const value = await window.electronStore.get('workspace.statusBar.visible');
        if (value) {
            window.electronStore.set('workspace.statusBar.visible', false);
            window.electronMenu.setChecked('status-bar-item', false);
            document.getElementById('status-bar').style.display = 'none';
        }
        else {
            window.electronStore.set('workspace.statusBar.visible', true);
            window.electronMenu.setChecked('status-bar-item', true);
            document.getElementById('status-bar').style.display = 'flex';
        }
    }
    function setLeftPanelAlignment() {
        window.electronStore.set('workspace.panelAlignment', 'left');
        selectPanelAlignment('left-panel-placeholder', ['left-panel-placeholder', 'center-panel-placeholder', 'right-panel-placeholder', 'full-panel-placeholder']);
    }
    function setCenterPanelAlignment() {
        window.electronStore.set('workspace.panelAlignment', 'center');
        selectPanelAlignment('center-panel-placeholder', ['left-panel-placeholder', 'center-panel-placeholder', 'right-panel-placeholder', 'full-panel-placeholder']);
    }
    function setRightPanelAlignment() {
        window.electronStore.set('workspace.panelAlignment', 'right');
        selectPanelAlignment('right-panel-placeholder', ['left-panel-placeholder', 'center-panel-placeholder', 'right-panel-placeholder', 'full-panel-placeholder']);
    }
    function setFullPanelAlignment() {
        window.electronStore.set('workspace.panelAlignment', 'full');
        selectPanelAlignment('full-panel-placeholder', ['left-panel-placeholder', 'center-panel-placeholder', 'right-panel-placeholder', 'full-panel-placeholder']);
    }
    function setLeftSideBarPrimary() {
        // TODO
    }
    function setRightSideBarPrimary() {
        // TODO
    }
});
