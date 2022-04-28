<?php


namespace App\Modules\Manage;

class Installer
{

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
        $configDir = './config/';

        if(!file_exists($configDir.'app.yaml')) {
            print_r('Не найден файл конфигурации app.yaml'."\n");
            return;
        }

        $mode = 'dev';
        $appYamlContent = file_get_contents($configDir.'app.yaml');
        if(preg_match('/mode: (\w+)/', $appYamlContent, $matches) >=0 ) {
            $mode = $matches[1];
        }

        $operation = $event->getOperation();
        $installedPackage = $operation->getPackage();
        $targetDir = $installedPackage->getName();
        $path = $vendorDir.$targetDir;
        $configPath = $path.'/src/Manage/config-template/';

        // копируем конфиг
        print_r('Копируем файл конфигурации'."\n");
        if(file_exists($configDir.'manage.yaml')) {
            print_r('Файл конфигурации найден, пропускаем настройку'."\n");
            return;
        }
        self::_copyOrSymlink($mode, $configPath, $configDir, 'module-'.$mode.'.yaml', 'manage.yaml');

        // нужно прописать в модули
        $modulesTargetPath = $configDir.'modules.yaml';
        $modulesConfigContent = file_get_contents($modulesTargetPath);
        if(strstr($modulesConfigContent, '- name: Manage') !== false) {
            print_r('Модуль сконфигурирован, пропускаем'."\n");
            return;
        }

        $modulesConfigContent = $modulesConfigContent.'
  - name: Manage
    entry: \Manage\Module
    enabled: true
    desc: Менеджеры
    visible: true
    for:
      - manage
    config: include(/config/manage.yaml)';
        file_put_contents($modulesTargetPath, $modulesConfigContent);

        print_r('Установка скриптов'."\n");
        $scriptsPath = $path.'/src/Manage/bin/';
        $binDir = './bin/';

        self::_copyOrSymlink($mode, $scriptsPath, $binDir, 'manage-migrate.sh', 'manage-migrate.sh');
        self::_copyOrSymlink($mode, $scriptsPath, $binDir, 'manage-models-generate.sh', 'manage-models-generate.sh');

        print_r('Установка ресурсов'."\n");
        $resPath = $path.'/src/Manage/web/res/';
        $resDir = './web/res/';

        self::_copyOrSymlink($mode, $resPath, $resDir, 'codemirror/', 'codemirror/');
        self::_copyOrSymlink($mode, $resPath, $resDir, 'tinymce/', 'tinymce/');
        
        print_r('Установка завершена'."\n");

    }
}
