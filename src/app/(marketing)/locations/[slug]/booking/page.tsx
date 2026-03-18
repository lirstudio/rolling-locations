import { notFound } from "next/navigation";
import { fetchLocationBySlug } from "@/app/actions/locations";
import { BookingForm } from "./booking-form";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function BookingSummaryPage({ params }: Props) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const location = await fetchLocationBySlug(decodedSlug);

  if (!location) {
    notFound();
  }

  return <BookingForm slug={decodedSlug} initialLocation={location} />;
}
