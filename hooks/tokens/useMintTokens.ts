import { useCallback, useState } from 'react';
import {
    useAccount,
    useWriteContract,
    useWaitForTransactionReceipt,
    useSwitchChain,
  } from 'wagmi';
import type { Address, Hash } from 'viem';
import FaucetToken_ABI from '@/abis/FaucetToken_ABI.json';
import { baseSepolia } from 'viem/chains';


export function useMintTokens(tokenAddress: Address, amount: bigint) {
    const { address , chain } = useAccount();
    const { switchChain } = useSwitchChain();
    const [txhash,setTxhash] = useState<Hash | undefined>(undefined);
    const [isPending, setIsPending] = useState(false);

    const { writeContractAsync } = useWriteContract();

    const mintTokens = useCallback(async () => {
        if (!address) return;
        setIsPending(true);

        if (chain?.id !== baseSepolia.id) {
            await switchChain({ chainId: baseSepolia.id });
          }
        try {
            const tx = await writeContractAsync({
                address: tokenAddress,
                abi: FaucetToken_ABI,
                functionName: 'mint',
                args: [address, amount],
            });
            setTxhash(tx);
            return tx;
        } catch (error) {
            console.error('Mint tokens error:', error);
        } finally {
            setIsPending(false);
        }
    }, [address, tokenAddress, amount, writeContractAsync]);

    const { data: receipt } = useWaitForTransactionReceipt({
        hash: txhash,
    });

    return {
        mintTokens,
        isPending,
        txhash,
        receipt,
  };
}