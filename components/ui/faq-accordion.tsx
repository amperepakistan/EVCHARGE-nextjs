'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export type FAQItem = {
  question: string;
  answer: string;
};

export function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  function toggle(index: number) {
    setOpenIndex(openIndex === index ? null : index);
  }

  return (
    <div className="divide-y divide-border/80 border-y border-border/80">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.question} className="py-4 sm:py-5">
            <button
              type="button"
              onClick={() => toggle(index)}
              className="flex w-full items-center justify-between text-left font-heading text-base font-bold text-text-primary hover:text-primary-800 transition-colors focus:outline-none"
              aria-expanded={isOpen}
            >
              <span>{item.question}</span>
              <ChevronDown
                className={cn(
                  'size-5 shrink-0 text-text-secondary transition-transform duration-200',
                  isOpen && 'rotate-180 text-primary-800',
                )}
              />
            </button>
            {isOpen && (
              <p className="mt-3 text-sm text-text-secondary leading-relaxed sm:text-base animate-in fade-in duration-200">
                {item.answer}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
