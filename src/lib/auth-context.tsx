import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "sales" | "operations" | "accounts";
  phone: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile with error handling
  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      console.log("[AUTH] Fetching profile for user:", userId);
      
      // Don't use abort controller - it can cause issues
      // Instead use a shorter timeout directly in Supabase query
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Profile fetch timeout")), 3000)
      );

      const queryPromise = supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (!error && data) {
        console.log("[AUTH] Profile fetched successfully:", data.email);
        setUserProfile(data);
        return true;
      } else {
        console.warn("[AUTH] Failed to fetch user profile:", error?.message || "Unknown error");
        // Don't block on profile fetch - continue without it
        setUserProfile(null);
        return false;
      }
    } catch (error) {
      console.error("[AUTH] Profile fetch error:", error);
      // Continue without profile rather than blocking
      setUserProfile(null);
      return false;
    }
  }, []);

  useEffect(() => {
    // Flag to prevent multiple initializations in StrictMode
    let isInitialized = false;
    let loadingTimeout: NodeJS.Timeout;
    let isMounted = true; // Track if component is mounted

    const checkSession = async () => {
      try {
        console.log("[AUTH] Checking existing session");
        
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!isMounted) return; // Stop if component unmounted

        if (session?.user) {
          console.log("[AUTH] Found existing session for user:", session.user.id);
          setUser(session.user);
          // Fetch profile in background - don't wait for it
          fetchUserProfile(session.user.id).catch(() => {
            console.warn("[AUTH] Profile fetch failed in background");
          });
        } else {
          console.log("[AUTH] No existing session found");
          setUser(null);
          setUserProfile(null);
        }
      } catch (error) {
        console.error("[AUTH] Session check error:", error);
        if (isMounted) {
          setUser(null);
          setUserProfile(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          isInitialized = true;
        }
      }
    };

    // Set a hard timeout to ensure loading is never stuck
    loadingTimeout = setTimeout(() => {
      if (!isInitialized && isMounted) {
        console.warn("[AUTH] Auth initialization timeout - forcing completion");
        setLoading(false);
        isInitialized = true;
      }
    }, 5000); // Reduced from 10s to 5s

    checkSession();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (event === "SIGNED_OUT") {
        setUser(null);
        setUserProfile(null);
        setLoading(false);
        return;
      }

      if (session?.user) {
        setUser(session.user);
        // Fetch profile but don't block on it
        try {
          await fetchUserProfile(session.user.id);
        } catch (error) {
          console.warn("[AUTH] Auth state change profile fetch failed:", error);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    // Listen for visibility changes - refresh auth when tab becomes active
    const handleVisibilityChange = async () => {
      if (!document.hidden && isInitialized && isMounted) {
        // Tab became active again - refresh session silently
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            await fetchUserProfile(session.user.id);
          }
        } catch (error) {
          console.warn("[AUTH] Visibility change session refresh failed:", error);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      isMounted = false;
      clearTimeout(loadingTimeout);
      subscription?.unsubscribe();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchUserProfile]);

  const signIn = async (email: string, password: string) => {
    try {
      console.log("[AUTH] Starting sign in for:", email);
      
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("[AUTH] Supabase signIn error:", error);
        throw error;
      }

      console.log("[AUTH] Sign in successful, user:", data.user?.id);

      // Wait for the auth state to be updated by the listener
      // Check session after sign in
      if (data.user) {
        console.log("[AUTH] Setting user state");
        setUser(data.user);
        // Fetch profile immediately
        console.log("[AUTH] Fetching user profile");
        await fetchUserProfile(data.user.id);
        console.log("[AUTH] Profile fetched successfully");
      }
    } catch (error) {
      console.error("[AUTH] Sign in error:", error);
      throw error;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: string
  ) => {
    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // Create user profile in database
      if (data.user) {
        const { error: profileError } = await supabase.from("users").insert({
          id: data.user.id,
          email,
          full_name: fullName,
          role,
          phone: "",
          created_at: new Date().toISOString(),
        });

        if (profileError) throw profileError;
      }
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Clear local state first
      setUser(null);
      setUserProfile(null);
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      // Clear session storage
      sessionStorage.clear();
      localStorage.removeItem("sb-auth-token");
      localStorage.removeItem("sb-refresh-token");
      
      if (error) {
        console.warn("Supabase signOut warning:", error);
      }
    } catch (error) {
      console.error("Sign out error:", error);
      // Still clear local state even if Supabase signOut fails
      setUser(null);
      setUserProfile(null);
      sessionStorage.clear();
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signIn,
        signUp,
        signOut,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
