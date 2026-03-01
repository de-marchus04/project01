"use client";

import { useEffect } from 'react';
import { emailService } from '@/shared/api/emailService';

export const useReminders = () => {
  useEffect(() => {
    const checkReminders = () => {
      const ordersJson = localStorage.getItem('yoga_orders');
      if (!ordersJson) return;

      const orders = JSON.parse(ordersJson);
      const now = new Date();
      
      const sentRemindersJson = localStorage.getItem('yoga_sent_reminders');
      const sentReminders = sentRemindersJson ? JSON.parse(sentRemindersJson) : [];

      orders.forEach((order: any) => {
        if (sentReminders.includes(order.id)) return;

        // order.date is like "2026-02-20" or ISO string.
        // For simulation, we'll just check if the order was created recently.
        // Since we don't have a real "start date" for the course, we'll simulate
        // sending a reminder 1 minute after the order is placed.
        
        // Let's use the order.id as a timestamp if it's a number string (Date.now().toString())
        let orderTime = 0;
        if (order.id && !isNaN(Number(order.id))) {
          orderTime = Number(order.id);
        } else {
          orderTime = new Date(order.date).getTime();
        }

        const diffTime = Math.abs(now.getTime() - orderTime);
        const diffMinutes = Math.floor(diffTime / (1000 * 60));

        // Симуляция: отправляем напоминание через 1 минуту после заказа
        if (diffMinutes >= 1) {
          // Try to extract email from customerName if it looks like an email, otherwise use a default
          let userEmail = 'user@example.com';
          if (order.customerName && order.customerName.includes('@')) {
            userEmail = order.customerName;
          } else {
            // Try to get from logged in user
            const userJson = localStorage.getItem('yoga_user');
            if (userJson) {
              try {
                const user = JSON.parse(userJson);
                if (user.email) userEmail = user.email;
              } catch(e) {}
            }
          }
          
          emailService.sendEmail(
            userEmail,
            `Напоминание: Скоро начнется ваше занятие!`,
            `Здравствуйте, ${order.customerName || 'ученик'}! Напоминаем, что вы записаны на "${order.productName}". Ждем вас!`
          );

          sentReminders.push(order.id);
        }
      });

      localStorage.setItem('yoga_sent_reminders', JSON.stringify(sentReminders));
    };

    // Проверяем при загрузке
    checkReminders();

    // И устанавливаем интервал для проверки каждые 30 секунд (для демонстрации)
    const interval = setInterval(checkReminders, 30000);

    return () => clearInterval(interval);
  }, []);
};
