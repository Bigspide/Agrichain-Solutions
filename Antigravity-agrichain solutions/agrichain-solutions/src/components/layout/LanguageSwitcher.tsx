import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { usePathname, useRouter } from "next/navigation";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const { locale, setLocale, locales } = useI18n();
  const pathname = usePathname();
  const router = useRouter();

  const handleLocaleChange = (newLocale: string) => {
    setLocale(newLocale as any);
    // Update the URL to reflect the new locale
    const newPathname = pathname.replace(
      /^\/[a-z]{2}(?=\/|$)/,
      `/${newLocale}`
    );
    router.push(newPathname, { scroll: false });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setLocale("fr")}
        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-sm font-medium text-gray-600 dark:text-gray-400"
        id="language-selector"
        aria-controls="language-menu"
        aria-expanded={false}
        aria-label="Changer de langue"
      >
        <Globe className="w-4 h-4" aria-hidden="true" />
        <span className="hidden sm:inline uppercase text-xs">{locale}</span>
      </button>
      <div className="absolute right-0 top-14 w-56 card-premium py-2 z-50 overflow-hidden shadow-2xl">
        {locales.map((loc) => (
          <Link
            key={loc.code}
            href={
              pathname.replace(
                /^\/[a-z]{2}(?=\/|$)/,
                `/${loc.code}`
              )
            }
            prefetch
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all ${
              locale === loc.code
                ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-navy-800"
            }`}
          >
            <span className="text-lg">{loc.flag}</span>
            <span className="font-semibold">{loc.nativeName}</span>
            {locale === loc.code && <span className="ml-auto text-primary-500">✓</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}