"use client";

import { motion } from "framer-motion";
import { Quote as QuoteIcon } from "lucide-react";
import { QUOTE } from "@/lib/constants";

const Quote = () => {
  return (
    <section
      id="quote"
      aria-label="Favorite quote"
      className="relative py-16 md:py-20 px-4 md:px-8"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative glass-card bg-white/40! light:bg-white/80! dark:bg-white/5! border border-white/15! light:border-slate-300/60! rounded-2xl md:rounded-3xl px-8 py-10 md:px-12 md:py-12 shadow-lg"
        >
          <div className="absolute top-6 left-6 md:top-8 md:left-8 text-purple-400/40 dark:text-purple-400/30">
            <QuoteIcon className="w-10 h-10 md:w-12 md:h-12" strokeWidth={1.25} aria-hidden />
          </div>
          <blockquote className="relative z-10 pt-6 md:pt-2 pl-2 md:pl-4">
            <p className="font-space text-xl md:text-2xl lg:text-[1.65rem] leading-relaxed text-slate-800 light:text-slate-900 dark:text-slate-100 font-medium">
              {QUOTE.text}
            </p>
            <footer className="mt-6 flex items-center gap-3">
              <span className="h-px flex-1 max-w-[3rem] bg-linear-to-r from-purple-500 to-cyan-500 rounded-full" aria-hidden />
              <cite className="not-italic text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium tracking-wide">
                {QUOTE.author}
              </cite>
            </footer>
          </blockquote>
        </motion.div>
      </div>
    </section>
  );
};

export default Quote;
