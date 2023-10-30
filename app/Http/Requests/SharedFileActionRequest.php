<?php

namespace App\Http\Requests;

use App\Models\File;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SharedFileActionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'all' => ['nullable', 'bool'],
            'ids.*' => [
                'required_if:all,false',
                function ($attribute, $value, $fail) {
                    $sharedFile = File::where('id', $value)
                        ->whereHas('shared', function ($query) {
                            $query->where('user_id', auth()->id());
                        })->first();

                    if (!$sharedFile && $this->travelParent(request('parent_ulid'))) {
                        $fail('file notawefsdfad found');
                    }
                }
            ]
        ];
    }

    private function travelParent(string|null $parentUlid): bool
    {
        if (!$parentUlid) {
            return true;
        }

        $sharedFile = File::where('ulid', $parentUlid)
            ->whereHas('shared', function ($query) {
                $query->where('user_id', auth()->id());
            })->first();

        if (!$sharedFile) {
            $file = File::where('ulid', $parentUlid)->first();
            $this->travelParent($file->first()->parent->ulid);
        }

        return false;
    }
}
