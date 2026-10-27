import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import PublicPageLayout from "@/components/PublicPageLayout";
import Seo from "@/components/Seo";
import { useLocaleHref, useMessages } from "@/i18n/LocaleProvider";

const NotFound = () => {
  const location = useLocation();
  const messages = useMessages();
  const href = useLocaleHref();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <PublicPageLayout className="bg-gray-100">
      <Seo page="notFound" />
      <div className="flex flex-1 items-center justify-center px-6 py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">{messages.notFound.title}</h1>
          <p className="text-xl text-gray-600 mb-4">
            {messages.notFound.message}
          </p>
          <a href={href("/")} className="font-medium text-[#3b2416] underline decoration-primary decoration-2 underline-offset-4 hover:decoration-[#3b2416]">
            {messages.notFound.backHome}
          </a>
        </div>
      </div>
    </PublicPageLayout>
  );
};

export default NotFound;
