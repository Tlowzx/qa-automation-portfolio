const axios = require('axios');

async function testAPI() {
  // Тест 1: Получить список пользователей
  const response = await axios.get('https://reqres.in/api/users?page=1');
  console.log(response.status === 200 ? '✅ API 1: Список получен' : '❌ API 1: Ошибка');

  // Тест 2: Создать пользователя
  const create = await axios.post('https://reqres.in/api/users', {
    name: 'Test',
    job: 'QA'
  });
  console.log(create.status === 201 ? '✅ API 2: Пользователь создан' : '❌ API 2: Ошибка');

  // Тест 3: Проверить, что в ответе есть id
  console.log(create.data.id ? '✅ API 3: ID есть' : '❌ API 3: ID нет');
}

testAPI();