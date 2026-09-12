import type { Metadata } from 'next';

import ProjectsBrowser from '@/components/ProjectsBrowser';
import { PROJECTS } from '@/content/projects';

export const metadata: Metadata = {
  title: 'Projects',
  description:
    'Personal work on GitHub plus one design-system case study spanning three generations of a component library.',
};

export default function ProjectsPage() {
  return <ProjectsBrowser projects={PROJECTS} />;
}
