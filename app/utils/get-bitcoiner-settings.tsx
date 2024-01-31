
import prisma from '@/app/db';

export const dynamic = 'force-dynamic'

export interface BitcoinerSettings {
    handle_id: string;
    amountToLock: number;
    blocksToLock: number;
  }

export const getBitcoinerSettings = async (bitcoinerHandle: string): Promise<BitcoinerSettings | undefined> => {
    try {
        // Query the database for the Bitcoiner's settings based on the handle
        const bitcoinerSettings = await prisma.settings.findUnique({
            where: {
                handle_id: bitcoinerHandle,
            },
        });

        // Return the Bitcoiner's settings if found, otherwise return null
        return bitcoinerSettings ?? undefined;
    } catch (error) {
        // Handle any errors that may occur during the database query
        console.error('Error fetching Bitcoiner settings:', error);
        return undefined;
    }
};

