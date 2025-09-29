import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, X, Loader2, CheckCircle } from 'lucide-react';

export default function EmailVerificationBanner() {
  const { user, resendVerification } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [message, setMessage] = useState('');

  // Don't show banner if user is verified, not logged in, or banner is hidden
  if (!user || user.email_confirmed_at || isHidden) {
    return null;
  }

  const handleResendVerification = async () => {
    setIsResending(true);
    setMessage('');

    const { error } = await resendVerification();

    if (error) {
      setMessage('Erreur lors de l\'envoi de l\'email. Veuillez réessayer.');
    } else {
      setMessage('Email de vérification renvoyé ! Vérifiez votre boîte de réception.');
    }

    setIsResending(false);
  };

  return (
    <Alert className="border-yellow-200 bg-yellow-50 mb-4">
      <Mail className="w-4 h-4 text-yellow-600" />
      <AlertDescription className="flex items-center justify-between w-full">
        <div className="flex-1">
          <p className="text-yellow-800 font-medium">
            Vérifiez votre adresse email
          </p>
          <p className="text-yellow-700 text-sm mt-1">
            Un email de confirmation a été envoyé à <strong>{user.email}</strong>
          </p>
          {message && (
            <p className="text-yellow-700 text-sm mt-2 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              {message}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResendVerification}
            disabled={isResending}
            className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
          >
            {isResending ? (
              <>
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Envoi...
              </>
            ) : (
              'Renvoyer'
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsHidden(true)}
            className="text-yellow-600 hover:bg-yellow-100 p-1"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}