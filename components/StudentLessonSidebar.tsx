import { BookOpen, Check, Sparkles, Target, TrendingUp } from "lucide-react";
import { grammarTargets, travelMilestones, vocabularyTargets } from "@/lib/travel-challenge";

type StudentLessonSidebarProps = {
  vocabulary: string[];
  grammar: string[];
  milestones: number[];
};

export function StudentLessonSidebar({ vocabulary, grammar, milestones }: StudentLessonSidebarProps) {
  return (
    <aside className="student-learning-sidebar" aria-label="Lesson guidance and progress">
      <section className="learning-card learning-card--goal">
        <h2><Target size={19} /> Your goal</h2>
        <p>Discover the traveler&apos;s priorities, recommend a destination, and adapt when their plans change.</p>
      </section>

      <section className="learning-card">
        <h2><BookOpen size={19} /> Try these words</h2>
        <div className="word-cloud">
          {vocabularyTargets.map((word) => {
            const demonstrated = vocabulary.includes(word);
            return <span className={demonstrated ? "used" : ""} key={word}>{word}{demonstrated && <Check size={13} />}</span>;
          })}
        </div>
      </section>

      <section className="learning-card">
        <h2><Sparkles size={19} /> Grammar focus</h2>
        {grammarTargets.map((item) => <EvidenceLine key={item} label={item} done={grammar.includes(item)} />)}
      </section>

      <section className="learning-card">
        <div className="learning-card-title">
          <h2><TrendingUp size={19} /> Lesson progress</h2>
          <small>{milestones.length} of 4</small>
        </div>
        <div className="lesson-segments" aria-label={`${milestones.length} of 4 lesson milestones demonstrated`}>
          {travelMilestones.map((_, index) => <span className={milestones.includes(index + 1) ? "done" : ""} key={index} />)}
        </div>
        {travelMilestones.map((item, index) => <EvidenceLine key={item} label={`${index + 1}. ${item}`} done={milestones.includes(index + 1)} />)}
      </section>
    </aside>
  );
}

function EvidenceLine({ label, done }: { label: string; done: boolean }) {
  return <div className={`learning-check ${done ? "done" : ""}`}><span>{done && <Check size={13} />}</span>{label}</div>;
}
