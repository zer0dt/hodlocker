function FeedPlaceholder() {
    return (
      <div>
          <div className="mb-0">
            <div className="bg-white-100 p-0 flex flex-col">
              <div className="bg-white dark:bg-black border dark:border-gray-800 rounded-lg flex flex-col relative">
                <div className="flex justify-between px-2 py-2">
                  <div className="flex items-center rounded-full">
                    <div className="bg-gray-300 rounded-full w-10 h-10 animate-pulse"></div>
                    <div className="ml-3">
                      <div className="bg-gray-300 h-4 mb-1 rounded w-24 animate-pulse"></div>
                      <div className="bg-gray-300 h-3 rounded w-16 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="bg-gray-300 rounded w-4 h-4 animate-pulse"></div>
                </div>
                <div className="text-md px-4 pb-0 ml-12">
                  <div className="bg-gray-300 h-4 mb-2 rounded w-full animate-pulse"></div>
                  <div className="bg-gray-300 h-4 mb-2 rounded w-2/3 animate-pulse"></div>
                  <div className="bg-gray-300 h-4 mb-2 rounded w-1/2 animate-pulse"></div>
                </div>
                <div className="flex justify-between mx-2 my-2">
                  <div className="ml-12 flex items-center">
                    <div className="bg-gray-300 rounded w-6 h-6 animate-pulse"></div>
                    <div className="bg-gray-300 h-4 ml-2 rounded w-16 animate-pulse"></div>
                  </div>
                  <div className="flex gap-1">
                    <div className="bg-gray-300 rounded w-6 h-6 animate-pulse"></div>
                    <div className="bg-gray-300 h-4 rounded w-16 animate-pulse"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="bg-gray-300 rounded w-6 h-6 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

      </div>
    );
  }
  
  export default FeedPlaceholder;
  