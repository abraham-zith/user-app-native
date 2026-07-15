import { AlertButton, AlertOptions } from 'react-native';

type AlertListener = (
  title: string,
  message?: string,
  buttons?: AlertButton[],
  options?: AlertOptions
) => void;

class GlobalAlertManager {
  private listener: AlertListener | null = null;

  setListener(listener: AlertListener) {
    this.listener = listener;
  }

  removeListener() {
    this.listener = null;
  }

  show(
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: AlertOptions
  ) {
    if (this.listener) {
      this.listener(title, message, buttons, options);
    } else {
      console.warn('GlobalAlertManager: No listener attached for alert', title);
    }
  }
}

export default new GlobalAlertManager();
