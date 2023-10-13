<?php

namespace App\Services;

use App\Http\Requests\FileActionRequest;
use App\Http\Requests\StoreFileRequest;
use App\Http\Requests\StoreFolderRequest;
use App\Models\DownloadedFile;
use App\Models\File;
use App\Models\User;
use App\Services\Interface\FileServiceInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use ZipArchive;

class FileService implements FileServiceInterface
{
    public function getRoot(): File
    {
        return File::query()
            ->whereIsRoot()
            ->where('created_by', auth()->id())
            ->firstOrFail();
    }

    public function storeFolder(StoreFolderRequest $request): void
    {
        $parent = $request->parent;

        if (!$parent) {
            $parent = $this->getRoot();
        }

        $file = new File();
        $file->is_folder = 1;
        $file->name = $request->name;

        $parent->appendNode($file);
    }

    public function storeFile(StoreFileRequest $request): void
    {
        $data = $request->validated();
        $parent = $request->parent;
        $fileTree = $request->file_tree;
        $user = $request->user();

        if (!$parent) {
            $parent = $this->getRoot();
        }

        if (!empty($fileTree)) {
            $this->saveFileTree($fileTree, $parent, $user);
        } else {
            foreach ($data['files'] as $file) {
                /** @var UploadedFile $file*/
                $this->saveFile($file, $parent, $user);
            }
        }
    }

    public function destroy(FileActionRequest $request): void
    {
        $data = $request->validated();
        $parent = $request->parent;

        if ($data['all']) {
            foreach ($parent->children as $child) {
                $this->moveToTrash($child);
            }
        } else {
            foreach ($data['ids'] as $id) {
                $file = File::findOrFail($id);
                $this->moveToTrash($file);
            }
        }
    }

    public function download(FileActionRequest $request): array
    {
        $data = $request->validated();
        $parent = $request->parent;

        $all = $data['all'] ?? false;
        $ids = $data['ids'] ?? [];

        if (!$all && empty($ids)) {
            return ['message' => 'please select files to download'];
        }

        if ($all) {
            $url = $this->createZip($parent->children);
            $filename = $parent->name . '.zip';
        } else {
            if (count($ids) === 1) {
                $file = File::findOrFail($ids[0]);
                if ($file->is_folder) {
                    if ($file->children->count() === 0) {
                        return ['message' => 'the folder is empty'];
                    }
                    $url = $this->createZip($file->children);
                    $filename = $file->name . '.zip';
                } else {
                    $destination = 'public/' . pathinfo($file->storage_path, PATHINFO_BASENAME);
                    Storage::copy($file->storage_path, $destination);

                    DownloadedFile::create([
                        'storage_path' => $destination,
                        'created_by' => auth()->id()
                    ]);

                    $url = asset(Storage::url($destination));
                    $filename = $file->name;
                }
            } else {
                $files = File::whereIn('id', $ids)->get();
                $url = $this->createZip($files);
                $filename = $parent->name . '.zip';
            }
        }

        return [
            'url' => $url,
            'filename' => $filename
        ];
    }

    public function deleteForever($files): void
    {
        foreach ($files as $file) {
            $this->deleteFileFromStorage([$file]);
            $file->forceDelete();
        }
    }

    public function restore($files): void
    {
        foreach ($files as $file) {
            $file->restore();
        }
    }

    private function saveFileTree($fileTree, $parent, User $user): void
    {
        foreach ($fileTree as $name => $file) {
            if (is_array($file)) {
                $folder = new File();
                $folder->is_folder = true;
                $folder->name = $name;

                $parent->appendNode($folder);
                $this->saveFileTree($file, $folder, $user);
            } else {
                $this->saveFile($file, $parent, $user);
            }
        }
    }
    private function saveFile($file, $parent, User $user): void
    {
        $model = new File();
        $model->is_folder = false;
        $model->name = $file->getClientOriginalName();
        $model->mime =  $file->getClientMimeType();
        $model->size = $file->getSize();
        $model->storage_path = $file->store('/files/' . $user->id);

        $parent->appendNode($model);
    }

    private function createZip($files): string
    {
        $zipPath = 'zip/' . str()->random() . '.zip';
        $publicPath = "public/$zipPath";

        if (!is_dir(dirname($publicPath))) {
            Storage::makeDirectory(dirname($publicPath));
        }

        $zipFile = Storage::path($publicPath);
        $zip  = new ZipArchive;

        if ($zip->open($zipFile, ZipArchive::CREATE | ZipArchive::OVERWRITE) === true) {
            $this->addFilesToZip($zip, $files);
        }

        $zip->close();

        DownloadedFile::create([
            'storage_path' => $publicPath,
            'created_by' => auth()->id()
        ]);

        return asset(Storage::url($zipPath));
    }

    private function addFilesToZip(ZipArchive $zip, $files, string $ancestors = ''): void
    {
        foreach ($files as $file) {
            if ($file->is_folder) {
                $this->addFilesToZip($zip, $file->children, $ancestors . $file->name . '/');
            } else {
                $zip->addFile(Storage::path($file->storage_path), $ancestors . $file->name);
            }
        }
    }

    private function moveToTrash(File $file): bool
    {
        $file->deleted_at = now();

        return $file->save();
    }

    private function deleteFileFromStorage($files): void
    {
        foreach ($files as $file) {
            if ($file->is_folder) {
                $this->deleteFileFromStorage($file->children);
            } else {
                Storage::delete($file->storage_path);
            }
        }
    }
}
