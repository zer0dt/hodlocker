import { HODLTransactions } from "@/app/server-actions";
import Link from "next/link";

interface UnlockableTransactionsProps {
    unlockableTransactions: HODLTransactions[];
    currentBlockHeight: number;
}


export default function UnlockableList({ unlockableTransactions, currentBlockHeight }: UnlockableTransactionsProps) {

    return (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-xs sm:text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-4 py-2">
                    
                </th>
                <th scope="col" className="px-4 py-2">
                  TXID
                </th>
                <th scope="col" className="px-4 py-2">
                  Amount Locked
                </th>
                <th scope="col" className="px-4 py-2">
                  Blocks Remaining
                </th>
              </tr>
            </thead>
            <tbody>
              {unlockableTransactions.map((transaction, index) => (
                <tr
                  key={`transaction-history-${index}`}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <th
                    scope="row"
                    className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >                    
                    { index + 1 }                
                  </th>
                  <th
                    scope="row"
                    className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    <Link href={"https://whatsonchain.com/tx/" + transaction.txid}>
                      {transaction.txid.slice(0, 6) + "..."}
                    </Link>
                  </th>
                  <td className="px-4 py-2">{transaction.amount / 100000000}</td>
                  <td className="px-4 py-2">
                    {transaction.locked_until - currentBlockHeight > 0
                      ? transaction.locked_until - currentBlockHeight
                      : 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    )
}