<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Kalnoy\Nestedset\NodeTrait;

class File extends Model
{
    use HasFactory, NodeTrait, SoftDeletes, HasUlids;

    protected $fillable = ['name', 'is_folder', 'path', 'storage_path'];

    public function uniqueIds(): array
    {
        return ['ulid'];         //your new column name
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(File::class, 'parent_id')->withTrashed();
    }

    public function starred(): HasOne
    {
        return $this->hasOne(StarredFile::class)
            ->where('user_id', auth()->id());
    }

    public function shared(): HasMany
    {
        return $this->hasMany(FileShared::class);
    }

    public function isOwnedBy(int $userId): bool
    {
        return $this->created_by == $userId;
    }

    public function isSharedTo(int $userId): bool
    {
        return $this->shared()->where('user_id', $userId)->exists();
    }

    public function isRoot(): bool
    {
        return $this->parent_id === null;
    }

    public function owner(): Attribute
    {
        return Attribute::make(
            get: function (mixed $value, array $attributes) {
                return $attributes['created_by'] == auth()->id() ? 'me' : $this->user->name;
            }
        );
    }

    public function getFileSize()
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        $power = $this->size > 0 ? floor(log($this->size, 1024)) : 0;

        return number_format($this->size / pow(1024, $power), 2, '.', ',') . ' ' . $units[$power];
    }
}
