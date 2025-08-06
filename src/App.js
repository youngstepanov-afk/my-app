import React, { useEffect, useState } from 'react';
import { Modal, Button, Typography } from 'antd'; // или другая UI-библиотека

const App = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    // Проверяем обновления при загрузке приложения
    const checkForUpdates = () => {
      const currentVersion = process.env.REACT_APP_VERSION || '1.0.0';
      const savedVersion = localStorage.getItem('app_version');
      
      if (savedVersion && savedVersion !== currentVersion) {
        setUpdateAvailable(true);
        startCountdown();
      }
      
      // Сохраняем текущую версию
      localStorage.setItem('app_version', currentVersion);
    };

    // Для production режима
    if (process.env.NODE_ENV === 'production') {
      checkForUpdates();
      
      // Проверяем обновления каждые 5 минут
      const interval = setInterval(checkForUpdates, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, []);

  const startCountdown = () => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.reload(true); // Hard reload
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <>
      {/* Ваше основное приложение */}
      rfgsdfgsdfg
      {updateAvailable && (
        <Modal
          title="Доступно обновление"
          visible={updateAvailable}
          footer={[
            <Button key="reload" type="primary" onClick={() => window.location.reload(true)}>
              Обновить сейчас ({countdown})
            </Button>
          ]}
          closable={false}
        >
          <Typography.Paragraph>
            Новая версия приложения готова к загрузке. Приложение автоматически обновится через {countdown} секунд.
          </Typography.Paragraph>
          <Typography.Paragraph>
            Рекомендуем сохранить все данные перед обновлением.
          </Typography.Paragraph>
        </Modal>
      )}
    </>
  );
};

export default App;