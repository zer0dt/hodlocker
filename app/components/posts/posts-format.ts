export function formatBitcoinValue(initialPlusLikesTotal: number) {
    if (initialPlusLikesTotal < 0.001) {
      return "<.001";
    } else if (initialPlusLikesTotal < 1) {
      return initialPlusLikesTotal.toFixed(3);
    } else if (initialPlusLikesTotal < 10) {
      return initialPlusLikesTotal.toFixed(3);
    } else {
      return (
        initialPlusLikesTotal.toLocaleString(undefined, {
          maximumFractionDigits: 3,
        })
      );
    }
}