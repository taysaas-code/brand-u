import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Palette, Eye, EyeOff, Loader2, Mail, AlertCircle, CheckCircle } from 'lucide-react';

// Validation schemas
const signInSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(1, 'Mot de passe requis')
});

const signUpSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Adresse email invalide'),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Adresse email invalide')
});

export default function Auth() {
  const [activeTab, setActiveTab] = useState('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  const { signIn, signUp, signInWithGoogle, resetPassword, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Forms
  const signInForm = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' }
  });

  const signUpForm = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' }
  });

  const forgotPasswordForm = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' }
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const redirectTo = searchParams.get('redirectTo') || '/identitevisuelle';
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, searchParams]);

  // Handle sign in
  const handleSignIn = async (data) => {
    setIsLoading(true);
    setMessage({ type: '', content: '' });

    const { error } = await signIn(data.email, data.password);

    if (error) {
      setMessage({
        type: 'error',
        content: error.message === 'Invalid login credentials' 
          ? 'Email ou mot de passe incorrect'
          : 'Erreur de connexion. Veuillez réessayer.'
      });
    } else {
      setMessage({
        type: 'success',
        content: 'Connexion réussie ! Redirection...'
      });
    }

    setIsLoading(false);
  };

  // Handle sign up
  const handleSignUp = async (data) => {
    setIsLoading(true);
    setMessage({ type: '', content: '' });

    const { error } = await signUp(data.email, data.password, {
      name: data.name
    });

    if (error) {
      setMessage({
        type: 'error',
        content: error.message === 'User already registered'
          ? 'Un compte existe déjà avec cette adresse email'
          : 'Erreur lors de la création du compte. Veuillez réessayer.'
      });
    } else {
      setMessage({
        type: 'success',
        content: 'Compte créé ! Vérifiez votre email pour confirmer votre inscription.'
      });
      signUpForm.reset();
    }

    setIsLoading(false);
  };

  // Handle Google sign in
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setMessage({ type: '', content: '' });

    const { error } = await signInWithGoogle();

    if (error) {
      setMessage({
        type: 'error',
        content: 'Erreur lors de la connexion avec Google. Veuillez réessayer.'
      });
      setIsLoading(false);
    }
    // Note: If successful, the redirect happens automatically
  };

  // Handle forgot password
  const handleForgotPassword = async (data) => {
    setIsLoading(true);
    setMessage({ type: '', content: '' });

    const { error } = await resetPassword(data.email);

    if (error) {
      setMessage({
        type: 'error',
        content: 'Erreur lors de l\'envoi de l\'email. Veuillez réessayer.'
      });
    } else {
      setMessage({
        type: 'success',
        content: 'Email de réinitialisation envoyé ! Vérifiez votre boîte de réception.'
      });
      forgotPasswordForm.reset();
      setShowForgotPassword(false);
    }

    setIsLoading(false);
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Palette className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">Brand'U</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Mot de passe oublié</h1>
            <p className="text-gray-600">Entrez votre email pour recevoir un lien de réinitialisation</p>
          </div>

          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              {message.content && (
                <Alert className={`mb-4 ${message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription className={message.type === 'error' ? 'text-red-700' : 'text-green-700'}>
                    {message.content}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={forgotPasswordForm.handleSubmit(handleForgotPassword)} className="space-y-4">
                <div>
                  <Label htmlFor="email">Adresse e-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    {...forgotPasswordForm.register('email')}
                    placeholder="votre@email.com"
                    className="mt-1"
                  />
                  {forgotPasswordForm.formState.errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {forgotPasswordForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Envoyer le lien de réinitialisation
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setShowForgotPassword(false)}
                >
                  Retour à la connexion
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Palette className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Brand'U</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {activeTab === 'signin' ? 'Connexion' : 'Créer un compte'}
          </h1>
          <p className="text-gray-600">
            {activeTab === 'signin' 
              ? 'Accédez à votre designer IA personnel' 
              : 'Rejoignez Brand\'U et créez des visuels exceptionnels'
            }
          </p>
        </div>

        <Card className="border-none shadow-lg">
          <CardContent className="p-6">
            {message.content && (
              <Alert className={`mb-4 ${message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
                {message.type === 'error' ? (
                  <AlertCircle className="w-4 h-4" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                <AlertDescription className={message.type === 'error' ? 'text-red-700' : 'text-green-700'}>
                  {message.content}
                </AlertDescription>
              </Alert>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Connexion</TabsTrigger>
                <TabsTrigger value="signup">Inscription</TabsTrigger>
              </TabsList>

              {/* Sign In Tab */}
              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                  <div>
                    <Label htmlFor="signin-email">Adresse e-mail</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      {...signInForm.register('email')}
                      placeholder="votre@email.com"
                      className="mt-1"
                    />
                    {signInForm.formState.errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {signInForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="signin-password">Mot de passe</Label>
                    <div className="relative mt-1">
                      <Input
                        id="signin-password"
                        type={showPassword ? 'text' : 'password'}
                        {...signInForm.register('password')}
                        placeholder="••••••••"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {signInForm.formState.errors.password && (
                      <p className="text-red-500 text-sm mt-1">
                        {signInForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Connexion...
                      </>
                    ) : (
                      'Se connecter'
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Sign Up Tab */}
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                  <div>
                    <Label htmlFor="signup-name">Nom complet</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      {...signUpForm.register('name')}
                      placeholder="Votre nom complet"
                      className="mt-1"
                    />
                    {signUpForm.formState.errors.name && (
                      <p className="text-red-500 text-sm mt-1">
                        {signUpForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="signup-email">Adresse e-mail</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      {...signUpForm.register('email')}
                      placeholder="votre@email.com"
                      className="mt-1"
                    />
                    {signUpForm.formState.errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {signUpForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="signup-password">Mot de passe</Label>
                    <div className="relative mt-1">
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        {...signUpForm.register('password')}
                        placeholder="••••••••"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {signUpForm.formState.errors.password && (
                      <p className="text-red-500 text-sm mt-1">
                        {signUpForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="signup-confirm-password">Confirmer le mot de passe</Label>
                    <div className="relative mt-1">
                      <Input
                        id="signup-confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        {...signUpForm.register('confirmPassword')}
                        placeholder="••••••••"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {signUpForm.formState.errors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">
                        {signUpForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Création du compte...
                      </>
                    ) : (
                      'Créer mon compte'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Google Sign In */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">ou</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full mt-4"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                Continuer avec Google
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}