import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <div className="flex h-full items-center justify-center">
        <div className="text-center glass rounded-xl p-12 border border-border">
          <h1 className="mb-4 text-6xl font-bold text-primary">404</h1>
          <p className="mb-6 text-2xl text-foreground">Oops! Page not found</p>
          <p className="mb-8 text-muted-foreground">The page you're looking for doesn't exist.</p>
          <Link to="/">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
