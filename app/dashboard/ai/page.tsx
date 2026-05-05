import { Sparkle } from "@phosphor-icons/react/ssr";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function AIPage() {
  return (
    <main className="px-6 pt-12">
      <section className="mx-auto flex w-full max-w-md flex-col text-center">
        <div className="flex flex-col items-start text-left">
          <h1 className="text-2xl font-bold tracking-tight text-fleent-ink">AI</h1>
          <p className="mt-1 text-sm tracking-wide text-fleent-mute">
            Smart task suggestions and summaries.
          </p>
        </div>

        <Empty className="gap-3! px-0 py-12">
          <EmptyHeader>
            <EmptyMedia className="text-fleent-orange">
              <Sparkle size={32} weight="fill" />
            </EmptyMedia>
            <EmptyTitle className="text-lg font-bold tracking-tight text-fleent-ink">
              AI workspace coming soon.
            </EmptyTitle>
            <EmptyDescription className="text-fleent-body tracking-wide text-fleent-mute">
              Plan your day with AI-generated priorities, breakdowns, and momentum boosts.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent />
        </Empty>
      </section>
    </main>
  );
}
