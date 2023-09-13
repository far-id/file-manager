<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Kalnoy\Nestedset\NodeTrait;

class File extends Model
{
    use HasFactory, NodeTrait, SoftDeletes;

    protected $fillable = ['name', 'is_folder'];

    protected static function booted()
    {
        parent::boot();

        static::creating(function ($model) {
            $model->created_by = auth()->id();
            $model->updated_by = auth()->id();

            if ($model->parent) {
                $model->path = (!$model->parent->isRoot()
                    ? $model->parent->path . '/'
                    : '')
                    . str()->slug($model->name);
            }
        });

        static::updating(function ($model) {
            $model->updated_by = auth()->id();
        });
    }

    public function isOwnedBy(int $userId): bool
    {
        return $this->created_by == $userId;
    }
}
