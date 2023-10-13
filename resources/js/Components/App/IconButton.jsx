import React, { useState } from 'react';

export default function IconButton({ children, title = '', className = '', ...props }) {
    const [popOver, setPopOver] = useState(false);
    return (
        <div className='flex items-center justify-center' onMouseEnter={ () => setPopOver(true) } onMouseLeave={ () => setPopOver(false) }>
            <button
                { ...props }
                type='button'
                className={
                    `px-2 py-2 bg-transparent rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none active:ring-2 active:ring-indigo-500 active:ring-offset-2 dark:active:ring-offset-gray-800 transition ease-in-out duration-150 inline-flex items-center font-semibold text-md text-gray-700 dark:text-gray-300 `
                    + className
                }
            >
                { children }
            </button>

            <div className={ `transition-all w-max flex ease-in-out absolute mt-[3.25rem] z-10 ${popOver ? 'delay-1000 visible' : 'invisible'}` }>
                <span className='w-full inline rounded-md p-1 bg-slate-900 text-xs text-gray-100 font-thin tracking-tight'>{ title }</span>
            </div>
        </div >
    );
}
