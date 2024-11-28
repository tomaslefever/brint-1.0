import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { createActivity } from '@/utils/newactivity';

export const useActivitySubmit = (orderId: string, onSuccess: () => void) => {
  const [activity, setActivity] = useState('');
  const [isActivityFocused, setIsActivityFocused] = useState(false);
  const { toast } = useToast();

  const handleActivitySubmit = async () => {
    setIsActivityFocused(false);

    try {
      if (activity.trim()) {
        await createActivity(orderId, activity);
        setActivity('');
        onSuccess();
      }
    } catch (error) {
      console.error('Error al crear la actividad:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la actividad. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  return {
    activity,
    setActivity,
    isActivityFocused,
    setIsActivityFocused,
    handleActivitySubmit
  };
};
