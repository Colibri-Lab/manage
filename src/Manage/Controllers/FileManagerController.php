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

class FileManagerController extends WebController
{

    private function _listAllDirectories($path)
    {
        $path = str_replace('//', '/', $path);
        $rootPath = App::$webRoot;
        $foldersArray = [];
        $di = new Finder();
        $directories = $di->DirectoriesRecursive($path);
        foreach ($directories as $directory) {
            $folder = $directory->ToArray();
            $folder['path'] = '/' . str_replace($rootPath, '', $folder['path']);
            $folder['parent'] = '/' . str_replace($rootPath, '', $folder['parent']);
            $foldersArray[] = $folder;
        }
        return $foldersArray;
    }

    private function _listAllFiles($path, $term = '')
    {
        $path = str_replace('//', '/', $path);
        $rootPath = App::$webRoot;
        $filesArray = [];
        $di = new Finder();
        $files = $di->Files($path, $term ? '/.*' . $term . '.*/' : '');
        foreach ($files as $file) {
            $f = $file->ToArray();
            $f['path'] = '/' . str_replace($rootPath, '', $f['path']);
            $f['parent'] = '/' . str_replace($rootPath, '', $path);
            $filesArray[] = $f;
        }
        return $filesArray;
    }

    public function Folders(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {

        if (!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        if (!SecurityModule::$instance->current->IsCommandAllowed('tools.files')) {
            return $this->Finish(403, 'Permission denied');
        }

        $parentPath = $post->path;
        $rootPath = App::$webRoot;
        $resPath = $rootPath . App::$config->Query('res')->GetValue();

        $foldersArray = $foldersArray = $this->_listAllDirectories($resPath . $parentPath);
        return $this->Finish(200, 'ok', $foldersArray);
    }

    public function Files(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {

        if (!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        if (!SecurityModule::$instance->current->IsCommandAllowed('tools.files')) {
            return $this->Finish(403, 'Permission denied');
        }

        $term = $post->term;
        $parentPath = $post->path;
        $rootPath = App::$webRoot;

        $filesArray = $this->_listAllFiles($rootPath . $parentPath, $term);
        return $this->Finish(200, 'ok', $filesArray);
    }

    public function CreateFolder(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {

        if (!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        if (!SecurityModule::$instance->current->IsCommandAllowed('tools.files')) {
            return $this->Finish(403, 'Permission denied');
        }

        $folderPath = $post->path;
        $rootPath = App::$webRoot;

        Directory::Create($rootPath . $folderPath, true);

        $di = new Directory($rootPath . $folderPath);
        $diArray = $di->ToArray();
        $diArray['path'] = str_replace($rootPath, '', $diArray['path']);
        $diArray['parent'] = str_replace($rootPath, '', $diArray['parent']);

        return $this->Finish(200, 'ok', $diArray);
    }

    public function RenameFolder(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {

        if (!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        if (!SecurityModule::$instance->current->IsCommandAllowed('tools.files')) {
            return $this->Finish(403, 'Permission denied');
        }

        $folderPathFrom = $post->pathFrom;
        $folderPathTo = $post->pathTo;
        $rootPath = App::$webRoot;
        $resPath = $rootPath . App::$config->Query('res')->GetValue();

        Directory::Move($rootPath . $folderPathFrom, $rootPath . $folderPathTo);

        $foldersArray = $this->_listAllDirectories($resPath);
        return $this->Finish(200, 'ok', $foldersArray);

    }

    public function RemoveFolder(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {

        if (!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        if (!SecurityModule::$instance->current->IsCommandAllowed('tools.files')) {
            return $this->Finish(403, 'Permission denied');
        }

        $folderPath = $post->path;
        $rootPath = App::$webRoot;
        $resPath = $rootPath . App::$config->Query('res')->GetValue();

        Directory::Delete($rootPath . $folderPath);

        $foldersArray = $this->_listAllDirectories($resPath);
        return $this->Finish(200, 'ok', $foldersArray);

    }


    public function RenameFile(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {

        if (!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        if (!SecurityModule::$instance->current->IsCommandAllowed('tools.files')) {
            return $this->Finish(403, 'Permission denied');
        }

        $path = $post->path;
        $nameFrom = $post->nameFrom;
        $nameTo = $post->nameTo;
        $rootPath = App::$webRoot;

        File::Move($rootPath . $path . $nameFrom, $rootPath . $path . $nameTo);

        $filesArray = $this->_listAllFiles($rootPath . $path);
        return $this->Finish(200, 'ok', $filesArray);

    }

    public function RemoveFile(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {

        if (!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        if (!SecurityModule::$instance->current->IsCommandAllowed('tools.files')) {
            return $this->Finish(403, 'Permission denied');
        }

        $rootPath = App::$webRoot;

        $filePath = $post->path;
        if (is_array($filePath)) {
            $folderPath = null;
            foreach ($filePath as $f) {
                $file = new File($rootPath . $f);
                $folderPath = str_replace($file->name, '', $file->path);
                File::Delete($rootPath . $f);
            }
        } else {
            $file = new File($rootPath . $filePath);
            $folderPath = str_replace($file->name, '', $file->path);
            File::Delete($rootPath . $filePath);
        }

        $filesArray = $this->_listAllFiles($folderPath);
        return $this->Finish(200, 'ok', $filesArray);

    }
    public function UploadFiles(RequestCollection $get, RequestCollection $post, mixed $payload = null): object
    {

        if (!SecurityModule::$instance->current) {
            return $this->Finish(403, 'Permission denied');
        }

        if (!SecurityModule::$instance->current->IsCommandAllowed('tools.files')) {
            return $this->Finish(403, 'Permission denied');
        }

        $rootPath = App::$webRoot;
        $path = $post->path;
        $filesArray = [];

        $files = App::$request->files;
        foreach ($files as $file) {
            $file->MoveTo($rootPath . $path . $file->name);
            $f = new File($rootPath . $path . $file->name);
            $ff = $f->ToArray();
            $ff['path'] = '/' . str_replace($rootPath, '', $ff['path']);
            $ff['parent'] = '/' . $path;
            $filesArray[] = $ff;
        }

        return $this->Finish(200, 'ok', $filesArray);

    }



}