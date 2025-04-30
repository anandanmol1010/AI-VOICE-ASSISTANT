"use client";

import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { auth } from "@/firebase/client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  AuthError,
} from "firebase/auth";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

import { signIn, signUp } from "@/lib/actions/auth.action";
import FormField from "./FormField";

const authFormSchema = (type: FormType) => {
  return z.object({
    name: type === "sign-up" ? z.string().min(3) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(3),
  });
};

const AuthForm = ({ type }: { type: FormType }) => {
  const router = useRouter();
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (type === "sign-up") {
        const { name, email, password } = data;

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        const result = await signUp({
          uid: userCredential.user.uid,
          name: name!,
          email,
          password,
        });

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success("Account created successfully. Please sign in.");
        router.push("/sign-in");
      } else {
        const { email, password } = data;

        try {
          const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
          );

          const idToken = await userCredential.user.getIdToken();
          if (!idToken) {
            toast.error("Sign in Failed. Please try again.");
            return;
          }

          await signIn({
            email,
            idToken,
          });

          toast.success("Signed in successfully.");
          router.push("/");
          
          // Hide forgot password if login is successful
          setShowForgotPassword(false);
        } catch (error) {
          // Show forgot password button on authentication error
          setShowForgotPassword(true);
          
          // Pre-fill the reset email with the current email
          setResetEmail(email);
          
          const authError = error as AuthError;
          if (authError.code === 'auth/invalid-credential' || 
              authError.code === 'auth/invalid-password' ||
              authError.code === 'auth/wrong-password') {
            toast.error("Invalid email or password. Please try again or reset your password.");
          } else {
            toast.error(`Sign in failed: ${authError.message}`);
          }
          throw error; // Re-throw to be caught by the outer catch
        }
      }
    } catch (error) {
      console.log(error);
      // Error is already handled in the inner catch for sign-in
      if (type !== "sign-in") {
        toast.error(`There was an error: ${error}`);
      }
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail || !resetEmail.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setIsResetting(true);
      await sendPasswordResetEmail(auth, resetEmail);
      toast.success("Password reset email sent! Check your inbox.");
      setIsResetDialogOpen(false);
    } catch (error: any) {
      console.error("Error sending reset email:", error);
      if (error.code === 'auth/user-not-found') {
        toast.error("No account found with this email address");
      } else {
        toast.error("Failed to send reset email. Please try again.");
      }
    } finally {
      setIsResetting(false);
    }
  };

  const openResetDialog = () => {
    // Pre-fill with the email from the form
    const email = form.getValues("email");
    if (email) {
      setResetEmail(email);
    }
    setIsResetDialogOpen(true);
  };

  const isSignIn = type === "sign-in";

  return (
    <div className="card-border lg:min-w-[566px]">
      <div className="flex flex-col gap-6 card py-14 px-10">
        <div className="flex flex-row gap-2 items-center justify-center">
          <div className="bg-dark-200 border border-[#dddfff]/20 rounded-lg w-[60px] h-[60px] flex items-center justify-center shadow-md">
            <div className="w-[50px] h-[50px] relative">
              <Image
                src="/logo.png"
                alt="IntervuBuddy Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          <h2 className="text-primary-100 text-2xl font-bold">
            IntervuBuddy by Anmol
          </h2>
        </div>

        <h3>Practice job interviews with AI created by Anmol</h3>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-6 mt-4 form"
          >
            {!isSignIn && (
              <FormField
                control={form.control}
                name="name"
                label="Name"
                placeholder="Enter Your Name"
                type="text"
              />
            )}

            <FormField
              control={form.control}
              name="email"
              label="Email"
              placeholder="Enter Your Email"
              type="email"
            />

            <FormField
              control={form.control}
              name="password"
              label="Password"
              placeholder="Enter Your Password"
              type="password"
            />

            {isSignIn && showForgotPassword && (
              <div className="flex justify-end -mt-4">
                <button
                  type="button"
                  onClick={openResetDialog}
                  className="text-sm text-primary-100 hover:text-primary-200 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button className="btn" type="submit">
              {isSignIn ? "Sign In" : "Create an Account"}
            </Button>
          </form>
        </Form>

        <p className="text-center">
          {isSignIn
            ? "No account yet? make your account first!"
            : "Have an account already?"}
          <Link
            href={!isSignIn ? "/sign-in" : "/sign-up"}
            className="font-bold text-user-primary ml-1"
          >
            {!isSignIn ? "Sign In" : "Sign Up"}
          </Link>
        </p>
      </div>

      {/* Password Reset Dialog */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent className="bg-dark-100 border border-dark-300 text-light-100 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-primary-100">Reset Your Password</DialogTitle>
            <DialogDescription className="text-light-300">
              Enter your email address and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <Input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="Enter your email address"
              className="bg-dark-200 border-dark-300 text-light-100"
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsResetDialogOpen(false)}
              className="bg-dark-200 text-light-100 hover:bg-dark-300"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleResetPassword} 
              disabled={isResetting}
              className="bg-primary-100 text-dark-100 hover:bg-primary-200"
            >
              {isResetting ? "Sending..." : "Send Reset Link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuthForm;
