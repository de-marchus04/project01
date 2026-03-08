"use client";
import { useLanguage } from "../i18n/LanguageContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { addOrder } from "../api/userApi";
import { modalService } from "../ui/Modal/modalService";

export const usePurchase = () => {
  const router = useRouter();
  const { tStr } = useLanguage();
  const { data: session } = useSession();
  const sessionUser = session?.user;

  const buyProduct = async (title: string, price: number, serviceId?: string, itemType?: 'COURSE' | 'CONSULTATION' | 'TOUR', promoCodeId?: string) => {
    let customerName = tStr("Гость");
    let userId: string | undefined;

    if (!session) {
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
          return;
        }

        if (contactInfo.trim() === "") {
          await modalService.alert(tStr("Внимание"), tStr("Запись отменена. Контактные данные обязательны."));
          return;
        }
        customerName = contactInfo;
      }
    } else {
      customerName = sessionUser?.name || sessionUser?.username || tStr("Пользователь");
      userId = sessionUser?.username;
    }

    // Ask for preferred date/time
    let notes: string | undefined;
    const preferredDate = await modalService.prompt(
      tStr("Желаемая дата/время"),
      tStr("Укажите предпочтительную дату и время занятия (необязательно)"),
      tStr("Например: 15 января, 10:00"),
      true
    );
    if (preferredDate?.trim()) notes = preferredDate.trim();

    try {
      await addOrder(title, price, customerName, serviceId, userId, itemType || 'COURSE', promoCodeId, notes);
      
      if (session) {
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
      await modalService.alert(tStr("Ошибка"), tStr("Произошла ошибка при оформлении заказа. Попробуйте позже."));
    }
  };

  return { buyProduct };
};
