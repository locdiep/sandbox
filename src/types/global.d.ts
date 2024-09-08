export {};

declare global {
    interface Window {
        ipcRenderer: typeof import('electron').ipcRenderer;
        platform: {
            isWindows: boolean;
        }
        electronStore: {
            get: (key: string) => Promise<any>;
            set: (key: string, value: any) => Promise<void>;
        }
        electronMenu: {
            setChecked: (id: string, checked: boolean) => void;
        }
    }
}
