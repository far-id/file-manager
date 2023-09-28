import FileIcon from '@/Components/App/FileIcon';
import { httpGet } from '@/Helper/http-helper';
import AuthLayout from '@/Layouts/AuthLayout';
import { RELOAD_AFTER_UPLOAD, emitter } from '@/event-but';
import { Link, router } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';

function MyFiles({ files, ancestors }) {
    const [allFiles, setAllFiles] = useState([...files.data]);
    const loadMoreRef = useRef();
    const nextPage = useRef(files.links.next)

    const openFolder = (file) => {
        if (!file.is_folder) {
            return;
        }
        router.visit(route('file.myFiles', { folder: file.path }));
    }

    useEffect(() => {
        const observer = new IntersectionObserver((entries) =>
            entries.forEach(entry => {
                if (entry.isIntersecting && nextPage.current != null) {
                    httpGet(nextPage.current).then(res => {
                        setAllFiles(prevFiles => [...prevFiles, ...res.data]);
                        nextPage.current = res.links.next;
                    });
                }
            }),
            { rootMargin: '-250px 0px 0px 0px', }
        );

        observer.observe(loadMoreRef.current);
    }, []);

    useEffect(() => {
        const reloadPage = () => {
            httpGet(route('file.myFiles')).then(res => {
                setAllFiles([...res.data]);
                nextPage.current = res.links.next;
            });
        };

        emitter.on(RELOAD_AFTER_UPLOAD, reloadPage);
    }, [])


    return (
        <>
            <div className="relative shadow-md sm:rounded-lg">
                <div className="flex items-center justify-between pb-4">
                    <nav className="flex" aria-label="Breadcrumb">
                        <ol className="inline-flex items-center space-x-1 md:space-x-3">
                            <li className="inline-flex items-center">
                                <Link href={ route('file.myFiles') } className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white">
                                    <svg className="w-3 h-3 mr-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z" />
                                    </svg>
                                    Home
                                </Link>
                            </li>
                            { ancestors.data.filter((anchestor) => anchestor.parent_id != null).map((anchestor, i) => (
                                <li key={ i } onClick={ () => openFolder(anchestor) }>
                                    <div className="flex items-center">
                                        <svg className="w-3 h-3 mx-1 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 } d="m1 9 4-4-4-4" />
                                        </svg>
                                        <span href="#"
                                            className={ `
                                            ${i + 1 !== ancestors.data.length && 'hover:text-blue-600 dark:hover:text-white'}
                                            ml-1 text-sm font-medium text-gray-700  md:ml-2 dark:text-gray-400 ` }
                                        >{ anchestor.name }
                                        </span>
                                    </div>
                                </li>
                            )) }
                        </ol>
                    </nav>
                    <label htmlFor="table-search" className="sr-only">Search</label>
                    <div className="relative">
                        {/* <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                        </div>
                        <input type="text" id="table-search" className="block p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search for items" /> */}
                    </div>
                </div>
                <div className='overflow-auto block max-h-96 sm:max-h-[82vh] scrollbar scrollbar-thumb-blue-900 scrollbar-track-gray-800 scrollbar-thumb-rounded-full scrollbar-w-2'>
                    { allFiles.length > 0
                        ? (
                            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                <thead className="sticky top-0 w-full text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" className="p-4">
                                            <div className="flex items-center">
                                                <input id="checkbox-all-search" type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                                <label htmlFor="checkbox-all-search" className="sr-only">checkbox</label>
                                            </div>
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Name
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Owner
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Last Modified
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            size
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    { allFiles.map((file, i) => (
                                        <tr key={ i } onDoubleClick={ () => openFolder(file) }
                                            className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                            <td className="w-4 p-4">
                                                <div className="flex items-center">
                                                    <input id="checkbox-table-search-1" type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                                    <label htmlFor="checkbox-table-search-1" className="sr-only">checkbox</label>
                                                </div>
                                            </td>
                                            <th scope="row" className="flex items-center gap-2 px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                <FileIcon file={ file } />
                                                { file.name }
                                            </th>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                { "owner" }
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                { file.updated_at }
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                { file.size }
                                            </td>
                                        </tr>
                                    )) }
                                </tbody>
                            </table>
                        )
                        : (
                            <div className='flex items-center justify-center text-lg'>
                                <span className='px-4 py-2 bg-gray-900 rounded-full shadow'>Use "Create New" button.</span>
                            </div>
                        )
                }
                    <div ref={ loadMoreRef }></div>
                </div>
            </div>

        </>
    );
}

MyFiles.layout = (page) => <AuthLayout children={ page } />;
export default MyFiles;
