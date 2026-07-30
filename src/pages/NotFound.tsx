import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import PublicPageLayout from "@/components/PublicPageLayout";
import { useMessages } from "@/i18n/LocaleProvider";

const NotFound = () => {
  const location = useLocation();
  const messages = useMessages();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <PublicPageLayout className="bg-gray-100">
      <div className="flex flex-1 items-center justify-center px-6 py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">{messages.notFound.title}</h1>
          <p className="text-xl text-gray-600 mb-4">
            {messages.notFound.message}
          </p>
          <a href="/" className="text-primary hover:underline font-medium">
            {messages.notFound.backHome}
          </a>
        </div>
      </div>
    </PublicPageLayout>
  );
};

export default NotFound;
