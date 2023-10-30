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
    public function getDownloadUrl(array $ids, $zipName): array;
    public function createZip($files): string;
    public function deleteForever($files): void;
    public function restore($files): void;
    public function favorite(int $id): void;
    public function renameDescendants($files, string $newPath): void;
    public function share($files, int $user_id): void;
    public function travelDescendants($files, string $ulid): File|null;
}
