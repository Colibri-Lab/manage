<?php

/**
 * Fields
 *
 * @author Vahan P. Grigoryan <vahan.grigoryan@gmail.com>
 * @copyright 2019 Colibri
 * @package Colibri\Data\Storages\Fields
 */
namespace App\Modules\Manage\Models\Fields;

use Colibri\Collections\ArrayList;
use Colibri\Data\Storages\Storage;
use Colibri\Data\Storages\Fields\Field;

/**
 * Класс поле список файлов
 * @author Vahan P. Grigoryan
 * @package Colibri\Data\Storages\Fields
 */
class RemoteFileListField extends ArrayList
{

    public const JsonSchema = [
        'type' => 'array',
        'items' => RemoteFileField::JsonSchema
    ];

    /**
     * Конструктор
     * @param string $data данные из поля
     * @return void
     */
    public function __construct(array |string $sources, ? Storage $storage = null, ? Field $field = null)
    {
        parent::__construct([]);
        if (is_string($sources)) {
            $sources = json_decode($sources);
        }
        foreach ($sources as $remoteFileData) {
            $this->Add(new RemoteFileField($remoteFileData));
        }
    }

    public function ToArray(): array
    {
        $ret = [];
        foreach ($this->data as $f) {
            $ret[] = $f->ToArray();
        }
        return $ret;
    }

    /**
     * Возвращает строку для записи в поле
     * @param string $splitter разделитель
     * @return string собранная строка из путей файлов
     */
    public function ToString($splitter = ';'): string
    {
        $sources = [];
        foreach ($this as $remoteFile) {
            $sources[] = $remoteFile->ToArray();
        }
        return json_encode($sources);
    }

    /**
     * Return string value of this object
     *
     * @return string
     */
    public function __toString()
    {
        return $this->ToString();
    }


}