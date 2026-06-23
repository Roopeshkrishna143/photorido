import { useEffect, useState } from "react";
import { Loader2, Lock, Mail, Smartphone, User } from "lucide-react";
import {
  useAuth,
  type RegistrationOtpResponse,
  type UserRole,
} from "../../context/AuthContext";
import { showErrorAlert, showSuccessAlert } from "../../lib/alerts";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  defaultRole?: UserRole;
  onSuccess?: (role: Exclude<UserRole, null>) => void;
}

interface RegistrationOtpState extends RegistrationOtpResponse {
  identifier: string;
}

interface AuthNotice {
  tone: "error" | "success" | "info";
  message: string;
}

const REGISTER_ROLES: Array<{ label: string; value: Exclude<UserRole, null> }> =
  [
    { label: "User", value: "user" },
    { label: "Professional", value: "vendor" },
  ];

const OTP_LENGTH = 6;

function resolveRegisterRole(role: UserRole) {
  return role === "vendor" ? "vendor" : "user";
}

export function LoginModal({
  open,
  onClose,
  defaultRole = "user",
  onSuccess,
}: LoginModalProps) {
  const {
    login,
    loginWithGoogle,
    requestRegistrationOtp,
    verifyRegistrationOtp,
  } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [registerRole, setRegisterRole] = useState<Exclude<UserRole, null>>(
    resolveRegisterRole(defaultRole),
  );
  const [notice, setNotice] = useState<AuthNotice | null>(null);

  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [registerName, setRegisterName] = useState("");
  const [registerIdentifier, setRegisterIdentifier] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [registrationOtp, setRegistrationOtp] = useState("");
  const [registrationDelivery, setRegistrationDelivery] =
    useState<RegistrationOtpState | null>(null);

  const resetLoginState = () => {
    setLoginIdentifier("");
    setLoginPassword("");
  };

  const resetRegistrationState = () => {
    setRegisterName("");
    setRegisterIdentifier("");
    setRegisterPassword("");
    setConfirmPassword("");
    setRegistrationOtp("");
    setRegistrationDelivery(null);
  };

  const resetAllState = () => {
    resetLoginState();
    resetRegistrationState();
    setNotice(null);
    setIsLoading(false);
    setActiveTab("login");
    setRegisterRole(resolveRegisterRole(defaultRole));
  };

  useEffect(() => {
    if (!open) {
      resetAllState();
      return;
    }

    setRegisterRole(resolveRegisterRole(defaultRole));
    // When defaultRole is 'vendor', automatically switch to register tab
    if (defaultRole === "vendor") {
      setActiveTab("register");
    }
  }, [defaultRole, open]);

  useEffect(() => {
    if (activeTab === "login") {
      resetRegistrationState();
    }
  }, [activeTab]);

  const closeModalForAlert = async () => {
    resetAllState();
    onClose();
    await new Promise((resolve) => window.setTimeout(resolve, 150));
  };

  const handleDialogChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetAllState();
      onClose();
    }
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setNotice(null);

    if (!loginIdentifier || !loginPassword) {
      setNotice({ tone: "error", message: "Please fill in all login fields." });
      return;
    }

    setIsLoading(true);
    try {
      const sessionUser = await login(loginIdentifier, loginPassword);
      await closeModalForAlert();
      await showSuccessAlert("Login successful", {
        text: "Redirecting you to your dashboard.",
      });
      onSuccess?.(sessionUser.role ?? "user");
    } catch (error) {
      await closeModalForAlert();
      await showErrorAlert("Login failed", {
        text:
          error instanceof Error
            ? error.message
            : "Login failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestRegistrationOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setNotice(null);

    if (
      !registerName ||
      !registerIdentifier ||
      !registerPassword ||
      !confirmPassword
    ) {
      setNotice({
        tone: "error",
        message: "Please fill in all registration fields.",
      });
      return;
    }

    if (registerPassword !== confirmPassword) {
      setNotice({ tone: "error", message: "Passwords do not match." });
      return;
    }

    if (registerPassword.length < 8) {
      setNotice({
        tone: "error",
        message: "Password must be at least 8 characters.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const delivery = await requestRegistrationOtp(
        registerName,
        registerIdentifier,
        registerPassword,
        registerRole,
      );
      setRegistrationDelivery({
        ...delivery,
        identifier: registerIdentifier.trim(),
      });
      setRegistrationOtp("");
      setNotice({
        tone: "success",
        message: `OTP sent successfully to ${delivery.maskedDestination}. Please enter it below to continue.`,
      });
    } catch (error) {
      setNotice({
        tone: "error",
        message:
          error instanceof Error
            ? error.message
            : "We could not send the OTP. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyRegistrationOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setNotice(null);

    if (!registrationDelivery) {
      setNotice({ tone: "error", message: "Request an OTP first." });
      return;
    }

    if (registrationOtp.length !== OTP_LENGTH) {
      setNotice({ tone: "error", message: "Enter the 6-digit OTP." });
      return;
    }

    setIsLoading(true);
    try {
      const sessionUser = await verifyRegistrationOtp(
        registrationDelivery.identifier,
        registrationOtp,
      );
      await closeModalForAlert();
      await showSuccessAlert("Registration successful", {
        text: "Your account was verified and created successfully.",
      });
      onSuccess?.(sessionUser.role ?? registerRole);
    } catch (error) {
      await closeModalForAlert();
      await showErrorAlert("OTP verification failed", {
        text:
          error instanceof Error
            ? error.message
            : "The OTP is invalid. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendRegistrationOtp = async () => {
    setNotice(null);

    if (!registerName || !registerIdentifier || !registerPassword) {
      setNotice({
        tone: "error",
        message: "Complete the registration form first.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const delivery = await requestRegistrationOtp(
        registerName,
        registerIdentifier,
        registerPassword,
        registerRole,
      );
      setRegistrationDelivery({
        ...delivery,
        identifier: registerIdentifier.trim(),
      });
      setRegistrationOtp("");
      setNotice({
        tone: "success",
        message: `A fresh OTP was sent to ${delivery.maskedDestination}.`,
      });
    } catch (error) {
      setNotice({
        tone: "error",
        message:
          error instanceof Error
            ? error.message
            : "We could not resend the OTP.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setNotice(null);
    setIsLoading(true);
    try {
      const sessionUser = await loginWithGoogle(
        activeTab === "register" ? registerRole : undefined,
      );
      await closeModalForAlert();
      await showSuccessAlert("Google login successful", {
        text: "Redirecting you to your dashboard.",
      });
      onSuccess?.(sessionUser.role ?? registerRole);
    } catch (error) {
      await closeModalForAlert();
      await showErrorAlert("Google login failed", {
        text:
          error instanceof Error
            ? error.message
            : "Google login failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            Welcome to Photorido
          </DialogTitle>
          <DialogDescription className="text-center">
            Login or create an account to get started
          </DialogDescription>
        </DialogHeader>

        {notice && (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${
              notice.tone === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : notice.tone === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-blue-200 bg-blue-50 text-blue-700"
            }`}
          >
            {notice.message}
          </div>
        )}

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "login" | "register")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-identifier">Email / Mobile</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="login-identifier"
                    type="text"
                    placeholder="Enter email or mobile number"
                    value={loginIdentifier}
                    onChange={(event) => setLoginIdentifier(event.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Password"
                    value={loginPassword}
                    onChange={(event) => setLoginPassword(event.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Login
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                Login with Google
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <div className="mb-2 mt-4">
              <Label className="mb-2 block text-sm font-medium">I am a:</Label>
              <div className="grid grid-cols-2 gap-2">
                {REGISTER_ROLES.map((role) => (
                  <Button
                    key={role.value}
                    type="button"
                    variant={
                      registerRole === role.value ? "default" : "outline"
                    }
                    onClick={() => setRegisterRole(role.value)}
                    className="w-full"
                  >
                    <User className="mr-2 h-4 w-4" />
                    {role.label}
                  </Button>
                ))}
              </div>
            </div>

            {registrationDelivery ? (
              <form
                onSubmit={handleVerifyRegistrationOtp}
                className="space-y-4"
              >
                <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-sm text-blue-900">
                  <p className="font-semibold">Verify your OTP</p>
                  <p className="mt-1">
                    Enter the 6-digit OTP sent to{" "}
                    <span className="font-medium">
                      {registrationDelivery.maskedDestination}
                    </span>
                    .
                  </p>
                  <p className="mt-2 text-xs text-blue-700">
                    This OTP expires in {registrationDelivery.expiresInMinutes}{" "}
                    minutes.
                  </p>
                  {registrationDelivery.deliveryMode ===
                    "mailtrap-mobile-fallback" && (
                    <p className="mt-2 text-xs text-blue-700">
                      Mobile OTP is being routed to the configured Mailtrap
                      inbox for development.
                    </p>
                  )}
                  {registrationDelivery.previewOtp && (
                    <p className="mt-2 text-xs font-semibold text-amber-700">
                      Dev preview OTP: {registrationDelivery.previewOtp}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registration-otp">OTP</Label>
                  <div className="flex justify-center">
                    <InputOTP
                      id="registration-otp"
                      maxLength={OTP_LENGTH}
                      value={registrationOtp}
                      onChange={setRegistrationOtp}
                      disabled={isLoading}
                    >
                      <InputOTPGroup>
                        {Array.from({ length: OTP_LENGTH }, (_, index) => (
                          <InputOTPSlot key={index} index={index} />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  disabled={isLoading}
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Verify OTP
                </Button>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleResendRegistrationOtp}
                    disabled={isLoading}
                  >
                    Resend OTP
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setRegistrationDelivery(null);
                      setRegistrationOtp("");
                    }}
                    disabled={isLoading}
                  >
                    Edit Details
                  </Button>
                </div>
              </form>
            ) : (
              <form
                onSubmit={handleRequestRegistrationOtp}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="register-name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="John Doe"
                      value={registerName}
                      onChange={(event) => setRegisterName(event.target.value)}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-identifier">Email / Mobile</Label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="register-identifier"
                      type="text"
                      placeholder="Enter email or mobile number"
                      value={registerIdentifier}
                      onChange={(event) =>
                        setRegisterIdentifier(event.target.value)
                      }
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Password"
                      value={registerPassword}
                      onChange={(event) =>
                        setRegisterPassword(event.target.value)
                      }
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  disabled={isLoading}
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Send OTP
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
                  Register with Google
                </Button>
              </form>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
