import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentUser, UserGuard } from "app"; // UserGuard is the provider
import { User } from "firebase/auth";

interface Props {
  children: React.ReactNode;
  redirectTo?: string;
  // Optional: Custom loading component
  // loadingComponent?: React.ReactNode;
}

const LoginRequiredPage: React.FC<Props> = ({
  children,
  redirectTo = "/Login", // Default to /Login, adjust if your login page is different
  // loadingComponent = <p>Loading user...</p>,
}) => {
  const { user, loading, error } = useCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      // User is not logged in and loading is complete, redirect.
      // We pass the current path as `from` so the login page can redirect back.
      navigate(redirectTo, { replace: true, state: { from: window.location.pathname } });
    }
    if (error) {
      // Handle auth errors, e.g., by redirecting to an error page or login
      console.error("Auth error in LoginRequiredPage:", error);
      navigate(redirectTo, { replace: true, state: { from: window.location.pathname } });
    }
  }, [user, loading, navigate, redirectTo, error]);

  if (loading) {
    // You can replace this with a more sophisticated loading spinner/component
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Verificando autenticação...</p>
      </div>
    );
    // return <>{loadingComponent}</>;
  }

  if (!user) {
    // User is not logged in, and useEffect should have redirected.
    // Return null or a loading indicator while redirecting.
    return null;
  }

  // User is logged in, provide the UserGuard context and render children.
  // The UserGuard component itself provides the context that useUserGuardContext consumes.
  return <UserGuard user={user as User}>{children}</UserGuard>;
};

export { LoginRequiredPage };
