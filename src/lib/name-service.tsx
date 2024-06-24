'use client';

import { getAllDomains, reverseLookup } from '@bonfida/spl-name-service';
import { useCluster } from '@/providers/cluster-provider';
import { Connection, PublicKey } from '@solana/web3.js';
import { useEffect, useState } from 'react';

import { DomainInfo } from './domain-info';

async function getUserDomainAddresses(connection: Connection, userAddress: PublicKey): Promise<PublicKey[]> {
    const accounts = await getAllDomains(connection, userAddress);
    return accounts;
}

export const useUserDomains = (userAddress: string): [DomainInfo[] | null, boolean] => {
    const { endpoint, cluster } = useCluster();
    const [result, setResult] = useState<DomainInfo[] | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const resolve = async () => {
            // Allow only mainnet and custom
            if (!['mainnet-beta', 'custom'].includes(cluster)) return;
            const connection = new Connection(endpoint, 'confirmed');
            try {
                setLoading(true);
                const userAddressKey = new PublicKey(userAddress);
                const userDomainAddresses = await getUserDomainAddresses(connection, userAddressKey);
                const userDomains = await Promise.all(
                    userDomainAddresses.map(async address => {
                        const domainName = await reverseLookup(connection, address);
                        return {
                            address,
                            name: `${domainName}.sol`,
                            owner: userAddress,
                        };
                    })
                );
                userDomains.sort((a, b) => a.name.localeCompare(b.name));
                setResult(userDomains);
            } catch (err) {
                console.log(`Error fetching user domains ${err}`);
            } finally {
                setLoading(false);
            }
        };
        resolve();
    }, [userAddress, endpoint, cluster]);

    return [result, loading];
};
