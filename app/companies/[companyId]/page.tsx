import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CompanyDetail } from "@/domains/app/components/CompanyDetail";
import {
  getCompanyDetail,
  listCompanyDetailIds,
} from "@/domains/app/lib/company-detail/read-model";

type CompanyPageProps = {
  params: Promise<{ companyId: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return listCompanyDetailIds().map((companyId) => ({ companyId }));
}

export async function generateMetadata({
  params,
}: CompanyPageProps): Promise<Metadata> {
  const { companyId } = await params;
  const view = getCompanyDetail(companyId);
  return { title: view?.company.name ?? "Company not found" };
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { companyId } = await params;
  const view = getCompanyDetail(companyId);
  if (!view) notFound();

  return <CompanyDetail view={view} />;
}
