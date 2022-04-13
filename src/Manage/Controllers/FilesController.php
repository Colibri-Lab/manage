<?php


namespace App\Modules\Manage\Controllers;


use Colibri\App;
use Colibri\Events\EventsContainer;
use Colibri\IO\FileSystem\File;
use Colibri\Utils\Cache\Bundle;
use Colibri\Utils\Debug;
use Colibri\Utils\ExtendedObject;
use Colibri\Web\RequestCollection;
use Colibri\Web\Controller as WebController;
use Colibri\Web\Templates\PhpTemplate;
use Colibri\Web\View;
use ScssPhp\ScssPhp\Compiler;
use ScssPhp\ScssPhp\OutputStyle;
use Colibri\Web\PayloadCopy;
use Colibri\Data\Storages\Storages;
use ReflectionClass;
use App\Modules\Security\Module as SecurityModule;
use FileServerApiClient\Client;
use FileServerApiClient\AdminClient;
use Colibri\Common\MimeType;
use Colibri\Common\DateHelper;

class FilesController extends WebController
{

    
    public function ByGuid(RequestCollection $get, RequestCollection $post, ?PayloadCopy $payload): object
    {
        if(!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        $bucket = $get->bucket;
        $guid = $get->guid;
        $type = $get->type;

        $cacheKey = md5($bucket.$guid);
        $cacheRoot = App::$config->Query('cache')->GetValue().'img/';
        $cachePath = App::$webRoot.$cacheRoot.substr($cacheKey, 0, 4).'/'.substr($cacheKey, -4).'/'.$cacheKey.'.'.$type;
        if(File::Exists($cachePath)) {
            return $this->Finish(200, $cacheKey.'.'.$type, File::Read($cachePath), 'utf-8', ['Cache-Control' => 'Public', 'Expires' => DateHelper::ToDbString(time())]);
        }

        $host = App::$config->Query('hosts.services.fs')->GetValue();

        $adminClient = new AdminClient($host, '');
        $bucketData = $adminClient->GetBucket($bucket);

        $client = new Client($host, $bucketData->token);
        $data = $client->GetObject($guid);
        $stat = $client->StatObject($guid);
        $type = MimeType::GetType($stat->mimetype);

        File::Write($cachePath, $data, true, '777');

        return $this->Finish(200, 'file.' . $type, $data, 'utf-8', ['Cache-Control' => 'Public', 'Expires' => DateHelper::ToDbString(time())]);
    }

}
