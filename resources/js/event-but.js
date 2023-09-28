import mitt from 'mitt';

export const FILE_UPLOAD_STARTED = 'FILE_UPLOAD_STARTED';
export const RELOAD_AFTER_UPLOAD = 'RELOAD_AFTER_UPLOAD';

export const emitter = mitt();
