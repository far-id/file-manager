<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class ShareFileRequest extends FileActionRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return array_merge(parent::rules(), [
            'email' => [
                'required',
                'email',
                Rule::exists('users', 'email')->where(fn ($q) => $q->where('id', '!=', $this->user()->id)),
            ],
        ]);
    }
}
