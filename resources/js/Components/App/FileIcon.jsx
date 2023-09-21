import React from 'react';
import { BsFolder2 } from 'react-icons/bs';
import { isImage, isPDF, isAudio, isVideo, isWord, isExcel, isZip, isText, } from '@/Helper/file-helper';

export default function FileIcon({ file }) {
    const fileType = (file) => {
        if (isImage(file)) {
            return 'photo.png';
        } else if (isPDF(file)) {
            return 'pdf.png';
        } else if (isAudio(file)) {
            return 'music.png';
        } else if (isVideo(file)) {
            return 'play.png';
        } else if (isWord(file)) {
            return 'word.png';
        } else if (isExcel(file)) {
            return 'sheets.png';
        } else if (isZip(file)) {
            return 'zip.png';
        } else if (isText(file)) {
            return 'txt.png';
        } else {
            return 'attach-file.png';
        }
    };

    return (
        <>
            { file.is_folder == 1 ? (
                <BsFolder2 className='w-5 h-5' />
            ) :
                <img
                    src={ `/images/icons/${fileType(file)}` }
                    className='w-6 h-6'
                />
            }
        </>
    );
};
