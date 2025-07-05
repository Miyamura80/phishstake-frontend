
import { useWalletSync } from './useWalletSync';
import { useWalletOperations } from './useWalletOperations';

export const useWalletManagement = () => {
  const walletSync = useWalletSync();
  const walletOperations = useWalletOperations();

  return {
    ...walletSync,
    ...walletOperations
  };
};
