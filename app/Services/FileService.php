<?php

namespace App\Services;

use App\Http\Requests\DestroyFileRequest;
use App\Http\Requests\StoreFileRequest;
use App\Http\Requests\StoreFolderRequest;
use App\Models\File;
use App\Models\User;
use Illuminate\Http\UploadedFile;

class FileService
{
    public function getRoot(): File
    {
        return File::query()
            ->whereIsRoot()
            ->where('created_by', auth()->id())
            ->firstOrFail();
    }

    public function storeFolder(StoreFolderRequest $request)
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

    public function storeFile(StoreFileRequest $request)
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

    public function destroy(DestroyFileRequest $request)
    {
        $data = $request->validated();
        $parent = $request->parent;

        if ($data['all']) {
            foreach ($parent->children as $child) {
                $child->delete();
            }
        } else {
            foreach ($data['ids'] as $id) {
                $file = File::findOrFail($id);
                $file->delete();
            }
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
}
