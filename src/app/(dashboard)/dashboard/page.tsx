import { SectionCards } from "./components/section-cards"

export default function DashboardPage() {
  return (
    <>
      <div className="px-4 lg:px-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">לוח בקרה</h1>
          <p className="text-muted-foreground">סקירה כללית של המערכת</p>
        </div>
      </div>

      <div className="px-4 lg:px-6">
        <SectionCards />
      </div>
    </>
  )
}
