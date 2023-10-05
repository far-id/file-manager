<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class DestroyFileRequest extends ParentIdBaseRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return array_merge(parent::rules(), [
            'all' => ['nullable', 'bool'],
            'ids.*' => Rule::exists('files', 'id')->where('created_by', auth()->id()),
        ]);
    }
}
