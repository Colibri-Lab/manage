<?php


namespace App\Modules\Manage;

class Installer
{
    private static function _loadConfig($file): array
    {
        return yaml_parse_file($file);
    }

    private static function _saveConfig($file, $config): void
    {
        yaml_emit_file($file, $config, \YAML_UTF8_ENCODING, \YAML_ANY_BREAK);
    }

    private static function _getMode($file): string
    {
        $appConfig = self::_loadConfig($file);
        return $appConfig['mode'];
    }

    private static function _injectIntoModuleConfig($file): void
    {

        $modules = self::_loadConfig($file);
        foreach($modules['entries'] as $entry) {
            if($entry['name'] === 'MainFrame') {
                return;
            }
        }

        $modules['entries'][] = [
            'name' => 'Manage',
            'entry' => '\Manage\Module',
            'desc' => 'Административный интерфейс',
            'enabled' => true,
            'visible' => false,
            'for' => ['manage'],
            'config' => 'include(/config/manage.yaml)'
        ];

        self::_saveConfig($file, $modules);

    }
    private static function _copyOrSymlink($mode, $pathFrom, $pathTo, $fileFrom, $fileTo): void 
    {
        print_r('Копируем '.$mode.' '.$pathFrom.' '.$pathTo.' '.$fileFrom.' '.$fileTo."\n");
        if(!file_exists($pathFrom.$fileFrom)) {
            print_r('Файл '.$pathFrom.$fileFrom.' не существует'."\n");
            return;
        }

        if(file_exists($pathTo.$fileTo)) {
            print_r('Файл '.$pathTo.$fileTo.' существует'."\n");
            return;
        }

        if($mode === 'local') {
            shell_exec('ln -s '.realpath($pathFrom.$fileFrom).' '.$pathTo.($fileTo != $fileFrom ? $fileTo : ''));
        }
        else {
            shell_exec('cp -R '.realpath($pathFrom.$fileFrom).' '.$pathTo.$fileTo);
        }

        // если это исполняемый скрипт
        if(strstr($pathTo.$fileTo, '/bin/') !== false) {
            chmod($pathTo.$fileTo, 0777);
        }
    }

    /**
     *
     * @param PackageEvent $event
     * @return void
     */
    public static function PostPackageInstall($event)
    {

        print_r('Установка и настройка модуля Colibri Manage Module'."\n");

        $vendorDir = $event->getComposer()->getConfig()->get('vendor-dir').'/';
        $operation = $event->getOperation();
        $installedPackage = $operation->getPackage();
        $targetDir = $installedPackage->getName();
        $path = $vendorDir.$targetDir;
        $configPath = $path.'/src/Manage/config-template/';
        $configDir = './config/';

        if(!file_exists($configDir.'app.yaml')) {
            print_r('Не найден файл конфигурации app.yaml'."\n");
            return;
        }

        $mode = self::_getMode($configDir.'app.yaml');


        // копируем конфиг
        print_r('Копируем файл конфигурации'."\n");
        self::_copyOrSymlink($mode, $configPath, $configDir, 'module-'.$mode.'.yaml', 'manage.yaml');

        print_r('Встраиваем модуль'."\n");
        self::_injectIntoModuleConfig($configDir.'modules.yaml');

        print_r('Установка скриптов'."\n");
        self::_copyOrSymlink($mode, $path.'/src/Manage/bin/', './bin/', 'manage-migrate.sh', 'manage-migrate.sh');
        self::_copyOrSymlink($mode, $path.'/src/Manage/bin/', './bin/', 'manage-models-generate.sh', 'manage-models-generate.sh');

        print_r('Установка ресурсов'."\n");
        self::_copyOrSymlink($mode, $path.'/src/Manage/web/res/', './web/res/', 'codemirror/', 'codemirror/');
        self::_copyOrSymlink($mode, $path.'/src/Manage/web/res/', './web/res/', 'tinymce/', 'tinymce/');
        
        print_r('Установка завершена'."\n");

    }
}
