import { currentStudy, studyTopics, weeklySchedule } from '../content/bibleStudy'
import { groups } from '../content/community'
import { missionRegions, missionStories } from '../content/mission'
import { resources } from '../content/resources'
import { testimonials } from '../content/testimonials'
import type { BibleStudy, Group, MissionRegion, MissionStory, Resource, ScheduleItem, StudyTopic, Testimonial } from '../types'
import { http, isContentApiConfigured } from './http'

/**
 * Read-only content. Swap each local source for a CMS/API call by setting
 * VITE_API_BASE_URL — components consume these functions, not the files.
 */
const fromApiOr = <T>(path: string, local: T) => (isContentApiConfigured ? http.get<T>(path) : Promise.resolve(local))

export const contentService = {
  currentStudy: () => fromApiOr<BibleStudy>('/bible-studies/current', currentStudy),
  studyTopics: () => fromApiOr<StudyTopic[]>('/bible-studies/topics', studyTopics),
  studySchedule: () => fromApiOr<ScheduleItem[]>('/bible-studies/schedule', weeklySchedule),
  groups: () => fromApiOr<Group[]>('/groups', groups),
  resources: () => fromApiOr<Resource[]>('/resources', resources),
  testimonials: () => fromApiOr<Testimonial[]>('/testimonials', testimonials),
  missionRegions: () => fromApiOr<MissionRegion[]>('/mission/regions', missionRegions),
  missionStories: () => fromApiOr<MissionStory[]>('/mission/stories', missionStories),
}
