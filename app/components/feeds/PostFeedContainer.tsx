import React from 'react';

const PostFeedContainer = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="grid grid-cols-1 gap-0 w-586 mx-5">
            {children}
        </div>
    )
}

export default PostFeedContainer;