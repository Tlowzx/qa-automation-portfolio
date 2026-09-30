const { Telegraf } = require('telegraf');
require('dotenv').config();
const bot = new Telegraf(process.env.BOT_TOKEN || "8578057083:AAG5kFg3htISCh8Vvte33LemYl8-_Hr6fzo");
const ADMIN_ID = process.env.ADMIN_ID || "1884468584";

// Услуги каталога
const services = {
  manicure: { name: '💅 Маникюр', price: 1500, time: '1-1.5 часа', desc: 'Профессиональный маникюр с качественными материалами' },
  pedicure: { name: '👣 Педикюр', price: 2000, time: '1.5-2 часа', desc: 'Полный уход за ногами ног' },
  coloring: { name: '💇 Окрашивание', price: 3500, time: '2-3 часа', desc: 'Профессиональное окрашивание волос' },
  lamination: { name: '✨ Ламинирование', price: 1200, time: '1 час', desc: 'Защита и блеск для ваших волос' },
};

const userState = {};

// Функция показа главного меню
const showMainMenu = (ctx) => {
  const text = 'Добро пожаловать! 👋\n\nЯ ваш цифровой помощник.\nВыберите, что вас интересует:';
  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [{ text: '📋 Услуги', callback_data: 'services_list' }],
        [{ text: '📞 Контакты', callback_data: 'contacts' }],
        [{ text: '❓ О нас', callback_data: 'about' }],
        [{ text: '📧 Оставить заявку', callback_data: 'request_form' }],
      ],
    },
  };

  if (ctx.callbackQuery) {
    return ctx.reply(text, keyboard);
  }
  return ctx.reply(text, keyboard);
};

// Функция показа списка услуг
const showServicesList = (ctx) => {
  return ctx.reply('📋 НАШИ УСЛУГИ\n\nВыберите интересующую вас услугу:', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '💅 Маникюр — 1500 ₽', callback_data: 'service_manicure' }],
        [{ text: '👣 Педикюр — 2000 ₽', callback_data: 'service_pedicure' }],
        [{ text: '💇 Окрашивание — 3500 ₽', callback_data: 'service_coloring' }],
        [{ text: '✨ Ламинирование — 1200 ₽', callback_data: 'service_lamination' }],
        [{ text: '⬅️ Назад в меню', callback_data: 'back_to_menu' }],
      ],
    },
  });
};

// Функция показа контактов
const showContacts = (ctx) => {
  return ctx.reply(`
📞 КОНТАКТЫ

☎️ Телефон: +7 (999) 123-45-67
✉️ Email: info@beautystudio.ru
📍 Адрес: ул. Красивая, 1, Москва
🕐 Часы работы: пн-пт 10:00-18:00, сб-вс 11:00-16:00

💬 WhatsApp: +7 (999) 123-45-67
  `.trim(), {
    reply_markup: {
      inline_keyboard: [
        [{ text: '⬅️ Назад в меню', callback_data: 'back_to_menu' }],
      ],
    },
  });
};

// /start
bot.start(showMainMenu);

// Команды из справки
bot.command('services', showServicesList);
bot.command('contacts', showContacts);

// Меню услуг по кнопке
bot.action('services_list', (ctx) => {
  ctx.answerCbQuery();
  return showServicesList(ctx);
});

// Детали услуги
bot.action(/service_(.+)/, (ctx) => {
  ctx.answerCbQuery();
  const serviceKey = ctx.match[1];
  const service = services[serviceKey];

  if (!service) return ctx.reply('Услуга не найдена');

  userState[ctx.from.id] = { selectedService: serviceKey, serviceName: service.name };

  ctx.reply(`${service.name}\n\n💰 Цена: ${service.price} ₽\n⏱️ Время: ${service.time}\n📝 ${service.desc}\n\nХотите оставить заявку на эту услугу?`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: '✅ Оставить заявку', callback_data: 'request_form' }],
        [{ text: '⬅️ Назад к услугам', callback_data: 'services_list' }],
      ],
    },
  });
});

// Форма заявки
bot.action('request_form', (ctx) => {
  ctx.answerCbQuery();
  const userId = ctx.from.id;
  
  if (!userState[userId]) {
    userState[userId] = {};
  }

  const state = userState[userId];

  // Если услуга уже была выбрана кнопкой
  if (state.serviceName) {
    ctx.reply(`📧 Оформление заявки на: ${state.serviceName}\n\nКак вас зовут?`);
  } else {
    ctx.reply('📧 ФОРМА ЗАЯВКИ\n\nКакую услугу вы выбираете?\n(или напишите текстом)');
  }
});

// Обработка текстовых сообщений
bot.on('text', (ctx) => {
  const userId = ctx.from.id;
  const text = ctx.message.text;

  if (!userState[userId]) {
    return ctx.reply('Нажми /start, чтобы начать');
  }

  const state = userState[userId];

  // Если услуга еще не определена
  if (!state.serviceName && !state.selectedService) {
    // Ищем услугу по названию
    let found = false;
    for (const [key, service] of Object.entries(services)) {
      if (text.toLowerCase().includes(key) || text.toLowerCase().includes(service.name.toLowerCase())) {
        state.serviceName = service.name;
        state.selectedService = key;
        found = true;
        break;
      }
    }
    if (!found) {
      state.serviceName = text;
    }
    ctx.reply('Ваше имя?');
  } else if (!state.name) {
    state.name = text;
    ctx.reply('Ваш номер телефона?');
  } else if (!state.phone) {
    state.phone = text;
    ctx.reply('Когда вам удобнее? (например: "Пятница 15:00" или "Завтра утром")');
  } else if (!state.time) {
    state.time = text;
    ctx.reply('Дополнительные пожелания? (или напишите "Нет")');
  } else if (!state.wishes) {
    state.wishes = text === 'Нет' ? '-' : text;

    // Отправляем администратору
    const adminMessage = `
🆕 НОВАЯ ЗАЯВКА НА УСЛУГУ

Услуга: ${state.serviceName}
Клиент: ${state.name}
Телефон: ${state.phone}
Удобное время: ${state.time}
Пожелания: ${state.wishes}

ID пользователя: ${userId}
Дата заявки: ${new Date().toLocaleString()}
    `.trim();

    bot.telegram.sendMessage(ADMIN_ID, adminMessage).catch(err => {
      console.error('Ошибка отправки админу:', err);
    });

    // Подтверждение клиенту
    ctx.reply('✅ Спасибо! Ваша заявка принята.\nМы свяжемся с вами в течение 1 часа.\n\nНажми /start, чтобы вернуться в меню.');

    // Очищаем состояние
    delete userState[userId];
  }
});

// Контакты по кнопке
bot.action('contacts', (ctx) => {
  ctx.answerCbQuery();
  return showContacts(ctx);
});

// О нас
bot.action('about', (ctx) => {
  ctx.answerCbQuery();
  ctx.reply(`
✨ О НАС

Мы — профессиональная студия красоты с опытом более 5 лет.
Наша команда использует только качественные материалы.
Каждый клиент для нас — особенный! 💖

Присоединяйтесь к нам! 💐
  `.trim(), {
    reply_markup: {
      inline_keyboard: [
        [{ text: '⬅️ Назад в меню', callback_data: 'back_to_menu' }],
      ],
    },
  });
});

// Справка
bot.command('help', (ctx) => {
  ctx.reply(`
❓ СПРАВКА

Я помогу вам:
✓ Посмотреть список услуг (/services)
✓ Узнать цены и описания
✓ Оставить заявку на услугу
✓ Получить контакты (/contacts)

Используйте кнопки или команды!
  `.trim());
});

// Назад в меню (исправлено: теперь вызывает функцию, а не bot.start)
bot.action('back_to_menu', (ctx) => {
  ctx.answerCbQuery();
  return showMainMenu(ctx);
});

// Запуск бота
bot.launch().then(() => {
  console.log('🤖 Бот для салона красоты успешно запущен!');
}).catch((err) => {
  console.error('Ошибка при запуске бота:', err);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));