import { useToast } from '@/components/ui/use-toast';

export function useNotifications() {
  const { toast } = useToast();

  const showSuccess = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: 'default',
      className: 'bg-green-50 border-green-200',
    });
  };

  const showError = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: 'destructive',
    });
  };

  const showWarning = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: 'default',
      className: 'bg-yellow-50 border-yellow-200',
    });
  };

  const showInfo = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: 'default',
      className: 'bg-blue-50 border-blue-200',
    });
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}
