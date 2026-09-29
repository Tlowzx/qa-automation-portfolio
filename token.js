// Токен бота и твой личный Telegram ID
const TOKEN = "8933190612:AAGXOaedaq_1-ChpCFqQhVVST6X0IFlsIUU";
const CHAT_ID = "1884468584";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("myForm");

    if (form) {
        form.addEventListener("submit", async (event) => {
            event.preventDefault(); // Отменяем перезагрузку страницы

            // Считываем значения из инпутов
            const formData = new FormData(form);
            const name = formData.get("username") || "Не указано";
            const phone = formData.get("phone") || "Не указан";

            // Формируем текст сообщения
            const textMessage = `🔔 Новая заявка с формы!\n\n👤 Имя: ${name}\n📞 Телефон: ${phone}`;

            try {
                const response = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        chat_id: CHAT_ID,
                        text: textMessage
                    })
                });

                const result = await response.json();

                if (result.ok) {
                    alert("Данные успешно отправлены в Telegram!");
                    form.reset();
                } else {
                    console.error("Ошибка Telegram:", result);
                    alert(`Ошибка Telegram: ${result.description}`);
                }
            } catch (error) {
                console.error("Ошибка сети:", error);
                alert("Произошла ошибка при отправке.");
            }
        });
    }
});