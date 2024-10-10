import { useEffect, useState } from 'react';

export function useSnackbar() {
  const [isActive, setIsActive] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isActive) {
      setTimeout(() => setIsActive(false), 3000);
    }
  }, [isActive]);

  const openSnackBar = (msg = 'Something went wrong...') => {
    setMessage(msg);
    setIsActive(true);
  };

  return { isActive, message, openSnackBar };
}
