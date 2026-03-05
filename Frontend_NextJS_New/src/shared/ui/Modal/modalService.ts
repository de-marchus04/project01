export type ModalOptions = {
  title: string;
  message: string;
  type: 'confirm' | 'prompt' | 'alert';
  confirmText?: string;
  cancelText?: string;
  placeholder?: string;
};

type ModalCallback = (result: any) => void;

class ModalService {
  private listener: ((options: ModalOptions, callback: ModalCallback) => void) | null = null;

  setListener(listener: (options: ModalOptions, callback: ModalCallback) => void) {
    this.listener = listener;
  }

  removeListener() {
    this.listener = null;
  }

  show(options: ModalOptions): Promise<any> {
    return new Promise((resolve) => {
      if (this.listener) {
        this.listener(options, resolve);
      } else {
        if (options.type === 'confirm') {
          resolve(window.confirm(options.message));
        } else if (options.type === 'prompt') {
          resolve(window.prompt(options.message));
        } else {
          window.alert(options.message);
          resolve(true);
        }
      }
    });
  }

  confirm(title: string, message: string, confirmText = 'ОК', cancelText = 'Отмена'): Promise<boolean> {
    return this.show({ type: 'confirm', title, message, confirmText, cancelText });
  }

  prompt(title: string, message: string, placeholder = ''): Promise<string | null> {
    return this.show({ type: 'prompt', title, message, placeholder });
  }

  alert(title: string, message: string): Promise<void> {
    return this.show({ type: 'alert', title, message });
  }
}

export const modalService = new ModalService();
