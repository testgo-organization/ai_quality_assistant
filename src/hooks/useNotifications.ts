import { useToast } from '@/components/ui/use-toast';
import { useCallback } from 'react';

export function useNotifications() {
  const { toast } = useToast();

  const showSuccess = useCallback((title: string, description?: string) => {
    toast({
      title,
      description,
      variant: 'default',
      className: 'bg-green-50 border-green-200',
    });
  }, [toast]);

  const showError = useCallback((title: string, description?: string) => {
    toast({
      title,
      description,
      variant: 'destructive',
    });
  }, [toast]);

  const showWarning = useCallback((title: string, description?: string) => {
    toast({
      title,
      description,
      variant: 'default',
      className: 'bg-yellow-50 border-yellow-200',
    });
  }, [toast]);

  const showInfo = useCallback((title: string, description?: string) => {
    toast({
      title,
      description,
      variant: 'default',
      className: 'bg-blue-50 border-blue-200',
    });
  }, [toast]);

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}
