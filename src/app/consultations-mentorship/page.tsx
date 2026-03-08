import { getMentorshipConsultations } from "@/shared/api/consultationApi";
import ConsultationsMentorshipClient from "./ConsultationsMentorshipClient";

export const revalidate = 3600;

export default async function ConsultationsMentorshipPage() {
  const initialData = await getMentorshipConsultations().catch(() => []);
  return <ConsultationsMentorshipClient initialData={initialData} />;
}
