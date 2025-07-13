import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

const loadingSteps = [
  "Получение текста...",
  "Обработка данных...",
  "Создание таблицы...",
  "Форматирование...",
  "Почти готово!",
];

export default function Loading() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % loadingSteps.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center flex-col gap-3 text-lg p-5">
      <div className="relative">
        <ArrowPathIcon className="size-16 text-indigo-600 animate-spin" />
      </div>
      
      <div className="flex flex-col items-center gap-1">
        <span className="font-medium text-gray-700">
          {loadingSteps[currentStep]}
        </span>
        <div className="flex gap-1">
          {loadingSteps.map((_, index) => (
            <div 
              key={index}
              className={`h-1 w-1 rounded-full transition-all duration-300 ${
                index === currentStep ? "bg-indigo-600 scale-125" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}