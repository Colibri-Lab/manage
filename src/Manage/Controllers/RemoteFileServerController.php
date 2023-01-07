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
use App\Modules\Sites\Models\Pages;
use App\Modules\Security\Module as SecurityModule;
use App\Modules\Sites\Module;
use Colibri\Data\Models\DataModelException;
use App\Modules\Tools\Models\Settings;
use Colibri\IO\FileSystem\Finder;
use Colibri\IO\FileSystem\Directory;
use FileServerApiClient\Client;
use FileServerApiClient\AdminClient;

class RemoteFileServerController extends WebController
{
    public function ListBuckets(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {

        if (!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        if (!SecurityModule::$instance->current->IsCommandAllowed('tools.files')) {
            return $this->Finish(403, 'Permission denied');
        }

        $fsServerDomain = App::$config->Query('hosts.services.fs')->GetValue();
        $fs = new AdminClient($fsServerDomain);
        $list = $fs->ListBuckets();

        return $this->Finish(200, 'ok', $list);
    }

    public function ListFiles(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {

        if (!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        if (!SecurityModule::$instance->current->IsCommandAllowed('tools.files')) {
            return $this->Finish(403, 'Permission denied');
        }

        $fsServerDomain = App::$config->Query('hosts.services.fs')->GetValue();
        $fs = new AdminClient($fsServerDomain);
        $list = $fs->SearchInBucket($post->bucket, $post->term, $post->page, $post->pagesize);

        return $this->Finish(200, 'ok', $list);
    }

    public function CreateBucket(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {

        if (!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        if (!SecurityModule::$instance->current->IsCommandAllowed('tools.files')) {
            return $this->Finish(403, 'Permission denied');
        }


        $fsServerDomain = App::$config->Query('hosts.services.fs')->GetValue();
        $fs = new AdminClient($fsServerDomain);
        $bucket = $fs->CreateBucket($post->bucket);

        return $this->Finish(200, 'ok', $bucket);
    }

    public function RemoveBucket(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {

        if (!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        if (!SecurityModule::$instance->current->IsCommandAllowed('tools.files')) {
            return $this->Finish(403, 'Permission denied');
        }

        $fsServerDomain = App::$config->Query('hosts.services.fs')->GetValue();
        $fs = new AdminClient($fsServerDomain);
        $fs->DeleteBucket($post->bucket);

        $list = $fs->ListBuckets();
        return $this->Finish(200, 'ok', $list);

    }


    public function RemoveFile(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {

        if (!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        if (!SecurityModule::$instance->current->IsCommandAllowed('tools.files')) {
            return $this->Finish(403, 'Permission denied');
        }


        $bucket = $post->bucket;
        $fsServerDomain = App::$config->Query('hosts.services.fs')->GetValue();
        $fs = new Client($fsServerDomain, $bucket);

        foreach ($post->files as $file) {
            $fs->DeleteObject($file);
        }

        return $this->Finish(200, 'ok', []);

    }

    public function UploadFiles(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {

        if (!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        if (!SecurityModule::$instance->current->IsCommandAllowed('tools.files')) {
            return $this->Finish(403, 'Permission denied');
        }

        $bucket = $post->bucket;
        $bucketname = $post->bucketname;
        $fsServerDomain = App::$config->Query('hosts.services.fs')->GetValue();
        $fs = new Client($fsServerDomain, $bucket);
        $fsAdmin = new AdminClient($fsServerDomain);

        $files = App::$request->files;
        foreach ($files as $file) {
            $ff = $fs->PutObject($file->binary, $file->name);
            $ffa = $fsAdmin->SearchInBucket($bucketname, $ff->guid);
            $filesArray[] = reset($ffa);
        }


        return $this->Finish(200, 'ok', $filesArray);

    }



}