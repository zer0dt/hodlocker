export const DEFAULT_DEPLOY_POST_AMOUNT = 0.00000001;
export const DEFAULT_DEPLOY_POST_BLOCKS = 144;
export const DEFAULT_LOCKLIKE_AMOUNT = 0.01;
export const DEFAULT_LOCKLIKE_BLOCKS = 1000;

export function LockInput({
  bitcoinAmount,
  setBitcoinAmount,
  blocksAmount,
  setBlocksAmount,
  isDisabled = false,
}: {
  bitcoinAmount: string;
  blocksAmount: string;
  setBitcoinAmount: (value: string) => unknown;
  setBlocksAmount: (value: string) => unknown;
  isDisabled?: boolean;
}) {
  const containerClasses = "text-center text-l w-1/2 pl-1"
  const labelClasses =
    "w-full block mb-1 text-sm font-medium text-gray-900 dark:text-white";
  const inputClasses =
    "text-l bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-slate-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500";
  return (
    <div className="flex justify-between w-full px-3">
      <div className={containerClasses}>
        <label htmlFor="bitcoin-input" className={labelClasses}>
          bitcoin
        </label>
        <input
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => setBitcoinAmount(e.target.value)}
          type="number"
          autoComplete="off"
          name="bitcoin-input"
          placeholder="0.00000001"
          min={0.00000001}
          max={21}
          step="any"
          required
          value={bitcoinAmount}
          className={inputClasses}
          disabled={isDisabled}
        />
      </div>
      <div className={containerClasses}>
        <label htmlFor="block-input" className={labelClasses}>
          blocks
        </label>
        <input
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => setBlocksAmount(e.target.value)}
          type="number"
          autoComplete="off"
          name="block-input"
          placeholder="1000"
          min={1}
          step="any"
          required
          value={blocksAmount}
          className={inputClasses}
          disabled={isDisabled}
        />
      </div>
    </div>
  );
}
