import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type FaqItem = {
  question: string;
  answer: string;
};

export default function FaqSection() {
  const faqs: FaqItem[] = [
    {
      question: "Як працює StayEase?",
      answer: "StayEase допомагає вам знаходити та бронювати помешкання для відпочинку з нашого ретельно підібраного списку об'єктів. Переглядайте оголошення, фільтруйте за вашими уподобаннями та бронюйте безпечно через нашу платформу. Власники нерухомості також можуть розміщувати свої об'єкти після проходження нашого процесу верифікації."
    },
    {
      question: "Коли запуститься StayEase?",
      answer: "Ми плануємо запуск у третьому кварталі 2023 року. Приєднуйтесь до нашого списку очікування, щоб отримати сповіщення про запуск та доступ до ексклюзивних переваг для ранніх користувачів."
    },
    {
      question: "Як мені розмістити свою нерухомість на StayEase?",
      answer: "Власники нерухомості можуть зареєструватися та подати свої об'єкти на перевірку. Наша команда перевірить деталі та фотографії, щоб переконатися, що вони відповідають стандартам якості, перш ніж розмістити їх на платформі. Більше деталей буде доступно після запуску."
    },
    {
      question: "Чи є плата за бронювання?",
      answer: "StayEase стягує невелику сервісну плату з гостей, зазвичай 5-10% від суми бронювання. Ця плата допомагає нам підтримувати платформу та надавати цілодобову підтримку клієнтів. Власники нерухомості сплачують комісію за успішні бронювання."
    }
  ];

  return (
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-poppins font-semibold text-2xl md:text-3xl text-gray-900 mb-4">
              Часті запитання
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Знайдіть відповіді на поширені запитання про StayEase.
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left font-medium text-lg text-gray-900">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
  );
}