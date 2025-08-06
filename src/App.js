import React, { useEffect, useState } from 'react';
import { Modal, Button, Typography, Alert, Badge, Tag, Tooltip } from 'antd';
import { InfoCircleOutlined, SyncOutlined } from '@ant-design/icons';

const VersionManager = () => {
  const [state, setState] = useState({
    updateAvailable: false,
    updateType: null, // 'major' | 'minor' | 'patch'
    currentVersion: process.env.REACT_APP_VERSION || '0.0.0',
    savedVersion: localStorage.getItem('app_version') || null,
    countdown: 15,
    showVersionBadge: true // Флаг для отображения версии в интерфейсе
  });

  // Определяем тип обновления
  const getUpdateType = (oldV, newV) => {
    const [oldMajor, oldMinor, oldPatch] = oldV.split('.').map(Number);
    const [newMajor, newMinor, newPatch] = newV.split('.').map(Number);

    if (newMajor > oldMajor) return 'major';
    if (newMinor > oldMinor) return 'minor';
    if (newPatch > oldPatch) return 'patch';
    return null;
  };

  // Проверка обновлений
  const checkForUpdate = () => {
    const { currentVersion, savedVersion } = state;
    
    if (savedVersion && savedVersion !== currentVersion) {
      const updateType = getUpdateType(savedVersion, currentVersion);
      
      setState(prev => ({
        ...prev,
        updateAvailable: true,
        updateType,
        countdown: updateType === 'major' ? 30 : 15
      }));

      startCountdown(updateType === 'major' ? 30 : 15);
    }

    // Всегда сохраняем текущую версию
    localStorage.setItem('app_version', currentVersion);
  };

  // Запуск обратного отсчета
  const startCountdown = (seconds) => {
    const timer = setInterval(() => {
      setState(prev => {
        if (prev.countdown <= 1) {
          clearInterval(timer);
          forceReload();
          return { ...prev, countdown: 0 };
        }
        return { ...prev, countdown: prev.countdown - 1 };
      });
    }, 1000);
  };

  // Принудительная перезагрузка
  const forceReload = () => {
    window.location.reload(true);
  };

  // Инициализация при загрузке
  useEffect(() => {
    checkForUpdate();
    
    if (process.env.NODE_ENV === 'production') {
      const interval = setInterval(checkForUpdate, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, []);

  // Контент для разных типов обновлений
  const updateContent = {
    major: {
      title: 'Требуется важное обновление',
      description: 'Это обновление содержит критические изменения и новые функции.',
      alertType: 'error',
      icon: <SyncOutlined spin />,
      mandatory: true
    },
    minor: {
      title: 'Доступно обновление',
      description: 'Новая версия содержит улучшения и дополнительные возможности.',
      alertType: 'warning',
      icon: <InfoCircleOutlined />,
      mandatory: false
    },
    patch: {
      title: 'Обновление безопасности',
      description: 'Рекомендуем обновиться для исправления обнаруженных проблем.',
      alertType: 'info',
      icon: <InfoCircleOutlined />,
      mandatory: false
    }
  };

  return (
    <>
      {/* Бейдж с версией в углу экрана */}
      <Tooltip title={`Версия ${state.currentVersion}`}>
        <Badge 
          count={state.currentVersion} 
          style={{ 
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1000,
            cursor: 'pointer'
          }}
          onClick={() => setState(prev => ({ ...prev, showVersionBadge: !prev.showVersionBadge }))}
        />
      </Tooltip>

      {/* Модальное окно обновления */}
      {state.updateAvailable && (
        <Modal
          title={
            <>
              {updateContent[state.updateType]?.icon}
              <span style={{ marginLeft: 8 }}>
                {updateContent[state.updateType]?.title}
              </span>
            </>
          }
          open={state.updateAvailable}
          footer={[
            !updateContent[state.updateType]?.mandatory && (
              <Button key="later" onClick={() => setState(prev => ({ ...prev, updateAvailable: false }))}>
                Напомнить позже
              </Button>
            ),
            <Button
              key="update"
              type="primary"
              danger={state.updateType === 'major'}
              onClick={forceReload}
            >
              Обновить сейчас ({state.countdown})
            </Button>
          ]}
          closable={!updateContent[state.updateType]?.mandatory}
          onCancel={() => !updateContent[state.updateType]?.mandatory && 
            setState(prev => ({ ...prev, updateAvailable: false }))}
          maskClosable={false}
        >
          <Alert
            type={updateContent[state.updateType]?.alertType}
            message={
              <Typography.Text strong>
                {updateContent[state.updateType]?.description}
              </Typography.Text>
            }
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Typography.Paragraph>
            <Tag color="blue">Текущая версия: {state.savedVersion}</Tag>
          </Typography.Paragraph>
          <Typography.Paragraph>
            <Tag color="green">Новая версия: {state.currentVersion}</Tag>
          </Typography.Paragraph>

          {state.updateType === 'major' && (
            <Typography.Paragraph type="danger">
              Автоматическое обновление через {state.countdown} секунд...
            </Typography.Paragraph>
          )}
        </Modal>
      )}
    </>
  );
};

// Использование в вашем приложении
const App = () => {
  return (
    <>
      {/* Ваше основное приложение */}
      <VersionManager />
    </>
  );
};

export default App;