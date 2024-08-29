import { toast } from 'react-toastify';
import { Toast, ToastProps } from '../components/Toast/Toast';

export const triggerToast = ({ variant, title, body }: Omit<ToastProps, 'onClose'>) => {
  toast[variant](({ closeToast }) => <Toast variant={variant} onClose={closeToast} title={title} body={body} />, {
    icon: false,
    closeButton: false,
  });
};
