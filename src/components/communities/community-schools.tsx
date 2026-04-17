import { FadeIn } from "@/components/motion/fade-in";
import type { Community } from "@/types/community";

interface CommunitySchoolsProps {
  community: Community;
}

interface SchoolCardProps {
  level: "Elementary School" | "Middle School" | "High School";
  name: string;
}

function SchoolCard({ level, name }: SchoolCardProps) {
  return (
    <article
      className="bg-card border border-border border-l-[3px] border-l-green-500 rounded-lg p-6"
      aria-label={`${level}: ${name}`}
    >
      <p className="text-xs font-bold uppercase tracking-[0.05em] text-muted-foreground font-[family-name:var(--font-montserrat)] mb-2">
        {level}
      </p>
      <p className="text-base font-bold font-[family-name:var(--font-montserrat)] text-foreground">
        {name}
      </p>
    </article>
  );
}

export function CommunitySchools({ community }: CommunitySchoolsProps) {
  const { school_elementary, school_middle, school_high, school_district } = community;

  // Return null if all school fields are null
  if (!school_elementary && !school_middle && !school_high) {
    return null;
  }

  return (
    <FadeIn>
      <section
        className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8"
        aria-label="Schools"
      >
        <h2 className="text-[28px] font-bold font-[family-name:var(--font-playfair-display)] text-foreground mb-2">
          Schools
        </h2>

        {school_district && (
          <p className="text-base font-[family-name:var(--font-montserrat)] text-muted-foreground mb-6">
            {school_district} School District
          </p>
        )}

        <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${!school_district ? "mt-6" : ""}`}>
          {school_elementary && (
            <SchoolCard level="Elementary School" name={school_elementary} />
          )}
          {school_middle && (
            <SchoolCard level="Middle School" name={school_middle} />
          )}
          {school_high && (
            <SchoolCard level="High School" name={school_high} />
          )}
        </div>
      </section>
    </FadeIn>
  );
}
