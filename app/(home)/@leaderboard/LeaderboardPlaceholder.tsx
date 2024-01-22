function LeaderboardPlaceholder() {
    return (
      <div className="bg-white-100 dark:bg-gray-800 p-0 flex flex-col h-full mb-4">
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-sm h-full flex flex-col relative">
  
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center">
              <div className="bg-gray-300 rounded-full h-10 w-10 animate-pulse"></div>
              <div className="ml-3 flex flex-col">
                <div className="bg-gray-300 h-4 mb-1 rounded w-3/4 animate-pulse dark:opacity-60"></div>
                <div className="bg-gray-300 h-3 rounded w-1/4 animate-pulse dark:opacity-60"></div>
              </div>
            </div>
            <div className="bg-gray-300 h-6 w-6 rounded-full animate-pulse dark:opacity-60"></div>
          </div>
  
          <div className="px-4 pb-2 ml-12">
            <div className="bg-gray-300 h-4 mb-2 rounded w-full animate-pulse dark:opacity-60"></div>
            <div className="bg-gray-300 h-4 mb-2 rounded w-3/4 animate-pulse dark:opacity-60"></div>
            <div className="bg-gray-300 h-4 mb-2 rounded w-1/2 animate-pulse dark:opacity-60"></div>
          </div>
  
          <div className="flex justify-between mx-4 mb-2">
            <div className="flex gap-1 ml-12 items-center">
              <div className="bg-gray-300 h-6 w-6 rounded-full animate-pulse dark:opacity-60"></div>
              <div className="bg-gray-300 h-4 rounded animate-pulse dark:opacity-60"></div>
            </div>
  
            <div className="flex gap-2">
              <div className="bg-gray-300 h-6 w-6 rounded-full animate-pulse dark:opacity-60"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  export default LeaderboardPlaceholder;
  
