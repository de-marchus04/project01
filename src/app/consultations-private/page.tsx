import { getPrivateConsultations } from "@/shared/api/consultationApi";
import ConsultationsPrivateClient from "./ConsultationsPrivateClient";

export const revalidate = 3600;

export default async function ConsultationsPrivatePage() {
  const initialData = await getPrivateConsultations().catch(() => []);
  return <ConsultationsPrivateClient initialData={initialData} />;
}
