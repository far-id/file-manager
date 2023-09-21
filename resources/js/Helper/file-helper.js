function isImage(file) {
    return /^image\/\w+$/.test(file.mime);
}

function isPDF(file) {
    return [
        'application/pdf',
        'application/x-pdf',
        'application/acrobat',
        'application/vnd.pdf',
        'text/pdf',
        'text/x-pdf',
    ].includes(file.mime);
}

function isAudio(file) {
    return ['audio/mpeg',
        'audio/ogg',
        'audio/wav',
        'audio/x-m4a',
        'audio/webm',
    ].includes(file.mime);
}

function isVideo(file) {
    return [
        'video/mp4',
        'video/mpeg',
        'video/ogg',
        'video/quicktime',
        'video/webm',
    ].includes(file.mime);
}

function isWord(file) {
    return [
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-word.document.macroEnabled.12',
        'application/vnd.ms-word.template.macroEnabled.12',
    ].includes(file.mime);
}

function isExcel(file) {
    return [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel.sheet.macroEnabled.12',
        'application/vnd.ms-excel.template.macroEnabled.12',
    ].includes(file.mime);
}

function isZip(file) {
    return [
        'application/zip',
    ].includes(file.mime);
}

function isText(file) {
    return [
        'text/plain',
        'text/html',
        'text/css',
        'text/javascript',
        'text/csv',
    ].includes(file.mime);
}

export {
    isImage,
    isPDF,
    isAudio,
    isVideo,
    isWord,
    isExcel,
    isZip,
    isText,
};
