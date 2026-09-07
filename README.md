# AI Architect — мастер-класс 24 сентября

Статический лендинг для GitHub Pages. Сборка не требует сторонних зависимостей.

Опубликованная версия: https://yanlukashin.github.io/ai-architect-masterclass/

## Локальная проверка

```bash
npm run build
npm run serve
```

Затем открыть `http://localhost:4173`.

## Регистрация

Форма на лендинге отправляет ответы в [Google Form](https://docs.google.com/forms/d/e/1FAIpQLSev1ox1t_KXnsRxpOIrK9QdGg1a_bdmedF_h-hGGgwof39abw/viewform). Email обязателен, Telegram можно оставить как дополнительный способ связи. UTM, `yclid` и `gclid` сохраняются в поле источника заявки.

После успешной отправки появляется кнопка вступления в [Telegram-канал мастер-класса](https://t.me/+xR-I608Nv7EwODQy). Напоминания и ссылка Zoom публикуются в канале; ссылка Zoom появится ближе к эфиру. Автоматическая отправка email не настроена.

7 сентября из Google Form удалён повторявшийся вопрос «Можно предложить ваш пример для разбора?». Отправка заявки после удаления проверена; совместимая передача полей на лендинге сохранена.

## Публикация

Workflow `.github/workflows/pages.yml` собирает `dist/` и публикует GitHub Pages при каждом push в `main`.
