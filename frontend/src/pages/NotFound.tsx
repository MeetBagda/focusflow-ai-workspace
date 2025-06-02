/**
 * @fileoverview NotFound page component for displaying a 404 error.
 * This page is rendered when a user navigates to an undefined route.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground text-center p-4">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-3xl font-semibold mb-6">Page Not Found</h2>
      <p className="text-lg text-muted-foreground mb-8">
        Oops! The page you are looking for does not exist.
      </p>
      <Link to="/app"> {/* Link back to the main app dashboard */}
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-6 py-3 rounded-md shadow-lg transition-colors">
          Go to Dashboard
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;
