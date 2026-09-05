const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Тест 1: Логин
  await page.goto('https://www.saucedemo.com');
  await page.fill('[data-test="username"]', 'standard_user');
  await page.fill('[data-test="password"]', 'secret_sauce');
  await page.click('[data-test="login-button"]');
  
  const title = await page.textContent('.title');
  console.log(title === 'Products' ? '✅ Тест 1: Логин прошёл' : '❌ Тест 1: Логин упал');
  
  // Тест 2: Добавить товар в корзину
  await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
  const cartBadge = await page.textContent('.shopping_cart_badge');
  console.log(cartBadge === '1' ? '✅ Тест 2: Товар в корзине' : '❌ Тест 2: Корзина пуста');
  
  // Тест 3: Открыть корзину и проверить цену
  await page.click('.shopping_cart_link');
  const price = await page.textContent('.inventory_item_price');
  console.log(price.includes('29.99') ? '✅ Тест 3: Цена верна' : '❌ Тест 3: Цена не та');
  
  await browser.close();
})();