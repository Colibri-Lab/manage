# миграция

cd ./web
php index.php [domain] / command=migrate

# создание моделей

cd ./Web
php index.php [domen] / command=models-generate storage=[storage name]

# настойка nginx

! обязательно 

client_body_buffer_size 1m;
fastcgi_buffers 16 16k;
fastcgi_buffer_size 32k;


# дополнительные сведения о настройке модуля
! обязательно опишите какие необходимы вызовы скриптов при первичной настройке
! опишите какие необходимо запускать скрипты периодически
! запишите какие настройки за что отвечают


x8s6gaeksejxxh7bk4vz48go06saa27m2toqons8hzsm8wjo