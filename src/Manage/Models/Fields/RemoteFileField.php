<?php

/**
 * Fields
 *
 * @author Vahan P. Grigoryan <vahan.grigoryan@gmail.com>
 * @copyright 2019 Colibri
 * @package Colibri\Data\Storages\Fields
 */
namespace App\Modules\Manage\Models\Fields;

use Colibri\App;
use Colibri\IO\FileSystem\File;
use Colibri\Graphics\Graphics;
use Colibri\Graphics\Size;
use Colibri\Common\MimeType;
use Colibri\Utils\ExtendedObject;
use Colibri\Data\Storages\Storage;
use Colibri\Data\Storages\Fields\Field;
use ReflectionClass;
use FileServerApiClient\AdminClient;
use FileServerApiClient\Client;
use Colibri\AppException;

/**
 * Представление файла в хранилище
 * @author Vahan P. Grigoryan
 * @package Colibri\Data\Storages\Fields
 *
 * @property-read bool $isOnline да, если файл - это url
 * @property-read bool $isValid да, если файл существует
 * @property-read string $path путь к файлу
 * @property-read MimeType $mimetype Майм тип для файла
 * @property-read string $type тип файла
 * @property-read string $data данные файла
 * @property-read Size $size размер изображения, если это графика
 * @property-read string $id название файла, алиас на name
 * @property-read string $name название файла
 * @property-read string $filename название файла, алиас на name
 * @property-read int $filesize размер файла в байтах
 *
 */
class RemoteFileField
{
    /**
     * Данные файла
     * @var string
     */
    private $_data;

    /**
     * Поле
     * @var Field
     */
    private ?Field $_field = null;

    /**
     * Хранилище
     * @var Storage
     */
    private ?Storage $_storage = null;

    private string $_host = '';
    private string $_cache = '';

    private ?AdminClient $_adminClient = null;
    private ?Client $_client = null;

    /**
     * Конструктор
     */
    public function __construct(object|string|null|array $data, ?Storage $storage = null, ?Field $field = null)
    {
        $this->_storage = $storage;
        $this->_field = $field;
        
        if(is_null($data)) {
            $this->_data = [];
        }
        else {
            if(is_string($data)) {
                $data = json_decode($data);
            }
            $this->_data = (object)$data;
        }

        $this->_host = App::$config->Query('hosts.services.fs')->GetValue();
        $this->_cache = App::$config->Query('cache')->GetValue().'img/';
        $this->_adminClient = new AdminClient($this->_host, '');

    }

    /**
     * Геттер
     * @param string $nm свойство
     * @return mixed значение
     */
    public function __get(string $nm): mixed
    {
        switch ($nm) {
            case "isValid": {
                    return true;
                }
            case 'path': {
                    return $this->_data->name;
                }
            case "mimetype": {
                    return new MimeType($this->_data->ext);
                }
            case "type": {
                    return $this->_data->ext;
                }
            case "data": {
                    return $this->_getContent();
                }
            case "filesize":
            case "size": {
                    $this->_data->size;
                }
            case "id":
            case "name":
            case "filename": {
                    if(!isset($this->_data->name)) {
                        $this->_data = $this->_getStat();
                    }
                    return $this->_data->name ?? 'untitled.'.$this->type;
                }
            default: {
                    return null;
                }
        }
    }

    public function __set(string $nm, mixed $data): void
    {
        if($nm == 'name') {
            $this->_data->name = $data;
        }
        else if($nm == 'data') {
            throw new AppException('Can not set the remote file content');
        }
    }

    private function _getStat(): ?object
    {
        try {

            $bucket = $this->_data->bucket;
            $guid = $this->_data->guid;

            $bucketData = $this->_adminClient->GetBucket($bucket);

            if(!$this->_client) {
                $this->_client = new Client($this->_host, $bucketData->token);
            }

            return $this->_client->StatObject($guid);

        }
        catch(\Throwable $e) {
            return null;            
        }
    }

    private function _getContent(): ?string
    {
        try {

            $bucket = $this->_data->bucket;
            $guid = $this->_data->guid;

            $bucketData = $this->_adminClient->GetBucket($bucket);

            if(!$this->_client) {
                $this->_client = new Client($this->_host, $bucketData->token);
            }

            return $this->_client->GetObject($guid);

        }
        catch(\Throwable $e) {
            return null;            
        }

    }


    /**
     * Возвращает строку (путь)
     * @return string путь
     */
    public function ToString(): string
    {
        return json_encode($this->_data);
    }

    /**
     * Возвращает наименование для кэширования
     * @param Size $size размер
     * @return string наименование и путь файла кэша
     */
    public function CacheName(?Size $size = null): string
    {
        if (!$size) {
            $size = new Size(0, 0);
        }
        $cacheKey = md5($this->_data->bucket.$this->_data->guid);
        $subpath = substr($cacheKey, 0, 4).'/'.substr($cacheKey, -4) . '/';
        $name = $cacheKey . "." . $size->width . "x" . $size->height . "." . $this->_data->ext;
        return $this->_cache.$subpath.$name;
        
    }

    /**
     * Проверяет есть ли уже сохраненных кэш для выбранного размера
     * @param Size $size размер
     * @return bool да, если файл существует
     */
    public function CacheExists(?Size $size = null): bool
    {
        return File::Exists($this->CacheName($size));
    }

    /**
     * Кэширует файл в нужном размере, если необходимо
     * @param Size|null $size размер
     * @return void
     */
    public function Cache(?Size $size = null)
    {
        $cachePath = $this->CacheName($size);

        $data = $this->data;
        if ($this->isValid) {
            if ($this->mimetype->isImage && $size && $size instanceof Size && ($size->width != 0 || $size->height != 0)) {
                $s = $this->size->TransformTo($size);
                $img = Graphics::Create(App::$webRoot . $this->_path);
                $img->Resize($s);
                $data = $img->data;
            }
            File::Write(App::$webRoot.$cachePath, $data, true, '777');
        }
    }

    /**
     * Возвращает путь к файлу с кэшом нужно размера и с нужными свойствами
     * @param Size|null $size размер
     * @param mixed $options Свойства
     * @return string путь к кэшу или к файлу
     */
    public function Source(?Size $size = null, mixed $options = null): string
    {
        $options = $options ? new ExtendedObject($options) : new ExtendedObject();

        if (!$options->nocache) {
            if ($this->mimetype->isImage && !$size) {
                $size = new Size(0, 0);
            }

            if (!$this->CacheExists($size)) {
                $this->Cache($size);
            }
            
            return '/' . $this->CacheName($size);

        }
        else {
            return '';
        }
    }

    /**
     * Return string value of this object
     *
     * @return string
     */
    public function __toString(): string
    {
        return $this->ToString();
    }

    public function ToArray(): array
    {
        return (array)$this->_data;
    }


}
