import React from 'react';

export default function CricleProgress({ percentage = 0 }) {
    const radius = 50;
    const dashArray = Math.PI * (radius * 2);
    const dashOffset = dashArray - (dashArray * percentage) / 100;
    return (
        <div className="flex items-center flex-wrap max-w-md px-10 shadow-xl rounded-2xl h-20">
            <div className="flex items-center justify-center -m-6 overflow-hidden rounded-full">
                <svg className="w-32 h-32 transform translate-x-1 translate-y-1 -rotate-90">
                    <circle className="text-blue-200" strokeWidth={ 8 } stroke="currentColor" fill="transparent" r={ radius } cx={ 60 } cy={ 60 } />
                    <circle className="text-blue-600" strokeWidth={ 7 } strokeLinecap="round" stroke="currentColor" fill="transparent" r={ radius } cx={ 60 } cy={ 60 }
                        style={ {
                            strokeDasharray: dashArray,
                            strokeDashoffset: dashOffset,
                        } } />
                </svg>
                <div className='absolute flex flex-col justify-center items-center mt-3 text-2xl text-blue-100'>
                    <span>{ percentage }%</span>
                    <span className='text-xs'>Uploading</span>
                </div>
            </div>
        </div>
    );
}
