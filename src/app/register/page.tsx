import AuthForm from "../login/AuthForm";
export const metadata = { title: "Create account" };
export default async function Register({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  return <AuthForm mode="register" next={(await searchParams).next} />;
}
