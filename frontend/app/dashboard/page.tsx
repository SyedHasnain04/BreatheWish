import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

export default async function DashboardRedirect() {
  const session = await getServerSession();
  
  if (!session) {
    redirect("/login");
  }

  if (session.user?.role === "doctor") {
    redirect("/doctor/dashboard");
  } else {
    redirect("/patient/dashboard");
  }
}
