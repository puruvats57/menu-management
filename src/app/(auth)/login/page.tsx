"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "verify" | "register">("register");
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("");

  const sendCode = api.auth.sendVerificationCode.useMutation();
  const register = api.auth.register.useMutation();
  const verify = api.auth.verifyAndLogin.useMutation();

  const handleSendCode = async () => {
    try {
      await sendCode.mutateAsync({ email });
      setStep("verify");
    } catch (error) {
      // If user doesn't exist, switch to registration
      if (error instanceof Error && error.message.includes("not found")) {
        setStep("register");
      }
    }
  };

  const handleRegister = async () => {
    try {
      await register.mutateAsync({ email, fullName, country });
      setStep("verify");
    } catch (error) {
      console.error(error);
    }
  };

  const handleVerify = async () => {
    try {
      const result = await verify.mutateAsync({ email, code });
      if (result.token) {
        localStorage.setItem("auth-token", result.token);
        router.push("/dashboard");
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (step === "register") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Register</CardTitle>
            <CardDescription>Create a new account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="United States"
              />
            </div>
            <Button
              onClick={handleRegister}
              disabled={register.isPending}
              className="w-full"
            >
              {register.isPending ? "Sending..." : "Send Verification Code"}
            </Button>
            <div className="pt-4 text-center">
              <p className="text-sm text-gray-600 mb-2">Already have an account?</p>
              <Button
                variant="outline"
                onClick={() => {
                  setStep("email");
                  setEmail("");
                  setFullName("");
                  setCountry("");
                }}
                className="w-full"
              >
                Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "verify") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Verify Email</CardTitle>
            <CardDescription>Enter the verification code sent to your email</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                maxLength={6}
              />
            </div>
            <Button
              onClick={handleVerify}
              disabled={verify.isPending}
              className="w-full"
            >
              {verify.isPending ? "Verifying..." : "Verify & Login"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setStep("email");
                setCode("");
              }}
              className="w-full"
            >
              Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Enter your email to receive a verification code</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  void handleSendCode();
                }
              }}
            />
          </div>
          <Button
            onClick={handleSendCode}
            disabled={sendCode.isPending}
            className="w-full"
          >
            {sendCode.isPending ? "Sending..." : "Send Verification Code"}
          </Button>
          <div className="pt-4 text-center">
            <p className="text-sm text-gray-600 mb-2">Don&apos;t have an account?</p>
            <Button
              variant="outline"
              onClick={() => {
                setStep("register");
                setEmail("");
                setCode("");
              }}
              className="w-full"
            >
              Register
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

