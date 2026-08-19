import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="text-center mb-2">
        <h1 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h1>
        <p className="text-xs text-gray-400">Sign in to your TeamHub workspace account</p>
      </div>
      <SignIn
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "metallic-card border border-dark-border shadow-2xl rounded-2xl w-full",
          },
        }}
      />
    </div>
  );
}
