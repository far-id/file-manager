<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FileResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'ulid' => $this->ulid,
            'name' => $this->name,
            'path' => $this->path,
            'owner' => $this->owner,
            'parent_id' => $this->parent_id,
            'is_favorite' => !!$this->starred,
            'is_folder' => $this->is_folder,
            'mime' => $this->mime,
            'size' => $this->getFileSize(),
            'created_at' => $this->created_at->diffForHumans(),
            'updated_at' => $this->updated_at->diffForHumans(),
            'created_by' => $this->created_by,
            'updated_by' => $this->updated_by,
            'deleted_at' => $this->deleted_at != null ? $this->deleted_at->diffForHumans() : '',
        ];
    }
}
