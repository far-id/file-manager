<?php

namespace App\Http\Requests;

use App\Models\File;
use Illuminate\Validation\Rule;

class StoreFolderRequest extends ParentIdBaseRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return array_merge(parent::rules(), [
            'name' => [
                'required',
                Rule::unique(File::class, 'name')
                    ->where('created_by', auth()->id())
                    ->where('parent_id', $this->parent_id) // this parent_id is from ParentIdBaseRequest class
                    ->whereNull('deleted_at'),
            ]
        ]);
    }

    public function message(): array
    {
        return [
            'name.unique' => 'Folder ":input" already exists'
        ];
    }
}
