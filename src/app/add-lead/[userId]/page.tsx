import { MainAddLead } from ".";
interface AddLeadPageProps {
  params: Promise<{
    userId: string;
  }>;
}
export default async function AddLeadPage({ params }: AddLeadPageProps) {
  const { userId } = await params;
  return (
        <MainAddLead userId={userId} />
  );
}
