import { UILanguageProvider } from '@/components/UILanguageProvider';
import TranslationTelephoneApp from '@/components/TranslationTelephoneApp';

export default function Home() {
  return (
    <UILanguageProvider>
      <TranslationTelephoneApp />
    </UILanguageProvider>
  );
}
