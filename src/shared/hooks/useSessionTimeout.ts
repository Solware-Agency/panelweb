import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@app/providers/AuthContext';
import { supabase } from '@lib/supabase/config';
import { useToast } from './use-toast';

// Session timeout options in minutes
export const SESSION_TIMEOUT_OPTIONS = [1, 5, 10, 15, 20, 30, 60];

// Default timeout in minutes
const DEFAULT_TIMEOUT = 15;

// Storage keys
const LAST_ACTIVITY_KEY = 'last_activity_time';
const SESSION_TIMEOUT_KEY = 'session_timeout_minutes';
const SESSION_EXPIRY_KEY = 'session_expiry_time';

export interface UseSessionTimeoutOptions {
  onTimeout?: () => void;
  onWarning?: (remainingTime: number) => void;
  warningThreshold?: number; // in seconds
}

export function useSessionTimeout(options: UseSessionTimeoutOptions = {}) {
  const { 
    onTimeout = () => {}, 
    onWarning = () => {},
    warningThreshold = 60 // Default warning 60 seconds before timeout
  } = options;
  
  const { user, session, loading: authLoading } = useAuth();
  const [sessionTimeout, setSessionTimeout] = useState<number>(DEFAULT_TIMEOUT);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const { toast } = useToast();
  
  // Use refs to avoid stale closures in interval callbacks
  const timeoutRef = useRef<number>(DEFAULT_TIMEOUT);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Load user's session timeout preference
  const loadUserTimeout = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // First check if we have a stored timeout preference
      const storedTimeout = localStorage.getItem(SESSION_TIMEOUT_KEY);
      if (storedTimeout) {
        const parsedTimeout = parseInt(storedTimeout, 10);
        if (!isNaN(parsedTimeout) && SESSION_TIMEOUT_OPTIONS.includes(parsedTimeout)) {
          setSessionTimeout(parsedTimeout);
          timeoutRef.current = parsedTimeout;
          return;
        }
      }
      
      // If no stored preference, fetch from database
      const { data, error } = await supabase
        .from('user_settings')
        .select('session_timeout')
        .eq('id', user.id)
        .single();
      
      if (error) {
        // If no settings found, create default settings
        if (error.code === 'PGRST116') {
          const { error: insertError } = await supabase
            .from('user_settings')
            .insert({ id: user.id, session_timeout: DEFAULT_TIMEOUT });
          
          if (insertError) {
            console.error('Error creating user settings:', insertError);
          } else {
            // Successfully created default settings
            setSessionTimeout(DEFAULT_TIMEOUT);
            timeoutRef.current = DEFAULT_TIMEOUT;
            localStorage.setItem(SESSION_TIMEOUT_KEY, DEFAULT_TIMEOUT.toString());
          }
        } else {
          console.error('Error fetching user settings:', error);
        }
      } else if (data) {
        // Use the user's preferred timeout
        setSessionTimeout(data.session_timeout);
        timeoutRef.current = data.session_timeout;
        localStorage.setItem(SESSION_TIMEOUT_KEY, data.session_timeout.toString());
      }
    } catch (err) {
      console.error('Error loading user timeout:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);
  
  // Update user's session timeout preference
  const updateUserTimeout = useCallback(async (minutes: number) => {
    if (!user || !SESSION_TIMEOUT_OPTIONS.includes(minutes)) return;
    
    try {
      // Update in database
      const { error } = await supabase
        .from('user_settings')
        .upsert({ 
          id: user.id, 
          session_timeout: minutes,
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Error updating session timeout:', error);
        toast({
          title: 'Error',
          description: 'No se pudo actualizar la configuración de tiempo de sesión',
          variant: 'destructive'
        });
        return false;
      }
      
      // Update local state and storage
      setSessionTimeout(minutes);
      timeoutRef.current = minutes;
      localStorage.setItem(SESSION_TIMEOUT_KEY, minutes.toString());
      
      // Reset the session timer with new timeout
      resetSessionTimer();
      
      toast({
        title: 'Configuración actualizada',
        description: `Tiempo de sesión establecido a ${minutes} minutos`,
      });
      
      return true;
    } catch (err) {
      console.error('Error updating timeout:', err);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la configuración de tiempo de sesión',
        variant: 'destructive'
      });
      return false;
    }
  }, [user, toast]);
  
  // Record user activity
  const recordActivity = useCallback(() => {
    const now = Date.now();
    console.log('🔄 Actividad registrada:', new Date(now).toLocaleTimeString());
    localStorage.setItem(LAST_ACTIVITY_KEY, now.toString());
    
    // Calculate and store the expiry time
    const expiryTime = now + (timeoutRef.current * 60 * 1000);
    localStorage.setItem(SESSION_EXPIRY_KEY, expiryTime.toString());
    console.log('⏱️ Tiempo de expiración actualizado:', new Date(expiryTime).toLocaleTimeString());
    
    // Reset warning state
    setShowWarning(false);
    
    // Clear any existing warning timer
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
  }, []);
  
  // Reset the session timer
  const resetSessionTimer = useCallback(() => {
    // Clear existing timers
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    
    // Record current activity
    recordActivity();
    
    // Start a new timer that checks remaining time
    timerRef.current = setInterval(() => {
      const lastActivity = parseInt(localStorage.getItem(LAST_ACTIVITY_KEY) || '0', 10);
      if (lastActivity === 0) {
        // No hay actividad registrada, registrar actividad actual
        recordActivity();
        return;
      }
      
      const expiryTime = parseInt(localStorage.getItem(SESSION_EXPIRY_KEY) || '0', 10);
      const now = Date.now();
      
      // Verificar si la expiración es válida
      if (expiryTime <= now) {
        console.log('⚠️ Tiempo de expiración inválido o expirado, actualizando...');
        recordActivity();
        return;
      }
      
      // Calculate remaining time in seconds
      const remainingMs = Math.max(0, expiryTime - now);
      const remainingSeconds = Math.floor(remainingMs / 1000);
      
      // Log cada 10 segundos para no saturar la consola
      if (remainingSeconds % 10 === 0 || remainingSeconds <= warningThreshold) {
        console.log(`⏳ Tiempo restante: ${remainingSeconds}s (${Math.floor(remainingSeconds/60)}m:${remainingSeconds%60}s) - Timeout: ${timeoutRef.current}m`);
      }
      
      setTimeRemaining(remainingSeconds);
      
      // Check if we should show a warning
      if (remainingSeconds <= warningThreshold && remainingSeconds > 0 && !showWarning) {
        console.log(`🚨 ADVERTENCIA: Sesión por expirar en ${remainingSeconds} segundos`);
        setShowWarning(true);
        onWarning(remainingSeconds);
      }
      
      // Check if session has timed out
      if (remainingSeconds <= 0) {
        // Session has expired
        console.log('🔒 SESIÓN EXPIRADA: Ejecutando callback de timeout');
        clearInterval(timerRef.current!);
        timerRef.current = null;
        
        // Clear session data
        localStorage.removeItem(LAST_ACTIVITY_KEY);
        localStorage.removeItem(SESSION_EXPIRY_KEY);
        
        // Call timeout callback
        onTimeout();
      }
    }, 1000);
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [onTimeout, onWarning, recordActivity, showWarning, warningThreshold]);
  
  // Initialize session timeout when user is loaded
  useEffect(() => {
    if (!authLoading && user) {
      loadUserTimeout().then(() => {
        resetSessionTimer();
      });
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
        warningTimerRef.current = null;
      }
    };
  }, [authLoading, user, loadUserTimeout, resetSessionTimer]);
  
  // Set up event listeners for user activity
  useEffect(() => {
    if (!user) return;
    
    const handleActivity = () => {
      recordActivity();
    };
    
    // Add event listeners for user activity
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('scroll', handleActivity);
    
    return () => {
      // Remove event listeners
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, [user, recordActivity]);
  
  // Check for existing session on page load
  useEffect(() => {
    if (!user) return;

    const lastActivity = parseInt(localStorage.getItem(LAST_ACTIVITY_KEY) || '0', 10);
    const expiryTime = parseInt(localStorage.getItem(SESSION_EXPIRY_KEY) || '0', 10);
    const now = Date.now();
    
    console.log('🔍 Verificando sesión existente:');
    console.log('  - Última actividad:', lastActivity ? new Date(lastActivity).toLocaleTimeString() : 'No registrada');
    console.log('  - Tiempo de expiración:', expiryTime ? new Date(expiryTime).toLocaleTimeString() : 'No establecido');
    console.log('  - Hora actual:', new Date(now).toLocaleTimeString());
    
    // If there's a stored session that hasn't expired yet
    if (lastActivity > 0 && expiryTime > now) {
      // Session is still valid, continue with it
      console.log('Existing session found, continuing with it');
    } else if (lastActivity > 0) {
      // Session has expired, clear it
      console.log('🔒 Sesión expirada encontrada, limpiando...');
      localStorage.removeItem(LAST_ACTIVITY_KEY);
      localStorage.removeItem(SESSION_EXPIRY_KEY);
      onTimeout();
    } else {
      // No hay sesión, iniciar una nueva
      console.log('🆕 No hay sesión existente, iniciando una nueva');
      recordActivity();
    }
  }, [user, onTimeout, recordActivity]);
  
  // Format time remaining for display
  const formatTimeRemaining = useCallback(() => {
    if (timeRemaining === null) return '';
    
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [timeRemaining]);
  
  return {
    sessionTimeout,
    updateUserTimeout,
    isLoading,
    timeRemaining,
    showWarning,
    formatTimeRemaining,
    resetSessionTimer
  };
}