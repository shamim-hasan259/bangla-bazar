import React from "react";

interface sectionTitlePros {
  title: string;
}

const SectionTitle: React.FC<sectionTitlePros> = ({ title }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-8 sm:mb-10">
  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
    {title}
  </h3>
  <div className="h-1 w-20 sm:w-full sm:flex-1 bg-gradient-to-r from-primary/20 to-transparent rounded-full" />
</div>
  );
};

export default SectionTitle;
