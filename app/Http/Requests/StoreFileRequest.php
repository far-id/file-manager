<?php

namespace App\Http\Requests;

use App\Models\File;
use Illuminate\Http\UploadedFile;

class StoreFileRequest extends ParentIdBaseRequest
{
    protected function prepareForValidation(): void
    {
        $paths = array_filter($this->relative_paths ?? [], fn ($path) => $path != null);

        $this->merge([
            'file_paths' => $paths,
            'folder_name' => $this->detectFolderName($paths)
        ]);
    }

    protected function passedValidation()
    {
        $data = $this->validated();

        $this->replace([
            'file_tree' => $this->buildFileTree($this->file_paths, $data['files'])
        ]);
    }
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return array_merge(parent::rules(), [
            'files.*' => [
                'required',
                'file',
                function ($attribute, UploadedFile $value, $fail) {
                    if (!$this->folder_name) {
                        $file = File::query()
                            ->where('name', $value->getClientOriginalName())
                            ->where('created_by', auth()->id())
                            ->where('parent_id', $this->parent_id) // this parent_id is from ParentIdBaseRequest class
                            ->whereNull('deleted_at')
                            ->exists();
                        if ($file) {
                            $fail('File "' . $value->getClientOriginalName() . '" already exists');
                        }
                    }
                }
            ],
            'folder_name' => [
                'nullable',
                'string',
                function ($attribute, String $value, $fail) {
                    if ($value) {
                        $file = File::query()->where('name', $value)
                            ->where('created_by', auth()->id())
                            ->where('parent_id', $this->parent_id)
                            ->whereNull('deleted_at')
                            ->exists();

                        if ($file) {
                            $fail('Folder "' . $value . '" already exists.');
                        }
                    }
                }
            ],
        ]);
    }

    private function detectFolderName($paths)
    {
        if (!$paths) {
            return null;
        }

        $parts = explode("/", $paths[0]);

        return $parts[0];
    }

    private function buildFileTree(array $filePaths, array $files) :array {
        $filePaths = array_slice($filePaths,0,count($files));
        $filePaths = array_filter($filePaths, fn($path) => $path!=null);

        $tree = [];
        foreach ($filePaths as $index=> $filePath) {
            $parts = explode('/', $filePath);
            $currentNode = &$tree;

            foreach ($parts as $i=>$part) {
                if(!isset($currentNode[$part])){
                    $currentNode[$part] = [];
                }

                if($i === count($parts) -1){
                    $currentNode[$part] = $files[$index];
                }else{
                    $currentNode = &$currentNode[$part];
                }
            }

        }
        return $tree;
    }
}
