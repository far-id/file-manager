<?php

namespace App\Services\Interface;

use App\Http\Requests\FileActionRequest;
use App\Http\Requests\StoreFileRequest;
use App\Http\Requests\StoreFolderRequest;
use App\Models\File;

interface FileServiceInterface
{
    public function getRoot(): File;
    public function storeFolder(StoreFolderRequest $request): void;
    public function storeFile(StoreFileRequest $request): void;
    public function destroy(FileActionRequest $request): void;
    public function download(FileActionRequest $request): array;
    public function deleteForever($files): void;
}
