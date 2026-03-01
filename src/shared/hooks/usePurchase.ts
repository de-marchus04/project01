"use client";
import { useLanguage } from "../i18n/LanguageContext";

import { useRouter } from "next/navigation";
import { addOrder } from "../api/userApi";
import { modalService } from "../ui/Modal/modalService";

export const usePurchase = () => {
  const router = useRouter();
  const { tStr } = useLanguage() as any;

  const buyProduct = async (title: string, price: number) => {
    const userJson = localStorage.getItem('yoga_user');
    let customerName = tStr("Гость");

    if (!userJson) {
      const wantToLogin = await modalService.confirm(
        tStr("Требуется авторизация"),
        tStr("Хотите войти в личный кабинет, чтобы сохранить историю записей?\n\nНажмите 'ОК' для входа/регистрации.\nНажмите 'Отмена' для быстрой записи без регистрации."),
        tStr("ОК"),
        tStr("Отмена")
      );
      
      if (wantToLogin) {
        router.push('/login');
        return;
      } else {
        const contactInfo = await modalService.prompt(
          tStr("Контактные данные"),
          tStr("Введите ваше имя и телефон/email для связи:"),
          tStr("Имя, телефон или email")
        );
        
        if (contactInfo === null) {
          // Пользователь отменил ввод, просто выходим без уведомлений об ошибке (QA: Улучшение UX)
          return;
        }
        
        if (contactInfo.trim() === "") {
          await modalService.alert(tStr("Внимание"), tStr("Запись отменена. Пожалуйста, укажите контактные данные."));
          return;
        }
        customerName = contactInfo;
      }
    } else {
      try {
        const user = JSON.parse(userJson);
        customerName = user.username || tStr("Пользователь");
      } catch (e) {}
    }

    try {
      // Добавляем заказ
      let userId = undefined;
      if (userJson) {
        try {
          const user = JSON.parse(userJson);
          userId = user.username;
        } catch (e) {}
      }
      
      await addOrder(title, price, customerName, undefined, userId);
      
      if (userJson) {
        // Спрашиваем пользователя, хочет ли он перейти в профиль
        const goToProfile = await modalService.confirm(
          tStr("Заявка отправлена"),
          tStr("Ваша заявка на \"") + title + tStr("\" отправлена и находится в обработке!\nМенеджер свяжется с вами после подтверждения.\nПерейти в Личный кабинет для отслеживания статуса?"),
          tStr("Перейти"),
          tStr("Остаться")
        );
        
        if (goToProfile) {
          router.push('/profile');
        }
      } else {
        await modalService.alert(
          tStr("Заявка отправлена"),
          tStr("Ваша заявка на \"") + title + tStr("\" отправлена и находится в обработке!\nМы свяжемся с вами по указанным контактам: ") + customerName + tStr(" после подтверждения.")
        );
      }
    } catch (error) {
      console.error("Ошибка при покупке:", error);
      await modalService.alert("Ошибка", tStr("Произошла ошибка при оформлении заказа. Попробуйте позже."));
    }
  };

  return { buyProduct };
};
